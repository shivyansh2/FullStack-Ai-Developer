const { validateControl } = require('../src/services/controlsService')

describe('validateControl', () => {
  it('accepts a control with a name and an owner', () => {
    expect(validateControl({ name: 'MFA enabled', owner: 'IT' })).toEqual([])
  })

  it('reports both missing required fields', () => {
    expect(validateControl({})).toHaveLength(2)
  })

  it('rejects a name that is only spaces', () => {
    expect(validateControl({ name: '   ', owner: 'IT' })).toHaveLength(1)
  })

  it('rejects a name that is not a string', () => {
    expect(validateControl({ name: 42, owner: 'IT' })).toHaveLength(1)
  })

  it('rejects an unknown status', () => {
    expect(validateControl({ name: 'MFA', owner: 'IT', status: 'done' })).toHaveLength(1)
  })

  it('accepts every valid status', () => {
    for (const status of ['draft', 'active', 'retired']) {
      expect(validateControl({ name: 'MFA', owner: 'IT', status })).toEqual([])
    }
  })

  it('partial mode: one field is enough', () => {
    expect(validateControl({ status: 'active' }, { partial: true })).toEqual([])
  })

  it('partial mode: an empty object is rejected', () => {
    expect(validateControl({}, { partial: true })).toHaveLength(1)
  })
})
