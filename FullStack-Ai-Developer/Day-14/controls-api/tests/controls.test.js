const request = require('supertest')
const app = require('../src/app')
const service = require('../src/services/controlsService')

const validControl = { name: 'MFA is required for admins', owner: 'Security team' }

// Helper: create a control through the API and return it
async function createOne(overrides = {}) {
  const res = await request(app).post('/api/controls').send({ ...validControl, ...overrides })
  return res.body
}

// Every test starts with an empty list
beforeEach(() => {
  service.resetControls()
})

describe('GET /api/health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('GET /api/controls', () => {
  it('returns an empty JSON array when there are no controls', async () => {
    const res = await request(app).get('/api/controls')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body).toEqual([])
  })

  it('returns the controls that were created', async () => {
    await createOne({ name: 'First control' })
    await createOne({ name: 'Second control' })

    const res = await request(app).get('/api/controls')

    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('First control')
  })
})

describe('GET /api/controls/:id', () => {
  it('returns one control', async () => {
    const created = await createOne()

    const res = await request(app).get(`/api/controls/${created.id}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(created)
  })

  it('returns 404 when the control does not exist', async () => {
    const res = await request(app).get('/api/controls/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Control not found')
  })

  it('returns 404 when the id is not a number', async () => {
    const res = await request(app).get('/api/controls/abc')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/controls', () => {
  it('creates a control and returns 201', async () => {
    const res = await request(app).post('/api/controls').send(validControl)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 1, name: validControl.name, owner: validControl.owner, status: 'draft' })
    expect(res.body.createdAt).toBeDefined()
  })

  it('uses the status that was sent', async () => {
    const res = await request(app).post('/api/controls').send({ ...validControl, status: 'active' })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('active')
  })

  it('removes extra spaces around name and owner', async () => {
    const res = await request(app).post('/api/controls').send({ name: '  Padded  ', owner: '  Me  ' })

    expect(res.body.name).toBe('Padded')
    expect(res.body.owner).toBe('Me')
  })

  it('ignores fields it does not know, so the client cannot choose the id', async () => {
    const res = await request(app).post('/api/controls').send({ ...validControl, id: 999, isAdmin: true })

    expect(res.status).toBe(201)
    expect(res.body.id).toBe(1)
    expect(res.body.isAdmin).toBeUndefined()
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/controls').send({ owner: 'IT' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
    expect(res.body.details[0]).toMatch(/name/)
  })

  it('returns 400 when owner is missing', async () => {
    const res = await request(app).post('/api/controls').send({ name: 'MFA enabled' })

    expect(res.status).toBe(400)
    expect(res.body.details[0]).toMatch(/owner/)
  })

  it('returns 400 when name is empty', async () => {
    const res = await request(app).post('/api/controls').send({ name: '', owner: 'IT' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for an invalid status', async () => {
    const res = await request(app).post('/api/controls').send({ ...validControl, status: 'done' })

    expect(res.status).toBe(400)
    expect(res.body.details[0]).toMatch(/status/)
  })

  it('returns 400 when there is no body at all', async () => {
    const res = await request(app).post('/api/controls')
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/api/controls')
      .set('Content-Type', 'application/json')
      .send('{"name": ')

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Request body is not valid JSON')
  })

  it('does not save a control that failed validation', async () => {
    await request(app).post('/api/controls').send({ owner: 'IT' })

    const res = await request(app).get('/api/controls')
    expect(res.body).toEqual([])
  })
})

describe('PATCH /api/controls/:id', () => {
  it('updates a control and returns 200', async () => {
    const created = await createOne()

    const res = await request(app).patch(`/api/controls/${created.id}`).send({ status: 'active' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('active')
  })

  it('only changes the fields that were sent', async () => {
    const created = await createOne()

    const res = await request(app).patch(`/api/controls/${created.id}`).send({ owner: 'New owner' })

    expect(res.body.owner).toBe('New owner')
    expect(res.body.name).toBe(created.name)
  })

  it('saves the change', async () => {
    const created = await createOne()
    await request(app).patch(`/api/controls/${created.id}`).send({ name: 'Renamed control' })

    const res = await request(app).get(`/api/controls/${created.id}`)
    expect(res.body.name).toBe('Renamed control')
  })

  it('cannot change the id', async () => {
    const created = await createOne()

    const res = await request(app).patch(`/api/controls/${created.id}`).send({ id: 999, status: 'active' })

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(created.id)
  })

  it('returns 404 when the control does not exist', async () => {
    const res = await request(app).patch('/api/controls/999').send({ status: 'active' })
    expect(res.status).toBe(404)
  })

  it('returns 400 for an invalid status and leaves the control unchanged', async () => {
    const created = await createOne()

    const res = await request(app).patch(`/api/controls/${created.id}`).send({ status: 'done' })
    expect(res.status).toBe(400)

    const after = await request(app).get(`/api/controls/${created.id}`)
    expect(after.body.status).toBe('draft')
  })

  it('returns 400 for an empty body', async () => {
    const created = await createOne()

    const res = await request(app).patch(`/api/controls/${created.id}`).send({})
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/controls/:id', () => {
  it('deletes a control and returns 204', async () => {
    const created = await createOne()

    const res = await request(app).delete(`/api/controls/${created.id}`)

    expect(res.status).toBe(204)
    expect(res.text).toBe('')
  })

  it('really removes it', async () => {
    const created = await createOne()
    await request(app).delete(`/api/controls/${created.id}`)

    const res = await request(app).get(`/api/controls/${created.id}`)
    expect(res.status).toBe(404)
  })

  it('returns 404 when the control does not exist', async () => {
    const res = await request(app).delete('/api/controls/999')
    expect(res.status).toBe(404)
  })

  it('returns 404 when it is deleted twice', async () => {
    const created = await createOne()
    await request(app).delete(`/api/controls/${created.id}`)

    const res = await request(app).delete(`/api/controls/${created.id}`)
    expect(res.status).toBe(404)
  })
})

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const res = await request(app).get('/api/nothing-here')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Route not found')
  })
})
