// Business logic: the data, the rules, and nothing about HTTP (no req, no res, no status codes).

const VALID_STATUSES = ['draft', 'active', 'retired']

let controls = []
let nextId = 1

// Returns a list of problems. An empty list means the data is valid.
// partial = true is for PATCH: fields are optional, but at least one must be sent.
function validateControl(data, { partial = false } = {}) {
  const errors = []

  if (!partial || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('name is required and must be a non-empty string')
    }
  }

  if (!partial || data.owner !== undefined) {
    if (typeof data.owner !== 'string' || data.owner.trim() === '') {
      errors.push('owner is required and must be a non-empty string')
    }
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  }

  if (partial && data.name === undefined && data.owner === undefined && data.status === undefined) {
    errors.push('send at least one of: name, owner, status')
  }

  return errors
}

function getAllControls() {
  return controls
}

function getControlById(id) {
  return controls.find((control) => control.id === Number(id))
}

// Assumes the data was already validated.
function createControl(data) {
  const control = {
    id: nextId++,
    name: data.name.trim(),
    owner: data.owner.trim(),
    status: data.status || 'draft',
    createdAt: new Date().toISOString(),
  }
  controls.push(control)
  return control
}

// Only name, owner and status are copied over, so a client can never change the id.
function updateControl(id, data) {
  const control = getControlById(id)
  if (data.name !== undefined) control.name = data.name.trim()
  if (data.owner !== undefined) control.owner = data.owner.trim()
  if (data.status !== undefined) control.status = data.status
  return control
}

function deleteControl(id) {
  controls = controls.filter((control) => control.id !== Number(id))
}

// Used by the tests to start every test from an empty list.
function resetControls() {
  controls = []
  nextId = 1
}

module.exports = {
  validateControl,
  getAllControls,
  getControlById,
  createControl,
  updateControl,
  deleteControl,
  resetControls,
}
