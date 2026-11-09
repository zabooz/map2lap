import {expect, test} from "bun:test";
import {prepareGroundArrays, regionalGroundWeights, compactGroundWeights, type GroundArrayInput} from "./groundArray";

const colour = (r: number) => ({width: 2, height: 1, data: new Uint8Array([r, r, r, 255, 255-r, 255-r, 255-r, 255])});
const input = (count = 12): GroundArrayInput => ({
  width: 2, height: 2, weights: new Float32Array(4 * count).fill(.8 / count),
  extent: [256, 256], origin: [-256, 512], base: [.1, .2, .3],
  layers: Array.from({length: count}, (_, k) => ({id: `material-${k}`, repeat: [2 + k, 3], colour: colour(k * 10)})),
});

test("a dense twelve-material mixture retains every slice at every weight mip", () => {
  const data = input(), prepared = prepareGroundArrays(data);
  expect(prepared.ids).toEqual(data.layers.map(layer => layer.id));
  expect(prepared.weights.levels).toHaveLength(2);
  expect(prepared.weights.levels[1].depth).toBe(12);
  expect(prepared.weights.levels[1].data.length).toBe(12);
  for (const value of prepared.weights.levels[1].data) expect(value).toBeCloseTo(.8/12, 6);
  expect(prepared.bytes).toBeGreaterThan(prepared.weights.levels[0].data.byteLength);
});

test("colour mips filter sRGB as linear light; independent roughness stays data", () => {
  const data = input(1);
  data.layers[0].colour = colour(0);
  data.layers[0].roughness = {width: 2, height: 1, data: new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255])};
  const prepared = prepareGroundArrays(data);
  expect(prepared.colour.levels[1].data[0]).toBe(188);
  expect(prepared.roughness.levels[1].data[0]).toBe(128);
});

test("array padding preserves differently sized original images without resampling", () => {
  const data = input(2);
  data.layers[1].colour = {width: 1, height: 1, data: new Uint8Array([13, 17, 29, 255])};
  const prepared = prepareGroundArrays(data);
  expect(Array.from(prepared.colour.levels[0].data.slice(8, 12))).toEqual([13, 17, 29, 255]);
  expect(Array.from(prepared.colour.levels[1].data.slice(4, 8))).toEqual([13, 17, 29, 255]);
});

test("invalid weights or duplicate ids fail explicitly without shortening the palette", () => {
  for (const invalid of [-.01, NaN, 1.01]) {
    const data = input(); data.weights[0] = invalid;
    expect(() => prepareGroundArrays(data)).toThrow();
  }
  const data = input(); data.layers[1].id = data.layers[0].id;
  expect(() => prepareGroundArrays(data)).toThrow(/id/i);
});

test("regional weights preserve dense palettes and share the full coarse tail instead of retaining full-tile slices", () => {
  const data=input(12); data.width=256; data.height=256;
  data.weights=new Float32Array(256*256*12);
  for (let k=0;k<12;k++) for (let y=0;y<256;y++) for (let x=0;x<256;x++) {
    if (Math.floor(x*12/256)===k || (x>=120 && x<136 && y>=120 && y<136)) data.weights[k*256*256+y*256+x]=.05;
  }
  const prepared=prepareGroundArrays(data),bounds: [number,number,number,number][]=[];
  for (let y=0;y<256;y+=32) for (let x=0;x<256;x+=32) bounds.push([x,y,x+32,y+32]);
  const regional=regionalGroundWeights(prepared.weights,bounds,3);
  expect(regional.bytes).toBeLessThan(prepared.weights.levels.reduce((n,level)=>n+level.data.byteLength,0));
  expect(regional.tail.levels[0].depth).toBe(12);
  expect(regional.regions.some(region=>region.palette.length===12)).toBe(true);
  const first=regional.regions[0], full=prepared.weights.levels[0];
  first.palette.forEach((source,k)=>{
    expect(first.weights.levels[0].data[k*first.weights.levels[0].width*first.weights.levels[0].height]).toBe(full.data[source*256*256]);
  });
});

test("derived half-float weights halve storage, but a tiny positive contributor forces full precision", () => {
  const source=prepareGroundArrays(input()).weights,packed=compactGroundWeights(source);
  expect(packed.levels[0].data).toBeInstanceOf(Uint16Array);
  expect(packed.levels[0].data.byteLength).toBe(source.levels[0].data.byteLength/2);
  const tiny=input();tiny.weights[0]=1e-12;
  const retained=compactGroundWeights(prepareGroundArrays(tiny).weights);
  expect(retained.levels[0].data).toBeInstanceOf(Float32Array);
  expect(retained.levels[0].data[0]).toBeGreaterThan(0);
});
