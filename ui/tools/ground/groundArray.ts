import {DataUtils} from "three";

/** Render-prototype inputs use semantic material ids, independently repeated maps and unrestricted weight slices. */
export interface GroundMap {width: number; height: number; data: Uint8Array}
export interface GroundArrayLayer {
  id: string;
  colour: GroundMap;
  normal?: GroundMap;
  roughness?: GroundMap;
  repeat: [number, number];
  variation?: boolean;
  normalScale?: number;
  roughnessFactor?: number;
}
export interface GroundArrayInput {
  width: number; height: number;
  weights: Float32Array; // Layer-major, bottom row first; the original ground is the unclaimed weight.
  layers: GroundArrayLayer[];
  extent: [number, number]; origin: [number, number]; base: [number, number, number];
}
export interface GroundLevel {width: number; height: number; depth: number; data: Uint8Array | Uint16Array | Float32Array}
export interface GroundTextureArray {levels: GroundLevel[]; channels: number; srgb: boolean}
export interface PreparedGroundArrays {
  ids: string[]; bytes: number;
  weights: GroundTextureArray; colour: GroundTextureArray; normal: GroundTextureArray; roughness: GroundTextureArray;
  materialInfo: Float32Array; mapInfo: Float32Array; extraInfo: Float32Array;
}
export interface RegionalGroundWeights {
  tail: GroundTextureArray; bytes: number; splitLevel: number;
  regions: {bounds: [number,number,number,number]; crop: [number,number,number,number]; palette: number[]; weights: GroundTextureArray}[];
}

const linear = (v: number) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
const srgb = (v: number) => v <= .0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - .055;
const validFloat = (v: number) => Number.isFinite(v) && Number.isFinite(Math.fround(v));
const defaultNormal: GroundMap = {width: 1, height: 1, data: new Uint8Array([128, 128, 255, 255])};
const defaultRoughness: GroundMap = {width: 1, height: 1, data: new Uint8Array([255, 255, 255, 255])};

function validate(input: GroundArrayInput) {
  const {width, height, layers, weights} = input;
  if (![width, height].every(v => Number.isSafeInteger(v) && v > 0) || !layers.length
      || weights.length !== width * height * layers.length) throw new Error("Invalid ground weight dimensions");
  if (weights.some(v => !Number.isFinite(v) || v < 0 || v > 1)) throw new Error("Invalid ground material weights");
  if (new Set(layers.map(layer => layer.id)).size !== layers.length || layers.some(layer => !layer.id)) throw new Error("Duplicate or empty material id");
  if (!input.extent.every(v => validFloat(v) && v > 0) || !input.origin.every(validFloat)
      || !input.base.every(v => Number.isFinite(v) && v >= 0 && v <= 1)) throw new Error("Invalid ground frame or base colour");
  for (const layer of layers) {
    if (!layer.repeat.every(v => validFloat(v) && v > 0) || !validFloat(layer.normalScale ?? 1) || (layer.normalScale ?? 1) < 0
        || !validFloat(layer.roughnessFactor ?? 1) || (layer.roughnessFactor ?? 1) < 0 || (layer.roughnessFactor ?? 1) > 1) {
      throw new Error("Invalid ground material scale or roughness");
    }
    for (const image of [layer.colour, layer.normal, layer.roughness]) if (image) {
      if (![image.width, image.height].every(v => Number.isSafeInteger(v) && v > 0) || image.data.length !== image.width * image.height * 4) {
        throw new Error("Invalid ground material image");
      }
    }
    for (let k = 3; k < layer.colour.data.length; k += 4) if (layer.colour.data[k] !== 255) throw new Error("Ground colour must be opaque");
  }
}

/** Box-filter every independent channel, including all edge pixels at odd dimensions. Pure. */
function smaller(data: Uint8Array | Float32Array, width: number, height: number, channels: number, colour: boolean) {
  const w = Math.max(1, width >> 1), h = Math.max(1, height >> 1);
  const out = data instanceof Float32Array ? new Float32Array(w * h * channels) : new Uint8Array(w * h * channels);
  const sx = width / w, sy = height / h, area = sx * sy;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < channels; c++) {
    let value = 0;
    for (let j = Math.floor(y * sy); j < Math.ceil((y + 1) * sy); j++) {
      const wy = Math.max(0, Math.min(j + 1, (y + 1) * sy) - Math.max(j, y * sy));
      for (let i = Math.floor(x * sx); i < Math.ceil((x + 1) * sx); i++) {
        const wx = Math.max(0, Math.min(i + 1, (x + 1) * sx) - Math.max(i, x * sx));
        const sample = data[(j * width + i) * channels + c];
        value += (colour && c < 3 ? linear(sample / 255) : sample) * wx * wy;
      }
    }
    const filtered = value / area;
    out[(y * w + x) * channels + c] = out instanceof Float32Array ? filtered
      : Math.round(colour && c < 3 ? srgb(filtered) * 255 : filtered);
  }
  return {width: w, height: h, data: out};
}

function weightArray(input: GroundArrayInput): GroundTextureArray {
  const levels: GroundLevel[] = [{width: input.width, height: input.height, depth: input.layers.length, data: input.weights.slice()}];
  while (levels.at(-1)!.width > 1 || levels.at(-1)!.height > 1) {
    const last = levels.at(-1)!, slices = [];
    for (let k = 0; k < last.depth; k++) {
      slices.push(smaller((last.data as Float32Array).subarray(k * last.width * last.height, (k + 1) * last.width * last.height), last.width, last.height, 1, false));
    }
    const {width, height} = slices[0], data = new Float32Array(width * height * last.depth);
    slices.forEach((slice, k) => data.set(slice.data, k * width * height));
    levels.push({width, height, depth: last.depth, data});
  }
  return {levels, channels: 1, srgb: false};
}

function mapArray(images: GroundMap[], channels: number, colour: boolean): GroundTextureArray {
  const levels: GroundLevel[] = [];
  let width = Math.max(...images.map(image => image.width)), height = Math.max(...images.map(image => image.height));
  let sources = images.map(image => channels === 4 ? {...image, data: image.data as Uint8Array | Float32Array}
    : {width: image.width, height: image.height, data: Uint8Array.from({length: image.width * image.height}, (_, k) => image.data[k * 4]) as Uint8Array | Float32Array});
  for (;;) {
    const data = new Uint8Array(width * height * images.length * channels);
    // Keep each source at its own resolution. The sampler wraps within that source's bounds, never through array padding.
    sources.forEach((source, k) => {
      for (let y = 0; y < source.height; y++) {
        data.set(source.data.subarray(y * source.width * channels, (y + 1) * source.width * channels), (k * width * height + y * width) * channels);
      }
    });
    levels.push({width, height, depth: images.length, data});
    if (width === 1 && height === 1) break;
    width = Math.max(1, width >> 1); height = Math.max(1, height >> 1);
    sources = sources.map(source => source.width === 1 && source.height === 1 ? source
      : smaller(source.data, source.width, source.height, channels, colour));
  }
  return {levels, channels, srgb: colour};
}

/** Prepare complete arrays/mips without dropping contributions or tying saved assignments to a shader palette. Pure. */
export function prepareGroundArrays(input: GroundArrayInput): PreparedGroundArrays {
  validate(input);
  const weights = weightArray(input), colour = mapArray(input.layers.map(layer => layer.colour), 4, true);
  const normal = mapArray(input.layers.map(layer => layer.normal ?? defaultNormal), 4, false);
  const roughness = mapArray(input.layers.map(layer => layer.roughness ?? defaultRoughness), 1, false);
  const materialInfo = new Float32Array(input.layers.length * 4), mapInfo = materialInfo.slice(), extraInfo = materialInfo.slice();
  input.layers.forEach((layer, k) => {
    materialInfo.set([...layer.repeat, layer.normalScale ?? 1, layer.roughnessFactor ?? 1], k * 4);
    mapInfo.set([layer.colour.width, layer.colour.height, (layer.normal ?? defaultNormal).width, (layer.normal ?? defaultNormal).height], k * 4);
    extraInfo.set([(layer.roughness ?? defaultRoughness).width, (layer.roughness ?? defaultRoughness).height, Number(!!layer.variation), Number(!!layer.normal)], k * 4);
  });
  return {ids: input.layers.map(layer => layer.id), weights, colour, normal, roughness, materialInfo, mapInfo, extraInfo,
    bytes: [weights, colour, normal, roughness].reduce((total, image) => total + image.levels.reduce((n, level) => n + level.data.byteLength, 0), 0)};
}

/** Exact aligned local mip prefixes plus a shared complete coarse tail. No material is removed from the tail. Pure. */
export function regionalGroundWeights(source:GroundTextureArray,bounds:[number,number,number,number][],splitLevel:number):RegionalGroundWeights {
  const first=source.levels[0];
  if (source.channels!==1 || !(first.data instanceof Float32Array) || !Number.isInteger(splitLevel) || splitLevel<0
      || splitLevel>=source.levels.length || !bounds.length || (first.width & (first.width-1)) || (first.height & (first.height-1))) {
    throw new Error("Regional weight prefixes require power-of-two float fields and a valid mip split");
  }
  for (const area of bounds) {
    const [x0,y0,x1,y1]=area;
    if (![x0,y0,x1,y1].every(Number.isFinite) || x0<0 || y0<0 || x1>first.width || y1>first.height || x1<=x0 || y1<=y0) {
      throw new Error("Invalid ground render bounds");
    }
  }
  // Limit a prefix's filter border to one quarter of the smallest region; the complete tail handles larger footprints.
  const minimum=Math.min(...bounds.map(([x0,y0,x1,y1])=>Math.min(x1-x0,y1-y0)));
  splitLevel=Math.min(splitLevel,Math.max(0,Math.floor(Math.log2(minimum/8))));
  const quantum=2**splitLevel,halo=2*quantum;
  const tail={...source,levels:source.levels.slice(splitLevel)};
  const regions=bounds.map(area=>{
    const [x0,y0,x1,y1]=area;
    // The extra footprint also covers rasterized pixels rounded across a source-region edge.
    const left=Math.max(0,Math.floor((x0-halo)/quantum)*quantum),bottom=Math.max(0,Math.floor((y0-halo)/quantum)*quantum);
    const right=Math.min(first.width,Math.ceil((x1+halo)/quantum)*quantum),top=Math.min(first.height,Math.ceil((y1+halo)/quantum)*quantum);
    const palette:number[]=[];
    for (let k=0;k<first.depth;k++) {
      let on=false;
      for (let y=bottom;y<top && !on;y++) for (let x=left;x<right;x++) if (first.data[k*first.width*first.height+y*first.width+x]>0) {on=true;break;}
      if (on) palette.push(k);
    }
    const levels:GroundLevel[]=[];
    for (let level=0;level<=splitLevel;level++) {
      const image=source.levels[level],scale=2**level,width=(right-left)/scale,height=(top-bottom)/scale;
      // A base-only region keeps a single zero slice, but its semantic palette remains empty.
      const data=new Float32Array(width*height*Math.max(1,palette.length));
      palette.forEach((original,k)=>{
        for (let y=0;y<height;y++) {
          const start=original*image.width*image.height+(bottom/scale+y)*image.width+left/scale;
          data.set(image.data.subarray(start,start+width),k*width*height+y*width);
        }
      });
      levels.push({width,height,depth:Math.max(1,palette.length),data});
    }
    return {bounds:area,crop:[left,bottom,right-left,top-bottom] as [number,number,number,number],palette,
      weights:{levels,channels:1,srgb:false}};
  });
  const bytes=[tail,...regions.map(region=>region.weights)].reduce((sum,image)=>sum+image.levels.reduce((n,level)=>n+level.data.byteLength,0),0);
  return {tail,regions,bytes,splitLevel};
}

/** Use standard half-float GPU storage only when every positive contribution remains representable. Pure. */
export function compactGroundWeights(source:GroundTextureArray):GroundTextureArray {
  if (source.channels!==1 || source.levels.some(level=>!(level.data instanceof Float32Array))) throw new Error("Expected float weight fields");
  const levels:GroundLevel[]=[];
  for (const level of source.levels) {
    const data=new Uint16Array(level.data.length);
    for (let k=0;k<data.length;k++) {
      data[k]=DataUtils.toHalfFloat(level.data[k]);
      if (level.data[k]>0 && data[k]===0) return source;
    }
    levels.push({...level,data});
  }
  return {...source,levels};
}
