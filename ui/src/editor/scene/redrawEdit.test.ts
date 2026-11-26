import {expect, test} from "bun:test";
import type {AiRedraw} from "../state/edits";
import {backPoint, movePoint, removePoint, openStroke, reconnect, finishStroke} from "./redrawEdit";

const anchor = {metre:5, level:0, origin:[0,0], context:[[0,0],[5,0],[10,0]]};
const item: AiRedraw = {id:"ink", kind:"redraw", free:true, anchor, end:{...anchor,metre:22},
  points:[[8,0,1],[12,0,1],[15,0,2]], tail:[25,0,1]};
const q = [10,0,2];

test("move and remove one intermediate click, keeping both anchors and the tail", () => {
  expect(movePoint(item,2,q)).toEqual({...item,points:[item.points[0],q,item.points[2]]});
  expect(removePoint(item,2)).toEqual({...item,points:[item.points[0],item.points[2]]});
  for (const endpoint of [0,4]) {
    expect(movePoint(item,endpoint,q)).toBe(item);
    expect(removePoint(item,endpoint)).toBe(item);
  }
});

test("open after a click and reconnect at any later marker including B", () => {
  const opening = openStroke(item,1);
  expect(reconnect(opening,[q],3)).toEqual({...item,points:[item.points[0],q,item.points[2]]});
  expect(reconnect(opening,[],4)).toEqual({...item,points:[item.points[0]]});
});

test("finish an opening at a new anchor or runout, or discard the opening unchanged", () => {
  const before = structuredClone(item);
  const opening = openStroke(item,0);
  const end = {...anchor,metre:18};
  expect(finishStroke(opening,[q],end)).toEqual({id:"ink",kind:"redraw",free:true,anchor,end,points:[q]});
  expect(finishStroke(opening,[],end,q)).toEqual({...item,end,points:[],tail:q});
  expect(item).toEqual(before);
});

test("back up through ground clicks, then discard at the starting marker", () => {
  const clicks = [q,item.points[0]];
  expect(backPoint(clicks)).toEqual([q]);
  expect(backPoint([q])).toEqual([]);
  expect(backPoint([])).toBeNull();
  expect(clicks).toHaveLength(2);
});
