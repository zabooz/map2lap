"""Eager model context from 3d3cdd2: independent byte-equivalence oracle for the incremental implementation."""
import numpy as np
from app import modeldata, modelmesh
from app.trackmodels import compiled, resolve, light


def extend(ac, name, scan, objects, models):
    """Register model roots in the ordinary object list and derive each unique asset's real local geometry once."""
    inherited = compiled(ac, name, scan.get("model_source_path"))
    owned = set(inherited["meshes"]) if inherited else set()
    meshes = [{**m, "active": 0, "visible": 0, "renderable": 0} if m["name"] in owned else m for m in scan["meshes"]]
    if not models:
        return {**scan, "meshes": meshes, "models": [], "model_assets": {}, "model_parts": {}, "model_replacements": []}, objects
    assets, parts, listed = {}, {}, dict(objects)
    materials, resources, decoded, slots = list(scan["materials"]), {}, {}, {}
    present = {t[0] for t in scan["textures"]}
    for instance in models:
        asset = instance["asset"]
        if asset not in assets:
            folder, meta = resolve(ac, name, asset)
            model = modeldata.load((folder / "original/model.glb").read_bytes())
            decoded[asset] = model
            parts[asset] = modelmesh.geometry(model, meta)
            assets[asset] = {**meta, "url": f"/api/editor/{name}/model-asset/{asset}"}
            native, recipes = modelmesh.materials(model, asset, light(meta["category"]))
            slots[asset] = []
            for material in native:
                slot = next((i for i, previous in enumerate(materials) if previous.name == material.name
                             and any(p[0] == "m2lModelMaterial" and p[1] == 1 for p in previous.props)), None)
                # (a saved kn5's own slot keeps its number and takes the material as made now: an image made by an older
                # encoder is replaced, and Save drops it once no material uses it)
                if slot is None:
                    slot = len(materials); materials.append(material)
                else:
                    materials[slot] = material
                texture = next(n for map_slot, _number, n in material.maps if map_slot == "txDiffuse")
                if texture not in present:
                    resources[texture] = {**recipes[texture], "asset": asset}
                slots[asset].append(slot)
        meta = assets[asset]
        kind = {"tree": "tree", "bush": "bush", "building": "house"}.get(meta["category"], "model")
        listed[instance["id"]] = {"kinds": [kind], "sorts": [meta["name"]], "at": [instance["at"]],
                                   "parents": [-1], "faces": [[]], "details": [{"model": asset}]}
        for part in parts[asset]:
            vertices, faces = part["vertices"].copy(), part["faces"]
            vertices["pos"] *= instance.get("scale", 1)
            vertices["pos"] += instance["at"]
            material_number = part["material"] if part["material"] is not None else len(decoded[asset].materials)
            definition = decoded[asset].materials[material_number] if part["material"] is not None else {}
            double = definition.get("doubleSided", False)
            own = listed[instance["id"]]["faces"][0]

            def add(prefix, data, triangles, visible):
                center = (data["pos"].min(axis=0).astype(np.float64) + data["pos"].max(axis=0)) / 2
                own.append([len(meshes), 0, len(triangles)])
                meshes.append({"name": f"{prefix}m2l_model_{instance['id']}_{len(own) - 1}",
                    "material": slots[asset][material_number], "vertices": len(data), "indices": triangles.size,
                    "data": (data, triangles),
                    "model": {"instance": instance["id"], "asset": asset, "primitive": part["primitive"], "material": part["material"],
                              "at": instance["at"], "scale": instance.get("scale", 1)},
                    "active": 1, "visible": visible, "renderable": visible, "cast_shadows": visible,
                    "transparent": int(definition.get("alphaMode") == "BLEND"),
                    "layer": 0, "lod_in": 0., "lod_out": 1000., "center": center.tolist(),
                    "radius": float(np.linalg.norm(data["pos"] - center, axis=1).max())})
            # A double-sided material's faces are written once: CSP draws them from both sides (trackvariation). Collision keeps
            # both sides, as a back face of its own.
            for data, triangles in modelmesh.pieces(vertices, faces, definition.get("alphaMode") == "BLEND"):
                add("nocol_", data, triangles, 1)
                if instance["collision"] == "mesh" and not double:
                    add("1WALL_", data, triangles, 0)
            if instance["collision"] == "mesh" and double:
                back = vertices.copy(); back["normal"] *= -1
                for data, triangles in modelmesh.pieces(np.concatenate([vertices, back]), np.concatenate([faces, faces[:, ::-1] + len(vertices)])):
                    add("1WALL_", data, triangles, 0)
    names = {t[0] for t in scan["textures"]}
    textures = [*scan["textures"], *[(n, 0, recipe["bytes"]) for n, recipe in resources.items() if n not in names]]
    consumed = {m["id"]: m.get("replaces") for m in inherited["models"]} if inherited else {}
    replacements = [m["replaces"] for m in models if m.get("replaces") and consumed.get(m["id"]) != m["replaces"]]
    return {**scan, "meshes": meshes, "materials": materials, "textures": textures, "model_textures": resources,
            "models": models, "model_assets": assets, "model_parts": parts,
            "model_replacements": replacements,
            "model_heights": inherited.get("model_heights", {}) if inherited else {}}, listed

