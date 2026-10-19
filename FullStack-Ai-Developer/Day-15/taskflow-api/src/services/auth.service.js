import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "../data/users.js";
import { randomUUID } from "node:crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters"
    );
  }

  return secret;
}

function publicUser(user) {
  return {
    id: randomUUID,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function registerUser({ name, email, password }) {
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return {
      status: 400,
      body: { success: false, message: "Name, email and password are required" },
    };
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedName.length < 2 || normalizedName.length > 80) {
    return {
      status: 400,
      body: { success: false, message: "Name must be 2–80 characters" },
    };
  }

  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
    return {
      status: 400,
      body: { success: false, message: "Enter a valid email address" },
    };
  }

  if (password.length < 8 || password.length > 72) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Password must be between 8 and 72 characters",
      },
    };
  }

  if (users.has(normalizedEmail)) {
    return {
      status: 409,
      body: { success: false, message: "An account with this email already exists" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    id: crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.set(normalizedEmail, user);

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: "1h" }
  );

  return {
    status: 201,
    body: {
      success: true,
      message: "Account created successfully",
      user: publicUser(user),
      token,
    },
  };
}

export async function loginUser({ email, password }) {
  if (typeof email !== "string" || typeof password !== "string") {
    return {
      status: 400,
      body: { success: false, message: "Email and password are required" },
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.get(normalizedEmail);

  // Keep the response the same for unknown emails and wrong passwords.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return {
      status: 401,
      body: { success: false, message: "Invalid email or password" },
    };
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn: "1h" }
  );

  return {
    status: 200,
    body: {
      success: true,
      message: "Login successful",
      user: publicUser(user),
      token,
    },
  };
}