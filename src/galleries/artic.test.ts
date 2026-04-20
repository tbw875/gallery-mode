import { test } from "node:test";
import assert from "node:assert/strict";
import { articAdapter } from "./artic.ts";

test("articAdapter has expected identity", () => {
  assert.equal(articAdapter.id, "artic");
  assert.match(articAdapter.displayName, /Chicago/);
});
