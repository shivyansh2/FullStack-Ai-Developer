import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { users } from "../src/data/users.js";

process.env.JWT_SECRET =
  "test-only-secret-that-is-at-least-32-characters-long";

test("TaskFlow API", async (t) => {
  users.clear();

  const server = createApp().listen(0, "127.0.0.1");

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function post(path, body) {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  try {
    await t.test("Root endpoint works", async () => {
      const response = await fetch(`${baseUrl}/`);
      assert.equal(response.status, 200);
    });

    await t.test("Health endpoint works", async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.status, "healthy");
    });

    await t.test("Unknown route returns 404", async () => {
      const response = await fetch(`${baseUrl}/api/unknown`);
      assert.equal(response.status, 404);
    });

    await t.test("Registration creates a user and token", async () => {
      const response = await post("/api/auth/register", {
        name: "Alex Morgan",
        email: "Alex@example.com",
        password: "StrongPass123!",
      });

      const body = await response.json();

      assert.equal(response.status, 201);
      assert.equal(body.success, true);
      assert.equal(body.user.email, "alex@example.com");
      assert.ok(body.token);
      assert.equal("passwordHash" in body.user, false);
      assert.notEqual(
        users.get("alex@example.com").passwordHash,
        "StrongPass123!"
      );
    });

    await t.test("Duplicate email is rejected", async () => {
      const response = await post("/api/auth/register", {
        name: "Alex Morgan",
        email: "alex@example.com",
        password: "StrongPass123!",
      });

      assert.equal(response.status, 409);
    });

    await t.test("Weak password is rejected", async () => {
      const response = await post("/api/auth/register", {
        name: "Jamie Lee",
        email: "jamie@example.com",
        password: "short",
      });

      assert.equal(response.status, 400);
    });

    await t.test("Login succeeds with correct credentials", async () => {
      const response = await post("/api/auth/login", {
        email: "alex@example.com",
        password: "StrongPass123!",
      });

      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.token);
    });

    await t.test("Login rejects an incorrect password", async () => {
      const response = await post("/api/auth/login", {
        email: "alex@example.com",
        password: "WrongPassword123!",
      });

      assert.equal(response.status, 401);
    });

    await t.test("Login rejects an unknown email", async () => {
      const response = await post("/api/auth/login", {
        email: "nobody@example.com",
        password: "StrongPass123!",
      });

      assert.equal(response.status, 401);
    });
    await t.test("Protected profile rejects missing token", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
});

await t.test("Protected profile accepts a valid token", async () => {
  const registration = await post("/api/auth/register", {
    name: "Taylor Reed",
    email: "taylor@example.com",
    password: "StrongPass123!",
  });

  const registrationBody = await registration.json();

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${registrationBody.token}`,
    },
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.user.email, "taylor@example.com");
  assert.equal("passwordHash" in body.user, false);
});

await t.test("Protected profile rejects an invalid token", async () => {
  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: "Bearer invalid.token.value",
    },
  });

  assert.equal(response.status, 401);
});
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});