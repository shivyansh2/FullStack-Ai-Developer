import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

test("Comply API routes", async (t) => {
  const server = createApp();

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  await t.test("GET / returns welcome message", async () => {
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /application\/json/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.message, "Welcome to the Comply API");
  });

  await t.test("GET /api/health returns healthy status", async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.status, "healthy");
  });

  await t.test("Unknown route returns 404 JSON", async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);

    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.message, "Route not found");
  });

  await t.test("Unsupported method returns 404", async () => {
    const response = await fetch(`${baseUrl}/api/health`, { method: "POST" });

    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.success, false);
  });
});
