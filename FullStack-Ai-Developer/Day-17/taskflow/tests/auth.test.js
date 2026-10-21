const mongoose = require('mongoose');
const User = require('../src/models/User');
const { app, request, setupDB, teardownDB, clearDB, registerUser } = require('./helpers');

beforeAll(setupDB);
afterAll(teardownDB);
beforeEach(clearDB);

describe('POST /api/auth/register', () => {
  test('registers a user, stores a hashed password in MongoDB, returns a token', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Ada', email: 'Ada@Example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('ada@example.com');
    expect(res.body.user.password).toBeUndefined();

    const stored = await User.findOne({ email: 'ada@example.com' }).select('+password');
    expect(stored).not.toBeNull();
    expect(stored.password).not.toBe('password123');
    expect(stored.password).toMatch(/^\$2[aby]\$/);
  });

  test.each([
    ['missing everything', {}, ['name', 'email', 'password']],
    ['bad email', { name: 'Ada', email: 'nope', password: 'password123' }, ['email']],
    ['short password', { name: 'Ada', email: 'a@b.co', password: 'short' }, ['password']],
    ['short name', { name: 'A', email: 'a@b.co', password: 'password123' }, ['name']],
    ['non-string types', { name: 123, email: { $ne: null }, password: ['x'] }, ['name', 'email', 'password']],
  ])('rejects %s with 400', async (_label, body, fields) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.details)).toEqual(expect.arrayContaining(fields));
    expect(await User.countDocuments()).toBe(0);
  });

  test('rejects duplicate email with 409 (case-insensitive)', async () => {
    const first = await registerUser({ email: 'dup@example.com' });
    expect(first.status).toBe(201);
    const second = await request(app).post('/api/auth/register')
      .send({ name: 'Other', email: 'DUP@example.com', password: 'password123' });
    expect(second.status).toBe(409);
    expect(await User.countDocuments({ email: 'dup@example.com' })).toBe(1);
  });

  test('concurrent duplicate registrations create only one user', async () => {
    const send = () => request(app).post('/api/auth/register')
      .send({ name: 'Race', email: 'race@example.com', password: 'password123' });
    const results = await Promise.all([send(), send(), send()]);
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(2);
  });

  test('malformed JSON returns 400', async () => {
    const res = await request(app).post('/api/auth/register')
      .set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('logs in with correct credentials', async () => {
    const u = await registerUser();
    const res = await request(app).post('/api/auth/login')
      .send({ email: u.email.toUpperCase(), password: u.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  test('wrong password and unknown email both give the same 401', async () => {
    const u = await registerUser();
    const bad = await request(app).post('/api/auth/login').send({ email: u.email, password: 'wrongpass1' });
    const unknown = await request(app).post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' });
    expect(bad.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(bad.body).toEqual(unknown.body);
  });

  test('non-string fields return 400 (blocks NoSQL operator injection)', async () => {
    await registerUser();
    const res = await request(app).post('/api/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  test('returns current user with a valid token', async () => {
    const u = await registerUser();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${u.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(u.email);
  });

  test('token for a deleted user is rejected', async () => {
    const u = await registerUser();
    await User.deleteOne({ _id: new mongoose.Types.ObjectId(u.user._id) });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${u.token}`);
    expect(res.status).toBe(401);
  });
});