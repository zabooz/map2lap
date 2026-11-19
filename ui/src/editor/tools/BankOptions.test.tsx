import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {BankOptions} from "./BankOptions";
import type {BankTool} from "./useBank";
import type {TrackView} from "../scene/view";

test("each control sits at its own key: Shift the high edge, Ctrl the banking, Alt the edge ramp", () => {
  const bank = {points: [[0, 0, 0], [100, 0, 0]], way: {current: {min: 0, mean: 0, max: 0}}, banking: 0.005, side: 1, limit: 0.02,
    banked: null, status: null, ramps: [4, 4], fits: true, setBanking: () => {}, setLimit: () => {}, flip: () => {},
    remove: () => false, clear: () => {}} as unknown as BankTool;
  const html = renderToStaticMarkup(<BankOptions bank={bank} view={{} as TrackView} />);
  expect(html).toMatch(/>Shift<\/kbd><button[^>]*id="edit-bank-side"[^>]*>Left edge high/);
  expect(html).toMatch(/>Ctrl<\/kbd><label[^>]*>Banking/);
  expect(html).toMatch(/>Alt<\/kbd><label[^>]*>Edge ramp/);
});
