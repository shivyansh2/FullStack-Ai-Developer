// Route handling: read the request, call the service, send the right status code.
const express = require('express')
const service = require('../services/controlsService')

const router = express.Router()

// GET /api/controls -> 200
router.get('/', (req, res) => {
  res.json(service.getAllControls())
})

// GET /api/controls/:id -> 200 or 404
router.get('/:id', (req, res) => {
  const control = service.getControlById(req.params.id)
  if (!control) {
    return res.status(404).json({ error: 'Control not found' })
  }
  res.json(control)
})

// POST /api/controls -> 201 or 400
router.post('/', (req, res) => {
  const body = req.body ?? {} // no JSON body at all? treat it as an empty object
  const errors = service.validateControl(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }
  const control = service.createControl(body)
  res.status(201).json(control)
})

// PATCH /api/controls/:id -> 200, 400 or 404
router.patch('/:id', (req, res) => {
  if (!service.getControlById(req.params.id)) {
    return res.status(404).json({ error: 'Control not found' })
  }
  const body = req.body ?? {}
  const errors = service.validateControl(body, { partial: true })
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }
  res.json(service.updateControl(req.params.id, body))
})

// DELETE /api/controls/:id -> 204 or 404
router.delete('/:id', (req, res) => {
  if (!service.getControlById(req.params.id)) {
    return res.status(404).json({ error: 'Control not found' })
  }
  service.deleteControl(req.params.id)
  res.status(204).end()
})

module.exports = router
