import {expect, test} from "bun:test";
import {ToastStore} from "./toastStore";

test("parts post their own toasts by id into one list, in the order they came", () => {
  const store = new ToastStore();
  store.post({id: "a", tone: "warning", title: "A"});
  store.post({id: "b", tone: "error", title: "B"});
  expect(store.toasts().map(t => t.id)).toEqual(["a", "b"]);
  store.remove("a");
  expect(store.toasts().map(t => t.id)).toEqual(["b"]);
});

test("an unchanged toast posted again renders nothing new, yet its action and × run the newest callbacks", () => {
  const store = new ToastStore(), calls: string[] = [];
  let renders = 0;
  store.subscribe(() => renders++);
  store.post({id: "a", tone: "error", title: "A", action: {label: "Go", run: () => calls.push("old")}, onDismiss: () => calls.push("old ×")});
  const shown = store.toasts();
  store.post({id: "a", tone: "error", title: "A", action: {label: "Go", run: () => calls.push("new")}, onDismiss: () => calls.push("new ×")});
  expect(renders).toBe(1);
  expect(store.toasts()).toBe(shown);
  store.run("a"); store.dismiss("a");
  expect(calls).toEqual(["new", "new ×"]);
  store.post({id: "a", tone: "error", title: "A", message: "more"});
  expect(renders).toBe(2);
  store.remove("missing");
  expect(renders).toBe(2);
});

test("a moving progress bar or a new second line renders again; the same ones do not", () => {
  const store = new ToastStore();
  let renders = 0;
  store.subscribe(() => renders++);
  const loading = {id: "l", tone: "info" as const, title: "Loading track", progress: {value: 0.2, label: "Loading track"}};
  store.post(loading);
  store.post({...loading, progress: {value: 0.2, label: "Loading track"}});
  expect(renders).toBe(1);
  store.post({...loading, progress: {value: 0.5, label: "Loading track"}});
  store.post({...loading, progress: {value: 0.5, label: "Loading track"}, detail: "First opening"});
  expect(renders).toBe(3);
});
