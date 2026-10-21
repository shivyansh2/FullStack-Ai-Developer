const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');

process.env.JWT_SECRET = 'test-secret';

let mongod;

async function setupDB() {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());
}

async function teardownDB() {
  await disconnectDB();
  if (mongod) await mongod.stop();
}

async function clearDB() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

async function registerUser(overrides = {}) {
  const body = {
    name: 'Test User',
    email: `u${Math.random().toString(36).slice(2)}@example.com`,
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(body);
  return { ...res.body, email: body.email, password: body.password, status: res.status };
}

module.exports = { app, request, setupDB, teardownDB, clearDB, registerUser };