//! Bounded FBX/OBJ decoding in a separate process. Files referenced by a model are never opened here.
use serde_json::{json, Value};
use std::{collections::HashMap, env, fs, path::Path};

type Result<T> = std::result::Result<T, String>;
const MAX_BYTES: usize = 128 << 20;
const MAX_VERTICES: usize = 2_000_000;
const MAX_TRIANGLES: usize = 2_000_000;

#[derive(Default)]
struct Output {
    binary: Vec<u8>,
    views: Vec<Value>,
    accessors: Vec<Value>,
    embedded: HashMap<u32, String>,
}

impl Output {
    fn attribute(&mut self, data: &[f32], width: usize) -> Result<usize> {
        if data.iter().any(|v| !v.is_finite()) {
            return Err("Non-finite model coordinates".into());
        }
        let offset = self.binary.len();
        for value in data {
            self.binary.extend_from_slice(&value.to_le_bytes());
        }
        if self.binary.len() > MAX_BYTES {
            return Err("Converted geometry exceeds 128 MB".into());
        }
        let view = self.views.len();
        self.views
            .push(json!({"buffer": 0, "byteOffset": offset, "byteLength": data.len() * 4}));
        let accessor = self.accessors.len();
        let mut info = json!({"bufferView": view, "componentType": 5126, "count": data.len() / width,
                              "type": if width == 3 { "VEC3" } else { "VEC2" }});
        if width == 3 {
            let mut low = vec![f32::INFINITY; 3];
            let mut high = vec![f32::NEG_INFINITY; 3];
            for point in data.chunks_exact(3) {
                for axis in 0..3 {
                    low[axis] = low[axis].min(point[axis]);
                    high[axis] = high[axis].max(point[axis]);
                }
            }
            info["min"] = json!(low);
            info["max"] = json!(high);
        }
        self.accessors.push(info);
        Ok(accessor)
    }

    fn texture(&mut self, map: &ufbx::MaterialMap, directory: &Path) -> Result<Value> {
        let Some(texture) = map.texture.as_ref().filter(|_| map.texture_enabled) else {
            return Ok(Value::Null);
        };
        if !texture.layers.is_empty() || texture.has_uv_transform {
            return Err(
                "Layered textures and texture transforms need to be baked before import".into(),
            );
        }
        let props = &texture.element.props;
        if ["s", "o", "t"]
            .iter()
            .any(|name| props.find_prop(name).is_some())
        {
            return Err("Bake OBJ texture scale, offset and turbulence before importing".into());
        }
        // ufbx retains MTL's -clamp option as a property instead of filling the FBX wrap fields.
        let obj_clamp = props
            .find_prop("clamp")
            .is_some_and(|p| p.value_str.as_ref().eq_ignore_ascii_case("on"));
        let id = texture.element.typed_id;
        let mut source = json!({"path": texture.relative_filename.as_ref(), "fallback": texture.filename.as_ref()});
        source["wrap"] = json!([
            if obj_clamp || texture.wrap_u == ufbx::WrapMode::Clamp {
                33071
            } else {
                10497
            },
            if obj_clamp || texture.wrap_v == ufbx::WrapMode::Clamp {
                33071
            } else {
                10497
            }
        ]);
        if !texture.content.is_empty() {
            let name = if let Some(name) = self.embedded.get(&id) {
                name.clone()
            } else {
                if texture.content.len() > MAX_BYTES {
                    return Err("Embedded image exceeds 128 MB".into());
                }
                let name = format!("embedded-{id}.bin");
                fs::write(directory.join(&name), texture.content.as_ref())
                    .map_err(|e| e.to_string())?;
                self.embedded.insert(id, name.clone());
                name
            };
            source["embedded"] = json!(name);
        }
        Ok(source)
    }
}

fn scalar(map: &ufbx::MaterialMap, default: f64) -> f64 {
    if map.has_value {
        map.value_vec4.x
    } else {
        default
    }
}

fn material(material: &ufbx::Material, output: &mut Output, directory: &Path) -> Result<Value> {
    let pbr = &material.pbr;
    let fbx = &material.fbx;
    let colour = if pbr.base_color.has_value || pbr.base_color.texture.is_some() {
        &pbr.base_color
    } else {
        &fbx.diffuse_color
    };
    let factor = if pbr.base_factor.has_value {
        scalar(&pbr.base_factor, 1.)
    } else {
        scalar(&fbx.diffuse_factor, 1.)
    };
    let value = colour.value_vec4;
    let rgb = if colour.has_value {
        [value.x * factor, value.y * factor, value.z * factor]
    } else {
        [1.; 3]
    };
    let alpha = scalar(&pbr.opacity, 1. - scalar(&fbx.transparency_factor, 0.)).clamp(0., 1.);
    let normal = if pbr.normal_map.texture.is_some() {
        &pbr.normal_map
    } else {
        &fbx.normal_map
    };
    let roughness = scalar(
        &pbr.roughness,
        (2. / (scalar(&fbx.specular_exponent, 0.) + 2.)).sqrt(),
    )
    .clamp(0., 1.);
    let mut maps = json!({});
    for (name, map) in [
        ("colour", colour),
        ("normal", normal),
        ("opacity", &pbr.opacity),
        ("roughness", &pbr.roughness),
        ("metallic", &pbr.metalness),
        ("emissive", &pbr.emission_color),
    ] {
        let source = output.texture(map, directory)?;
        if !source.is_null() {
            maps[name] = source;
        }
    }
    let bump = fbx.bump.texture.is_some();
    Ok(
        json!({"name": material.element.name.as_ref(), "doubleSided": material.features.double_sided.enabled,
        "pbrMetallicRoughness": {"baseColorFactor": [rgb[0], rgb[1], rgb[2], alpha],
            "metallicFactor": scalar(&pbr.metalness, 0.).clamp(0., 1.), "roughnessFactor": roughness},
        "extras": {"importMaps": maps, "bumpMap": bump}}),
    )
}

fn mesh(
    mesh: &ufbx::Mesh,
    node: &ufbx::Node,
    output: &mut Output,
    vertices: &mut usize,
) -> Result<Value> {
    if mesh.vertex_color.exists
        && mesh
            .vertex_color
            .values
            .iter()
            .any(|c| c.x != 1. || c.y != 1. || c.z != 1. || c.w != 1.)
    {
        return Err("Bake vertex colours into a colour texture before importing this model".into());
    }
    let mut primitives = Vec::new();
    for part in &mesh.material_parts {
        if part.num_triangles == 0 {
            continue;
        }
        let mut positions = Vec::new();
        let mut normals = Vec::new();
        let mut uvs = Vec::new();
        let mut triangles = Vec::new();
        // Triangle corners retain hard normals and UV seams. The existing GLB path owns shared instance geometry.
        for &face in &part.face_indices {
            let face = mesh.faces[face as usize];
            if face.num_indices > 65_536 {
                return Err("A polygon has too many corners".into());
            }
            ufbx::triangulate_face_vec(&mut triangles, mesh, face);
            for &corner in &triangles {
                let i = corner as usize;
                let p = mesh.vertex_position[i];
                positions.extend([p.x as f32, p.y as f32, p.z as f32]);
                let n = mesh.vertex_normal[i];
                normals.extend([n.x as f32, n.y as f32, n.z as f32]);
                let uv = if mesh.vertex_uv.exists {
                    mesh.vertex_uv[i]
                } else {
                    ufbx::Vec2::default()
                };
                // FBX and OBJ use bottom-left texture V; glTF uses top-left V.
                uvs.extend([uv.x as f32, (1. - uv.y) as f32]);
            }
        }
        *vertices += positions.len() / 3;
        if *vertices > MAX_VERTICES {
            return Err("Converted model exceeds two million vertices".into());
        }
        let position = output.attribute(&positions, 3)?;
        let normal = output.attribute(&normals, 3)?;
        let uv = output.attribute(&uvs, 2)?;
        let mut primitive =
            json!({"attributes": {"POSITION": position, "NORMAL": normal, "TEXCOORD_0": uv}});
        let index = part.index as usize;
        if index < node.materials.len() {
            primitive["material"] = json!(node.materials[index].element.typed_id);
        }
        primitives.push(primitive);
    }
    Ok(json!({"name": mesh.element.name.as_ref(), "primitives": primitives}))
}

fn matrix(m: &ufbx::Matrix) -> [f64; 16] {
    [
        m.m00, m.m10, m.m20, 0., m.m01, m.m11, m.m21, 0., m.m02, m.m12, m.m22, 0., m.m03, m.m13,
        m.m23, 1.,
    ]
}

fn convert(input: &Path, mtl: &Path, directory: &Path) -> Result<()> {
    let data = fs::read(input).map_err(|e| e.to_string())?;
    if data.len() > MAX_BYTES {
        return Err("Choose a model up to 128 MB".into());
    }
    let mtl_data = fs::read(mtl).map_err(|e| e.to_string())?;
    let format = if input.extension().and_then(|x| x.to_str()) == Some("obj") {
        ufbx::FileFormat::Obj
    } else {
        ufbx::FileFormat::Fbx
    };
    let opts = ufbx::LoadOpts {
        file_format: format,
        load_external_files: false,
        generate_missing_normals: true,
        target_axes: ufbx::CoordinateAxes::right_handed_y_up(),
        target_unit_meters: 1.,
        obj_unit_meters: 1.,
        obj_axes: ufbx::CoordinateAxes::right_handed_y_up(),
        obj_mtl_data: mtl_data.as_slice().into(),
        node_depth_limit: 256,
        temp_allocator: ufbx::AllocatorOpts {
            memory_limit: 256 << 20,
            ..Default::default()
        },
        result_allocator: ufbx::AllocatorOpts {
            memory_limit: 256 << 20,
            ..Default::default()
        },
        ..Default::default()
    };
    let scene =
        ufbx::load_memory(&data, opts).map_err(|e| format!("Could not read model: {e:?}"))?;
    // Some exporters add a single constant key to every channel of an otherwise static scene.
    let moving = scene
        .anim_curves
        .iter()
        .any(|curve| curve.min_value != curve.max_value);
    if !scene.skin_deformers.is_empty() || !scene.blend_deformers.is_empty() || moving {
        return Err("Import a static model without skinning, animation or morph targets".into());
    }
    if scene.nodes.len() > 4096
        || scene.materials.len() > 4096
        || scene.meshes.len() > 4096
        || scene.textures.len() > 128
    {
        return Err("Model has too many nodes, meshes, materials or textures".into());
    }
    if scene.meshes.iter().map(|m| m.num_triangles).sum::<usize>() > MAX_TRIANGLES {
        return Err("Model exceeds two million triangles".into());
    }
    let mut output = Output::default();
    let mut materials = Vec::new();
    for m in &scene.materials {
        materials.push(material(m, &mut output, directory)?);
    }
    let mut meshes = Vec::new();
    let mut nodes = Vec::new();
    let mut cache = HashMap::new();
    let mut vertices = 0;
    for node in &scene.nodes {
        let Some(source) = &node.mesh else {
            continue;
        };
        if source.num_triangles == 0 {
            continue;
        }
        let key = (
            source.element.typed_id,
            node.materials
                .iter()
                .map(|m| m.element.typed_id)
                .collect::<Vec<_>>(),
        );
        let mesh_index = if let Some(&index) = cache.get(&key) {
            index
        } else {
            let index = meshes.len();
            meshes.push(mesh(source, node, &mut output, &mut vertices)?);
            cache.insert(key, index);
            index
        };
        nodes.push(json!({"name": node.element.name.as_ref(), "mesh": mesh_index, "matrix": matrix(&node.geometry_to_world)}));
    }
    if meshes.is_empty() {
        return Err("The model contains no triangle surfaces".into());
    }
    let document = json!({"asset": {"version": "2.0", "generator": "Map2Lap ufbx 0.11.5"},
        "buffers": [{"byteLength": output.binary.len()}], "bufferViews": output.views, "accessors": output.accessors,
        "materials": materials, "meshes": meshes, "scenes": [{"nodes": (0..nodes.len()).collect::<Vec<_>>()}], "scene": 0, "nodes": nodes});
    fs::write(directory.join("geometry.bin"), output.binary).map_err(|e| e.to_string())?;
    fs::write(
        directory.join("model.json"),
        serde_json::to_vec(&document).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    let args: Vec<_> = env::args_os().collect();
    if args.len() != 4 {
        eprintln!("Expected input, material data and output folder");
        std::process::exit(2);
    }
    if let Err(error) = convert(
        Path::new(&args[1]),
        Path::new(&args[2]),
        Path::new(&args[3]),
    ) {
        eprintln!("{error}");
        std::process::exit(1);
    }
}
