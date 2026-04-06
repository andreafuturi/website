/**
 * SSR rendering test — verifies the Deno server returns valid HTML for main pages 🧪
 */
import { assertEquals, assert } from "https://deno.land/std/assert/mod.ts";

const BASE = "http://localhost:8000";

Deno.test("SSR: home page returns 200 with valid HTML", async () => {
  const res = await fetch(BASE + "/");
  assertEquals(res.status, 200);
  const html = await res.text();
  assert(html.includes("<!DOCTYPE html>"), "Should start with doctype");
  assert(html.includes("<html"), "Should contain <html> tag");
  assert(html.includes("Andrea Futuri"), "Should contain site title");
  assert(html.includes("APPS"), "Should contain hero heading text");
});

Deno.test("SSR: about page returns 200 with expected content", async () => {
  const res = await fetch(BASE + "/about");
  assertEquals(res.status, 200);
  const html = await res.text();
  assert(html.includes("My Values"), "About page should contain 'My Values'");
  assert(html.includes("Creativity"), "About page should list Creativity value");
  assert(html.includes("Minimalism"), "About page should list Minimalism value");
});

Deno.test("SSR: home page includes dev mode script in dev", async () => {
  const res = await fetch(BASE + "/");
  const html = await res.text();
  assert(html.includes("globalThis.dev=true"), "Dev mode should inject dev flag");
  assert(html.includes("localhost:3456"), "Dev mode should reference Vite dev server");
});
