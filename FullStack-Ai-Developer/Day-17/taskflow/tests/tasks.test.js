const mongoose = require('mongoose');
const Task = require('../src/models/Task');
const { app, request, setupDB, teardownDB, clearDB, registerUser } = require('./helpers');

let alice, bob;
const as = (u) => ({ Authorization: `Bearer ${u.token}` });

beforeAll(setupDB);
afterAll(teardownDB);
beforeEach(async () => {
  await clearDB();
  alice = await registerUser({ name: 'Alice' });
  bob = await registerUser({ name: 'Bob' });
});

const createTask = (u, body = { title: 'Write tests' }) =>
  request(app).post('/api/tasks').set(as(u)).send(body);

describe('authentication required', () => {
  const calls = [
    ['post', '/api/tasks'],
    ['get', '/api/tasks'],
    ['get', `/api/tasks/${new mongoose.Types.ObjectId()}`],
    ['patch', `/api/tasks/${new mongoose.Types.ObjectId()}`],
    ['delete', `/api/tasks/${new mongoose.Types.ObjectId()}`],
  ];
  test.each(calls)('%s %s without token -> 401', async (method, url) => {
    const res = await request(app)[method](url).send({ title: 'x' });
    expect(res.status).toBe(401);
  });

  test('garbage token -> 401', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });
});

describe('create', () => {
  test('creates a task owned by the caller, persisted in MongoDB', async () => {
    const res = await createTask(alice, { title: '  Buy milk ', priority: 'high' });
    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({
      title: 'Buy milk', status: 'todo', priority: 'high', owner: alice.user._id,
    });
    expect(await Task.countDocuments({ owner: alice.user._id })).toBe(1);
  });

  test('client cannot set owner to someone else', async () => {
    const res = await createTask(alice, { title: 'Sneaky', owner: bob.user._id });
    expect(res.status).toBe(201);
    expect(res.body.task.owner).toBe(alice.user._id);
  });

  test.each([
    ['missing title', {}],
    ['blank title', { title: '   ' }],
    ['title too long', { title: 'x'.repeat(121) }],
    ['bad status', { title: 't', status: 'finished' }],
    ['bad priority', { title: 't', priority: 'urgent' }],
    ['bad dueDate', { title: 't', dueDate: 'not-a-date' }],
  ])('validation: %s -> 400', async (_l, body) => {
    const res = await createTask(alice, body);
    expect(res.status).toBe(400);
    expect(await Task.countDocuments()).toBe(0);
  });
});

describe('read', () => {
  test("list returns only the caller's tasks, with filtering and pagination", async () => {
    await createTask(alice, { title: 'A1', status: 'done' });
    await createTask(alice, { title: 'A2' });
    await createTask(alice, { title: 'A3' });
    await createTask(bob, { title: 'B1' });

    const all = await request(app).get('/api/tasks').set(as(alice));
    expect(all.body.total).toBe(3);
    expect(all.body.tasks.every((t) => t.owner === alice.user._id)).toBe(true);

    const done = await request(app).get('/api/tasks?status=done').set(as(alice));
    expect(done.body.tasks.map((t) => t.title)).toEqual(['A1']);

    const paged = await request(app).get('/api/tasks?limit=2&page=2').set(as(alice));
    expect(paged.body.tasks).toHaveLength(1);
    expect(paged.body.total).toBe(3);
  });

  test('get one by id', async () => {
    const { body } = await createTask(alice);
    const res = await request(app).get(`/api/tasks/${body.task._id}`).set(as(alice));
    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Write tests');
  });

  test('malformed id and unknown id -> 404', async () => {
    expect((await request(app).get('/api/tasks/123').set(as(alice))).status).toBe(404);
    expect((await request(app).get(`/api/tasks/${new mongoose.Types.ObjectId()}`).set(as(alice))).status).toBe(404);
  });
});

describe('update', () => {
  test('patch updates allowed fields and validates', async () => {
    const { body } = await createTask(alice);
    const ok = await request(app).patch(`/api/tasks/${body.task._id}`).set(as(alice)).send({ status: 'done' });
    expect(ok.status).toBe(200);
    expect(ok.body.task.status).toBe('done');

    const bad = await request(app).patch(`/api/tasks/${body.task._id}`).set(as(alice)).send({ status: 'nope' });
    expect(bad.status).toBe(400);
    expect((await Task.findById(body.task._id)).status).toBe('done');
  });

  test('cannot reassign ownership via patch', async () => {
    const { body } = await createTask(alice);
    await request(app).patch(`/api/tasks/${body.task._id}`).set(as(alice))
      .send({ owner: bob.user._id, title: 'Renamed' });
    const stored = await Task.findById(body.task._id);
    expect(stored.owner.toString()).toBe(alice.user._id);
    expect(stored.title).toBe('Renamed');
  });
});

describe('delete', () => {
  test('deletes own task', async () => {
    const { body } = await createTask(alice);
    const res = await request(app).delete(`/api/tasks/${body.task._id}`).set(as(alice));
    expect(res.status).toBe(204);
    expect(await Task.countDocuments()).toBe(0);
  });
});

describe('ownership enforcement (unauthorized access)', () => {
  let task;
  beforeEach(async () => {
    task = (await createTask(alice, { title: 'Private' })).body.task;
  });

  test("bob cannot read alice's task", async () => {
    const res = await request(app).get(`/api/tasks/${task._id}`).set(as(bob));
    expect(res.status).toBe(404);
  });

  test("bob cannot update alice's task", async () => {
    const res = await request(app).patch(`/api/tasks/${task._id}`).set(as(bob)).send({ title: 'Hacked' });
    expect(res.status).toBe(404);
    expect((await Task.findById(task._id)).title).toBe('Private');
  });

  test("bob cannot delete alice's task", async () => {
    const res = await request(app).delete(`/api/tasks/${task._id}`).set(as(bob));
    expect(res.status).toBe(404);
    expect(await Task.countDocuments({ _id: task._id })).toBe(1);
  });

  test("bob's list never contains alice's task", async () => {
    const res = await request(app).get('/api/tasks').set(as(bob));
    expect(res.body.total).toBe(0);
  });
});