import {expect, test} from "bun:test";
import {laneFractions, guideMark, effectiveRange} from "./aiMargins";
import type {MoveGuide, Row} from "./aiGuide";

test("danger zone fractions use 3D lane distance including the circuit closing chord", () => {
  expect(laneFractions([[0,0,0], [0,3,4], [0,3,0]], true)).toEqual([0,5/12,9/12,1]);
});

test("a redrawn lane hit snaps by route metre across the seam, independently of guide sample count", () => {
  const rows = [0,10,20,30,40,50,60,70,80,90].map(m => [1,2,3,m,0,1,3,3,0] as Row);
  const guide: MoveGuide = {rows, path: [[0,0],[100,0]], length:100, closed:true, origin:[0,0], key:"route", tail:[], errors:{}};
  const mark = guideMark(guide, [70,85,5,55], 1, .8, [1,3], [7,5,9,3]);
  expect(mark.metre).toBe(0);
  expect(mark.level).toBe(9);
});

test("a legacy lane over a lower guide uses the physical height under the pointer", () => {
  const rows = [0,10,20].map(m => [m,0,0,m,0,1,3,3,0] as Row);
  const guide: MoveGuide = {rows, path: [[0,0],[20,0]], length:20, closed:false, origin:[0,0], key:"route", tail:[], errors:{}};
  const mark = guideMark(guide, null, 0, .25, [10,0], [6,10]);
  expect(mark.metre).toBe(10);
  expect(mark.level).toBe(7);
});

test("effective zone width includes gaps with zero hint, across a circuit seam too", () => {
  expect(effectiveRange([[0,.2,.5,.75], [.5,1,.25,.75]], "left", .8, .3)).toBe("0.00–0.50");
  expect(effectiveRange([[0,1,.5,.75]], "right", .1, .8)).toBe("0.75");
});

test("a surviving endpoint of a rejected margin can be hovered and picked on its crossbar", async () => {
  const {PerspectiveCamera, Scene, Vector2} = await import("three");
  const {editMargins} = await import("./aiMargins");
  const {AiLineDraw} = await import("./aiLine");
  const {decodeAiLine} = await import("./aiLineData");
  const scene = new Scene(), lane = new AiLineDraw(scene);
  const buffer = new ArrayBuffer(2*92);
  new Float32Array(buffer,0,2).set([0,100]);
  const values = new Float32Array(buffer);
  for (const [column,v] of [[10,3],[11,3],[15,1],[18,1]]) values.set([v,v], column*2);
  lane.set(decodeAiLine({count:2, revision:"lane", closed:false, message:null, status:"ready"}, buffer));
  lane.show(true);
  const camera = new PerspectiveCamera(60,1,.1,100);
  camera.position.set(50,20,0); camera.lookAt(50,0,0); camera.updateMatrixWorld();
  const element = {title:"",clientHeight:600, removeAttribute() {}};
  const selected: string[] = [];
  const edit = editMargins(element, scene, camera, undefined, lane, {sections:[], margins:{}, unplaced:null},
    [{id:"bad", start:.5, left:.25, right:null, error:"Unresolved route anchor at route metre 80"}],
    () => Infinity, () => {}, id => selected.push(id));
  expect(edit.hover({index:0,t:.501})?.owner?.id).toBe("bad");
  expect(element.title).toBe("");
  edit.click(new Vector2(.005,0));
  expect(selected).toEqual(["bad"]);
  edit.dispose();
  lane.set(null);
});

test("legacy display projects a guide metre to the installed segment on the anchor's level", async () => {
  const {projectGuideMark} = await import("./aiMargins");
  const positions: [number, number, number][] = [[0,0,0],[20,0,0],[20,10,0],[0,10,0]];
  const rows = [0,5,10,15,20].map(m => [m,0,0,m,0,1,3,3,0] as Row);
  const guide: MoveGuide = {rows, path:[[0,0],[20,0]], length:20, closed:false, origin:[0,0], key:"road", tail:[], errors:{}};
  expect(projectGuideMark([5,10], guide, positions, laneFractions(positions,false))).toBeCloseTo(.9);
});

test("a legacy anchor on the return trip projects onto the later passage of the same carriageway", async () => {
  const {projectGuideMark} = await import("./aiMargins");
  const positions: [number, number, number][] = [[0,0,0],[10,0,0],[20,0,0],[0,0,0]];
  const rows = [0,5,10,15,20,25,30,35,40].map(m => [Math.min(m,40-m),0,0,m,0,1,3,3,0] as Row);
  const guide: MoveGuide = {rows, path:[[0,0],[20,0],[0,0]], length:40, closed:false, origin:[0,0], key:"road", tail:[], errors:{}};
  expect(projectGuideMark([35,0], guide, positions, laneFractions(positions,false))).toBeCloseTo(35/40);
});

test("margin strip meshes measure inward from the INI sides and show only the winning width", async () => {
  const {Mesh, Group, Scene, PerspectiveCamera} = await import("three");
  const {AiLineDraw} = await import("./aiLine");
  const {editMargins} = await import("./aiMargins");
  const {decodeAiLine} = await import("./aiLineData");
  const scene = new Scene(), lane = new AiLineDraw(scene);
  const words = new Float32Array(2*23);
  words.set([0,100]); // Driving east (+X), AC SideLeft = up × forward = -Z.
  for (const [column,v] of [[10,.4],[11,1.2],[15,1],[18,1]]) words.set([v,v],column*2);
  lane.set(decodeAiLine({count:2,revision:"lane",closed:false,message:null,status:"ready"},words.buffer));
  const edit = editMargins({title:"",clientHeight:600,removeAttribute() {}}, scene, new PerspectiveCamera(),
    undefined, lane, {sections:[[0,.5,1,.25],[.5,1,1,.5]], margins:{},unplaced:null},
    [{id:"older",start:0,end:1,left:1,right:null},{id:"newer",start:.2,end:.4,left:.1,right:null}],
    () => Infinity, () => {}, () => {});
  edit.setSelected("older");
  const group = scene.children.find(child => child instanceof Group)!;
  const stripsAt = (x:number) => group.children.flatMap(mesh => {
      if (!(mesh instanceof Mesh) || mesh.type !== "Mesh") return [];
      const {position} = mesh.geometry.attributes;
      if (position.getX(0) >= x || position.getX(position.count-1) <= x) return [];
      const z = [position.getZ(0),position.getZ(1)].sort((a,b) => a-b);
      return [z.map(v => +v.toFixed(2))];
    }).sort((a,b) => a[0]-b[0]);
  // The 1 m strip stops at half the band. Off has no strip, even with a stale server section.
  expect(stripsAt(10)).toEqual([[-.4,.4]]);
  expect(stripsAt(30)).toEqual([[-.4,-.3]]);
  expect(stripsAt(75)).toEqual([[-.4,.4]]);
  edit.dispose();
  lane.set(null);
});
