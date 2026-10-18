// Builds the Express app but does NOT start listening, so tests can import it.
const express = require('express')
const controlsRouter = require('./routes/controls')

const app = express()
app.use(express.json())

// GET /api/health -> 200
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/controls', controlsRouter)

// Any other URL -> 404 (as JSON)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler (it must have exactly 4 parameters)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
