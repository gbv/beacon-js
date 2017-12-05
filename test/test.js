const beacon = require('../index')

test('parser', () => {
  expect(typeof beacon.parser).toBe('function')

  const input = 'test/example.txt'
  beacon.parser(input, dump => {
    expect(typeof dump).toBe('object')

    let meta = dump.meta()
    expect(meta.NAME).toBe('Test')

    let links = [...dump.links()]
    expect(links[0].source).toBe('foo')
    expect(links[0].target).toBe('foo')
    expect(links[0].annotation).toBe('bar')
    expect(links[0].relation).toBe('http://www.w3.org/2000/01/rdf-schema#seeAlso')
  })
})
