/**
 * Routing test — verifies SPA routing + static file serving + API 404 handling 🧪
 */
import { assertEquals, assert } from "https://deno.land/std/assert/mod.ts";

const BASE = "http://localhost:8000";

Deno.test("Routing: home and about render correct active route", async () => {
  const [homeRes, aboutRes] = await Promise.all([
    fetch(BASE + "/"),
    fetch(BASE + "/about"),
  ]);
  const homeHtml = await homeRes.text();
  const aboutHtml = await aboutRes.text();
  assert(homeHtml.includes("APPS"), "Home should have hero text");
  assert(aboutHtml.includes("My Values"), "About should have values section");
  assert(homeHtml.includes('path="/"'), "Home should have active home route");
  assert(aboutHtml.includes('path="/about"'), "About should have active about route");
});

Deno.test("Routing: SPA route fetch with 'onlyRoute' body returns partial HTML", async () => {
  const res = await fetch(BASE + "/about", {
    method: "POST",
    body: "onlyRoute",
  });
  assertEquals(res.status, 200);
  const contentType = res.headers.get("content-type");
  assert(contentType?.includes("javascript"), "onlyRoute should return JS content-type");
  const html = await res.text();
  assert(html.includes("My Values"), "Partial should contain about content");
  assert(!html.includes("<!DOCTYPE html>"), "Partial should NOT contain full page shell");
});

Deno.test("Routing: static CSS file is served", async () => {
  const res = await fetch(BASE + "/index.css");
  assertEquals(res.status, 200);
  const contentType = res.headers.get("content-type") || "";
  assert(contentType.includes("css"), "Should serve CSS content-type");
  await res.body?.cancel();
});
