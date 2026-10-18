const app = require('./src/app')
const service = require('./src/services/controlsService')

const PORT = process.env.PORT || 3000
const HOST = '127.0.0.1' // this computer only: the prototype has NO authentication

// Sample data so the browser has something to show (it is lost on restart).
service.createControl({ name: 'Passwords must be at least 12 characters', owner: 'IT team', status: 'active' })
service.createControl({ name: 'Laptops use full-disk encryption', owner: 'Security team' })

app.listen(PORT, HOST, () => {
  console.log(`Controls API running at http://${HOST}:${PORT}`)
  console.warn('PROTOTYPE: no authentication or authorization. Do not expose it beyond this computer.')
})