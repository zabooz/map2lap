import {prepareGroundArrays,regionalGroundWeights,compactGroundWeights,type RegionalGroundWeights,type GroundArrayInput,type GroundTextureArray,type PreparedGroundArrays} from "./groundArray";

export type GroundProbeMode = "colour" | "normal" | "roughness" | "lit";
export interface GroundProbeRegion {bounds: [number, number, number, number]; palette: string[]}

const vertex = `#version 300 es
out vec2 uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/** Shader capacity follows the actual palette; persistent edit data has no shader-slot count. Pure. */
function fragment(count: number) {
  return `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
in vec2 uv;
out vec4 result;
uniform sampler2DArray weightsMap, colourMap, normalMap, roughnessMap, weightsTail;
uniform vec4 materialInfo[${count}], mapInfo[${count}], extraInfo[${count}], samplingInfo[${count}];
uniform int palette[${count}], nearIndices[${count}], activeCount, mode, regional, splitLevel;
uniform vec2 extent;
uniform vec4 noiseFrame;
uniform vec2 originalWeightSize;
uniform vec4 weightFrame;
uniform vec3 baseColour;

vec3 unit(vec3 v) {
  float maximum = max(max(abs(v.x), abs(v.y)), abs(v.z));
  return maximum > 0.0 ? normalize(v / maximum) : vec3(0.0, 0.0, 1.0);
}
ivec2 locate(ivec2 p, ivec2 size, bool repeatMap) {
  return repeatMap ? (p % size + size) % size : clamp(p, ivec2(0), size - 1);
}
vec4 bilinear(sampler2DArray image, vec2 at, int layer, int level, ivec2 size, bool repeatMap) {
  vec2 pixel = at * vec2(size) - 0.5;
  ivec2 p = ivec2(floor(pixel));
  vec2 fraction = fract(pixel);
  vec4 a = texelFetch(image, ivec3(locate(p, size, repeatMap), layer), level);
  vec4 b = texelFetch(image, ivec3(locate(p + ivec2(1, 0), size, repeatMap), layer), level);
  vec4 c = texelFetch(image, ivec3(locate(p + ivec2(0, 1), size, repeatMap), layer), level);
  vec4 d = texelFetch(image, ivec3(locate(p + ivec2(1, 1), size, repeatMap), layer), level);
  return mix(mix(a, b, fraction.x), mix(c, d, fraction.x), fraction.y);
}
vec4 atLod(sampler2DArray image, vec2 at, int layer, vec2 size, bool repeatMap, float level) {
  float lod = clamp(level, 0.0, floor(log2(max(size.x, size.y))));
  int first = int(floor(lod));
  int second = int(ceil(lod));
  ivec2 small = max(ivec2(1), ivec2(floor(size / exp2(float(first)))));
  ivec2 smaller = max(ivec2(1), ivec2(floor(size / exp2(float(second)))));
  return mix(bilinear(image, at, layer, first, small, repeatMap),
             bilinear(image, at, layer, second, smaller, repeatMap), fract(lod));
}
vec4 filtered(sampler2DArray image, vec2 at, vec2 dx, vec2 dy, int layer, vec2 size, bool repeatMap) {
  float footprint = max(length(dx * size), length(dy * size));
  return atLod(image,at,layer,size,repeatMap,log2(max(1.0,footprint)));
}
float hashCell(ivec2 p) {
  uvec2 q = uvec2(p & ivec2(65535));
  uint h = q.x * 374761393u + q.y * 668265263u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  return float((h ^ (h >> 16u)) >> 8u) / 16777216.0;
}
float noise(vec2 p, vec2 seed) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  ivec2 cell = ivec2(i) + ivec2(noiseFrame.zw) + ivec2(seed);
  vec4 h = vec4(hashCell(cell),hashCell(cell+ivec2(1,0)),hashCell(cell+ivec2(0,1)),hashCell(cell+ivec2(1,1)));
  return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);
}
vec3 light(vec3 colour, vec3 n, float rough) {
  vec3 l = unit(vec3(0.3, 0.4, 1.0)), v = vec3(0.0, 0.0, 1.0), h = unit(l+v);
  float nl = max(0.0, dot(n,l)), nv = max(0.0001, dot(n,v)), nh = max(0.0, dot(n,h));
  // A finite light/pixel footprint cannot represent a zero-width specular lobe.
  float a = max(0.04, rough); a *= a;
  float a2 = a*a, denominator = nh*nh*(a2-1.0)+1.0;
  float distribution = a2 / max(0.000001, 3.14159265359*denominator*denominator);
  float k = (rough+1.0)*(rough+1.0)/8.0;
  float geometry = (nv/(nv*(1.0-k)+k))*(nl/(nl*(1.0-k)+k));
  float fresnel = 0.04+0.96*pow(1.0-max(0.0,dot(h,v)),5.0);
  float specular = distribution*geometry*fresnel/max(0.0001,4.0*nv*nl);
  return colour*0.12 + (colour*0.96/3.14159265359+vec3(specular))*nl*2.0;
}
vec3 srgb(vec3 colour) {
  return mix(12.92*colour,1.055*pow(max(colour,vec3(0.0)),vec3(1.0/2.4))-0.055,
             step(vec3(0.0031308),colour));
}
void main() {
  vec2 local = uv*extent;
  vec2 worldDx=dFdx(local),worldDy=dFdy(local);
  vec2 weightDx=dFdx(uv),weightDy=dFdy(uv);
  float lod=log2(max(1.0,max(length(weightDx*originalWeightSize),length(weightDy*originalWeightSize))));
  float tailBlend=regional>0 ? clamp(lod-float(splitLevel),0.0,1.0) : 0.0;
  vec2 localUV=(uv*originalWeightSize-weightFrame.xy)/weightFrame.zw;
  vec3 colour = vec3(0.0), normal = vec3(0.0);
  float total = 0.0, roughness = 0.0;
  for (int j=0; j<${count}; j++) {
    if (j>=(tailBlend>0.0 ? ${count} : activeCount)) break;
    int layer=tailBlend>0.0 ? j : palette[j];
    int localLayer=tailBlend>0.0 ? nearIndices[layer] : j;
    if (regional==0) localLayer=layer;
    float nearWeight=0.0,farWeight=0.0;
    if (localLayer>=0 && tailBlend<1.0) nearWeight=atLod(weightsMap,localUV,localLayer,weightFrame.zw,false,
      regional>0 ? min(lod,float(splitLevel)) : lod).r;
    // During the first transition, blend local mip K with global mip K+1 exactly once.
    if (tailBlend>0.0) farWeight=atLod(weightsTail,uv,layer,vec2(textureSize(weightsTail,0).xy),false,max(1.0,lod-float(splitLevel))).r;
    float weight=mix(nearWeight,farWeight,tailBlend);
    vec4 info = materialInfo[layer], maps = mapInfo[layer], extra = extraInfo[layer], sampling = samplingInfo[layer];
    // The CPU reduces each origin modulo its repeat in double precision, keeping photo texels precise far from the anchor.
    vec2 at = local/info.xy + sampling.xy, dx = worldDx/info.xy, dy = worldDy/info.xy;
    // Gradients are computed before the branch and shared across translated samples and all maps.
    if (weight>0.0) {
      float blend = extra.z>0.5 ? noise(local/8.0+noiseFrame.xy,sampling.zw) : 0.0;
      vec2 shift = vec2(0.371,0.613);
      vec3 c = filtered(colourMap,at,dx,dy,layer,maps.xy,true).rgb;
      vec3 nm = extra.w>0.5 ? filtered(normalMap,at,dx,dy,layer,maps.zw,true).rgb : vec3(0.5,0.5,1.0);
      float r = filtered(roughnessMap,at,dx,dy,layer,extra.xy,true).r;
      if (extra.z>0.5) {
        c = mix(c,filtered(colourMap,at+shift,dx,dy,layer,maps.xy,true).rgb,blend);
        if (extra.w>0.5) nm = mix(nm,filtered(normalMap,at+shift,dx,dy,layer,maps.zw,true).rgb,blend);
        r = mix(r,filtered(roughnessMap,at+shift,dx,dy,layer,extra.xy,true).r,blend);
      }
      nm = unit((nm*2.0-1.0)*vec3(info.z,info.z,1.0));
      colour += weight*c;
      normal += weight*nm;
      roughness += weight*r*info.w;
      total += weight;
    }
  }
  float original = max(0.0,1.0-total), divisor = max(1.0,total);
  colour = (colour+original*baseColour)/divisor;
  normal = unit(normal+original*vec3(0,0,1));
  roughness = (roughness+original)/divisor;
  vec3 shown = mode==0 ? colour : mode==1 ? normal*0.5+0.5 : mode==2 ? vec3(roughness) : light(colour,normal,roughness);
  if (mode==0 || mode==3) shown=srgb(shown);
  result = vec4(shown,1.0);
}`;
}

/** Developer rendering probe. The production Editor/AC material path is deliberately not switched by this class. */
export class GroundArrayRenderer {
  readonly prepared: PreparedGroundArrays;
  readonly gl: WebGL2RenderingContext;
  readonly renderer: string;
  drawCalls = 0;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private textures: WebGLTexture[] = [];
  private ids: Map<string, number>;
  private frame: {width:number;height:number};
  private regional?:RegionalGroundWeights;
  private regionTextures:WebGLTexture[]=[];
  readonly regionalApplied:boolean;

  constructor(private canvas:HTMLCanvasElement,input:GroundArrayInput,options?:{regions:GroundProbeRegion[];splitLevel?:number}) {
    const gl = canvas.getContext("webgl2", {alpha: false, antialias: false, preserveDrawingBuffer: true});
    if (!gl) throw new Error("This browser cannot run the WebGL2 material-array probe");
    this.gl = gl;
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    this.renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    this.frame={width:input.width,height:input.height};
    const prepared=prepareGroundArrays(input),originalWeights=prepared.weights;
    const fullWeights=compactGroundWeights(originalWeights),size=(image:GroundTextureArray)=>image.levels.reduce((sum,level)=>sum+level.data.byteLength,0);
    const originalWeightBytes=size(originalWeights),weightBytes=size(fullWeights);
    if (options) {
      const candidate=regionalGroundWeights(originalWeights,options.regions.map(region=>region.bounds),Math.min(options.splitLevel??4,originalWeights.levels.length-1));
      candidate.tail=compactGroundWeights(candidate.tail);
      candidate.regions.forEach(region=>region.weights=compactGroundWeights(region.weights));
      candidate.bytes=size(candidate.tail)+candidate.regions.reduce((sum,region)=>sum+size(region.weights),0);
      if (candidate.bytes<weightBytes) this.regional=candidate;
    }
    this.regionalApplied=!!this.regional;
    this.prepared={...prepared,weights:this.regional?.tail??fullWeights,bytes:prepared.bytes-originalWeightBytes+(this.regional?.bytes??weightBytes)};
    this.ids = new Map(this.prepared.ids.map((id, k) => [id, k]));
    if (input.layers.length > Number(gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS))
        || 6*input.layers.length+16 > Number(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))) {
      throw new Error("This GPU cannot represent every material in the probe palette");
    }
    this.program = this.link(vertex, fragment(input.layers.length));
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.useProgram(this.program);
    const arrays = [this.prepared.weights, this.prepared.colour, this.prepared.normal, this.prepared.roughness];
    arrays.forEach((image, k) => this.upload(image, k));
    if (this.regional) {
      this.upload(this.regional.tail,4);
      this.regionTextures=this.regional.regions.map(region=>this.upload(region.weights,0));
      // The tail has one allocation, shared by every local material group.
      gl.deleteTexture(this.textures[0]);
    } else {
      gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.textures[0]);
    }
    ["weightsMap", "colourMap", "normalMap", "roughnessMap"].forEach((name, k) => gl.uniform1i(this.uniform(name), k));
    gl.uniform1i(this.uniform("weightsTail"),4);
    gl.uniform1i(this.uniform("regional"),Number(!!this.regional));
    gl.uniform1i(this.uniform("splitLevel"),this.regional?.splitLevel??0);
    gl.uniform2f(this.uniform("originalWeightSize"),input.width,input.height);
    gl.uniform4fv(this.uniform("materialInfo[0]"), this.prepared.materialInfo);
    gl.uniform4fv(this.uniform("mapInfo[0]"), this.prepared.mapInfo);
    gl.uniform4fv(this.uniform("extraInfo[0]"), this.prepared.extraInfo);
    gl.uniform2fv(this.uniform("extent"), input.extent);
    const modulo=(value:number,period:number)=>((value%period)+period)%period;
    const sampling=new Float32Array(input.layers.length*4);
    input.layers.forEach((layer,k)=>{
      // Stable semantic ids seed the variation; disposable array/palette order never changes its appearance.
      let seed=2166136261;
      for(let j=0;j<layer.id.length;j++) seed=Math.imul(seed^layer.id.charCodeAt(j),16777619)>>>0;
      sampling.set([modulo(input.origin[0],layer.repeat[0])/layer.repeat[0],
        modulo(input.origin[1],layer.repeat[1])/layer.repeat[1],seed&65535,seed>>>16],k*4);
    });
    gl.uniform4fv(this.uniform("samplingInfo[0]"),sampling);
    // An 8 m smooth-noise lattice repeats after 65536 cells (524 km). Integer hashing retains exact shared tile cells.
    gl.uniform4fv(this.uniform("noiseFrame"),new Float32Array([
      modulo(input.origin[0],8)/8,modulo(input.origin[1],8)/8,
      modulo(Math.floor(input.origin[0]/8),65536),modulo(Math.floor(input.origin[1]/8),65536)]));
    gl.uniform3fv(this.uniform("baseColour"), input.base);
    this.check();
  }

  private uniform(name: string) { return this.gl.getUniformLocation(this.program, name); }
  private check() {
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) throw new Error(`Ground array WebGL error: 0x${error.toString(16)}`);
  }
  private link(vs: string, fs: string) {
    const gl = this.gl, shaders = [];
    const program = gl.createProgram()!;
    for (const [kind, text] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
      const shader = gl.createShader(kind)!;
      gl.shaderSource(shader, text); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Ground shader failed");
      gl.attachShader(program, shader); shaders.push(shader);
    }
    gl.linkProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Ground shader link failed");
    return program;
  }
  private upload(image: GroundTextureArray, slot: number) {
    const gl = this.gl, first = image.levels[0], texture = gl.createTexture()!;
    if (first.width > Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || first.height > Number(gl.getParameter(gl.MAX_TEXTURE_SIZE))) {
      throw new Error("The GPU cannot retain this material resolution");
    }
    this.textures.push(texture);
    gl.activeTexture(gl.TEXTURE0+slot); gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    const floating = first.data instanceof Float32Array,half=first.data instanceof Uint16Array;
    const format = image.channels === 1 ? gl.RED : gl.RGBA;
    const internal = floating ? gl.R32F : half ? gl.R16F : image.srgb ? gl.SRGB8_ALPHA8 : image.channels === 1 ? gl.R8 : gl.RGBA8;
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, image.levels.length, internal, first.width, first.height, first.depth);
    image.levels.forEach((level, j) => gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,j,0,0,0,level.width,level.height,level.depth,format,floating ? gl.FLOAT : half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,level.data));
    // texelFetch performs explicit wrapping and filtering, also on devices without float-linear support.
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LEVEL,image.levels.length-1);
    return texture;
  }

  render(width: number, height: number, mode: GroundProbeMode = "colour", regions?: GroundProbeRegion[]) {
    const gl = this.gl;
    this.canvas.width = width; this.canvas.height = height;
    gl.viewport(0,0,width,height); gl.useProgram(this.program); gl.bindVertexArray(this.vao);
    gl.uniform1i(this.uniform("mode"), ["colour", "normal", "roughness", "lit"].indexOf(mode));
    gl.enable(gl.SCISSOR_TEST);
    const areas=this.regional?this.regional.regions.map(region=>({bounds:region.bounds,palette:region.palette.map(k=>this.prepared.ids[k])}))
      :regions??[{bounds:[0,0,this.frame.width,this.frame.height],palette:this.prepared.ids}];
    this.drawCalls = 0;
    for (const [number,region] of areas.entries()) {
      const palette = region.palette.map(id => {
        const number = this.ids.get(id);
        if (number === undefined) throw new Error("A render palette refers to a missing material");
        return number;
      });
      if (new Set(palette).size !== palette.length) throw new Error("Repeated material in a render palette");
      const [x0,y0,x1,y1] = region.bounds;
      const left = Math.round(x0/this.frame.width*width), bottom = Math.round(y0/this.frame.height*height);
      const right = Math.round(x1/this.frame.width*width), top = Math.round(y1/this.frame.height*height);
      if (right<=left || top<=bottom) continue;
      gl.scissor(left,bottom,right-left,top-bottom);
      if (this.regional) {
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D_ARRAY,this.regionTextures[number]);
        gl.uniform4fv(this.uniform("weightFrame"),this.regional.regions[number].crop);
        const inverse=new Int32Array(this.prepared.ids.length).fill(-1);
        palette.forEach((source,k)=>inverse[source]=k);
        gl.uniform1iv(this.uniform("nearIndices[0]"),inverse);
      } else gl.uniform4f(this.uniform("weightFrame"),0,0,this.frame.width,this.frame.height);
      gl.uniform1iv(this.uniform("palette[0]"), new Int32Array(palette.length ? palette : [0]));
      gl.uniform1i(this.uniform("activeCount"), palette.length);
      gl.drawArrays(gl.TRIANGLES,0,3); this.drawCalls++;
    }
    gl.disable(gl.SCISSOR_TEST); gl.finish(); this.check();
  }

  pixels() {
    const pixels = new Uint8Array(this.canvas.width*this.canvas.height*4);
    this.gl.readPixels(0,0,this.canvas.width,this.canvas.height,this.gl.RGBA,this.gl.UNSIGNED_BYTE,pixels);
    this.check();
    return pixels;
  }
  dispose() {
    this.textures.forEach(texture => this.gl.deleteTexture(texture));
    this.gl.deleteVertexArray(this.vao); this.gl.deleteProgram(this.program);
  }
}
