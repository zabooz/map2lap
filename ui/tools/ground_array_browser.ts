/** Browser-only conformance harness for the array rendering prototype. No Editor state or user track is loaded. */
import {GroundArrayRenderer, type GroundProbeRegion, type GroundProbeMode} from "../src/editor/groundArrayRender";
import type {GroundArrayInput, GroundMap} from "../src/editor/groundArray";

const solid = (r: number, g = r, b = r): GroundMap => ({width: 1, height: 1, data: new Uint8Array([r,g,b,255])});
const linear = (v: number) => v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4;
const canvas = () => document.getElementById("ground") as HTMLCanvasElement;
const difference = (a: Uint8Array, b: Uint8Array) => {
  let maximum=0;
  for (let k=0;k<a.length;k++) maximum=Math.max(maximum,Math.abs(a[k]-b[k]));
  return maximum;
};

function fixture(count = 12, size = 64): GroundArrayInput {
  return {width:size,height:size,extent:[256,256],origin:[-256,512],base:[.1,.2,.3],weights:new Float32Array(size*size*count).fill(.8/count),
    layers:Array.from({length:count},(_,k) => ({id:`material_${String(k).padStart(2,"0")}`,repeat:[2+k,3],
      colour:solid(200+(k%3)*15,40+(k*13)%200,20+(k*19)%220)}))};
}

/** Direct footprint averages from the original fields, independent of the uploaded recursive mip chain. */
function reference(input: GroundArrayInput, pixels: Uint8Array, width: number, height: number) {
  const {width:w,height:h,layers,weights} = input;
  const lod = Math.max(0,Math.min(Math.floor(Math.log2(Math.max(w,h))),Math.log2(Math.max(w/width,h/height))));
  const levels = [Math.floor(lod),Math.ceil(lod)].map(level => {
    const scale = 2**level, mw = Math.max(1,w/scale), mh = Math.max(1,h/scale), data = new Float64Array(mw*mh*layers.length);
    for (let k=0;k<layers.length;k++) for (let y=0;y<mh;y++) for (let x=0;x<mw;x++) {
      let sum = 0;
      for (let j=y*scale;j<Math.min(h,(y+1)*scale);j++) for (let i=x*scale;i<Math.min(w,(x+1)*scale);i++) sum+=weights[k*w*h+j*w+i];
      data[k*mw*mh+y*mw+x]=sum/(Math.min(scale,w)*Math.min(scale,h));
    }
    return {width:mw,height:mh,data};
  });
  const sample = (level:typeof levels[number],k:number,u:number,v:number) => {
    const px=u*level.width-.5, py=v*level.height-.5, x=Math.floor(px), y=Math.floor(py), fx=px-x, fy=py-y;
    const at=(i:number,j:number)=>level.data[k*level.width*level.height+Math.max(0,Math.min(level.height-1,j))*level.width+Math.max(0,Math.min(level.width-1,i))];
    return (at(x,y)*(1-fx)+at(x+1,y)*fx)*(1-fy)+(at(x,y+1)*(1-fx)+at(x+1,y+1)*fx)*fy;
  };
  const colours=layers.map(layer=>Array.from(layer.colour.data.slice(0,3),v=>linear(v/255)));
  let maximum=0;
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
    const colour=[0,0,0]; let total=0;
    for (let k=0;k<layers.length;k++) {
      const first=sample(levels[0],k,(x+.5)/width,(y+.5)/height), second=sample(levels[1],k,(x+.5)/width,(y+.5)/height);
      const weight=first+(second-first)*(lod-Math.floor(lod)); total+=weight;
      colour.forEach((_,c)=>colour[c]+=weight*colours[k][c]);
    }
    colour.forEach((value,c)=>{
      const expected=Math.round(255*(value+Math.max(0,1-total)*input.base[c])/Math.max(1,total));
      maximum=Math.max(maximum,Math.abs(pixels[(y*width+x)*4+c]-expected));
    });
  }
  return maximum;
}

function wire(input: GroundArrayInput) {
  return JSON.stringify({...input,weights:Array.from(input.weights),layers:input.layers.map(layer=>({...layer,
    colour:{...layer.colour,data:Array.from(layer.colour.data)},
    ...(layer.normal?{normal:{...layer.normal,data:Array.from(layer.normal.data)}}:{}),
    ...(layer.roughness?{roughness:{...layer.roughness,data:Array.from(layer.roughness.data)}}:{})}))});
}
function reopen(text: string): GroundArrayInput {
  const value=JSON.parse(text);
  value.weights=new Float32Array(value.weights);
  for (const layer of value.layers) for (const role of ["colour","normal","roughness"]) if (layer[role]) layer[role].data=new Uint8Array(layer[role].data);
  return value;
}

function denseCheck() {
  const input=fixture(), view=new GroundArrayRenderer(canvas(),input);
  view.render(16,16);
  const pixels=view.pixels(), error=reference(input,pixels,16,16), renderer=view.renderer;
  let minimumContribution=255;
  for (const id of view.prepared.ids) {
    view.render(16,16,"colour",[{bounds:[0,0,input.width,input.height],palette:view.prepared.ids.filter(value=>value!==id)}]);
    minimumContribution=Math.min(minimumContribution,difference(pixels,view.pixels()));
  }
  view.dispose();
  const again=new GroundArrayRenderer(canvas(),reopen(wire(input)));
  again.render(16,16);
  const reopenIdentical=difference(pixels,again.pixels())===0, drawCalls=again.drawCalls;
  again.dispose();
  return {error,materials:input.layers.length,reopenIdentical,drawCalls,minimumContribution,renderer};
}

function stripeFixture(size=64, count=12, dense=true) {
  const input=fixture(count,size);
  for (let k=0;k<count;k++) for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const label=(xx:number)=>Math.floor(Math.max(0,Math.min(size-1,xx))*count/size);
    const stripe=.25*Number(label(x-1)===k)+.5*Number(label(x)===k)+.25*Number(label(x+1)===k);
    const distance=Math.hypot(x-(size-1)/2,y-(size-1)/2);
    const blend=dense?Math.max(0,Math.min(1,(size/6-distance)/Math.max(1,size/32))):0;
    input.weights[k*size*size+y*size+x]=.8*(stripe*(1-blend)+blend/count);
  }
  return input;
}
function fourRegions(input: GroundArrayInput): GroundProbeRegion[] {
  return [[0,0,input.width/2,input.height/2],[input.width/2,0,input.width,input.height/2],
    [0,input.height/2,input.width/2,input.height],[input.width/2,input.height/2,input.width,input.height]].map(bounds=>({
      bounds:bounds as GroundProbeRegion["bounds"],palette:input.layers.map(layer=>layer.id)}));
}
function filterCheck() {
  const input=stripeFixture(), view=new GroundArrayRenderer(canvas(),input);
  view.render(128,96);
  const near=view.pixels(), nearError=reference(input,near,128,96);
  view.render(128,96,"colour",fourRegions(input));
  const regionsError=difference(near,view.pixels());
  view.render(8,6);
  const farError=reference(input,view.pixels(),8,6);
  view.dispose();
  return {nearError,farError,regionsError};
}

function regionalCheck() {
  const input=stripeFixture(256),regions:GroundProbeRegion[]=[];
  for (let y=0;y<256;y+=32) for (let x=0;x<256;x+=32) regions.push({bounds:[x,y,x+32,y+32],palette:input.layers.map(layer=>layer.id)});
  const full=new GroundArrayRenderer(canvas(),input),sizes=[128,48,16];
  const referencePixels=sizes.map(size=>{full.render(size,size);return full.pixels();}),fullBytes=full.prepared.bytes;
  full.dispose();
  const local=new GroundArrayRenderer(canvas(),input,{regions,splitLevel:3});
  const compared=sizes.map((size,k)=>{local.render(size,size);return difference(referencePixels[k],local.pixels());});
  const result={nearDifference:compared[0],transitionDifference:compared[1],farDifference:compared[2],
    regionalBytes:local.prepared.bytes,fullBytes,regionalApplied:local.regionalApplied};
  local.dispose();return result;
}

function propertyCheck() {
  const input=fixture(1,16);
  input.weights.fill(1); input.extent=[8,8]; input.layers[0].repeat=[2,4]; input.layers[0].roughnessFactor=.8;
  input.layers[0].colour=solid(128);
  const render=(mode:GroundProbeMode="lit",regions?:GroundProbeRegion[])=>{
    const view=new GroundArrayRenderer(canvas(),input); view.render(64,64,mode,regions);
    const pixels=view.pixels(); view.dispose(); return pixels;
  };
  const flat=render(); input.layers[0].normal=solid(220,128,200);
  const normalDifference=difference(flat,render());
  input.layers[0].normal=solid(146,152,251); const rough=render();
  input.layers[0].roughness=solid(30); const roughnessDifference=difference(rough,render());
  input.layers[0].colour={width:2,height:2,data:new Uint8Array([230,40,20,255,30,180,20,255,20,40,220,255,230,210,20,255])};
  const repeating=render("colour"); let repeatError=0;
  for (let y=0;y<32;y++) for (let x=0;x<48;x++) for (let c=0;c<3;c++) {
    const at=(xx:number,yy:number)=>repeating[(yy*64+xx)*4+c];
    repeatError=Math.max(repeatError,Math.abs(at(x,y)-at(x+16,y)),Math.abs(at(x,y)-at(x,y+32)));
  }
  input.layers[0].variation=true;
  const varied=render("colour"), variationDifference=difference(repeating,varied);
  const variationRegionsError=difference(varied,render("colour",fourRegions(input)));
  return {normalDifference,roughnessDifference,repeatError,variationDifference,variationRegionsError};
}

function run(input: GroundArrayInput, width:number,height:number,mode:GroundProbeMode,regions?:GroundProbeRegion[]) {
  const started=performance.now(), view=new GroundArrayRenderer(canvas(),input), preparedMs=performance.now()-started;
  const samples=[];
  for (let k=0;k<4;k++) { const begin=performance.now(); view.render(width,height,mode,regions); samples.push(performance.now()-begin); }
  const pixels=view.pixels(), result={renderer:view.renderer,textureBytes:view.prepared.bytes,drawCalls:view.drawCalls,
    preparedMs,completionWallMs:samples.slice(1),png:canvas().toDataURL("image/png"),error:mode==="colour"?reference(input,pixels,width,height):null};
  view.dispose(); return result;
}

function benchmark(input:GroundArrayInput,width:number,height:number,regions:GroundProbeRegion[]) {
  const started=performance.now();let view=new GroundArrayRenderer(canvas(),input);
  const preparedMs=performance.now()-started;
  const measure=(mode:GroundProbeMode,areas?:GroundProbeRegion[])=>{
    const samples=[];
    for (let k=0;k<4;k++) {const begin=performance.now();view.render(width,height,mode,areas);samples.push(performance.now()-begin);}
    const pixels=view.pixels();
    return {pixels,drawCalls:view.drawCalls,textureBytes:view.prepared.bytes,completionWallMs:samples.slice(1),png:canvas().toDataURL("image/png")};
  };
  const all=measure("colour");view.dispose();
  const localStart=performance.now();view=new GroundArrayRenderer(canvas(),input,{regions});
  const regionalPreparedMs=performance.now()-localStart,regionalApplied=view.regionalApplied;
  const local=measure("colour",regions),lit=measure("lit",regions);
  const error=reference(input,all.pixels,width,height),regionDifference=difference(all.pixels,local.pixels);
  view.dispose();
  const compact=({pixels:_pixels,...value}:typeof all)=>value;
  return {renderer:view.renderer,preparedMs,regionalPreparedMs,regionalApplied,error,regionDifference,full:compact(all),regions:compact(local),lit:compact(lit)};
}

const api={denseCheck,filterCheck,propertyCheck,regionalCheck,fixture,stripeFixture,wire,reopen,run,benchmark};
export type GroundBrowserProbe=typeof api;
Object.assign(window,{groundArrayProbe:api});
