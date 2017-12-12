const beacon = require('../index')

test('parser: links', () => {
  beacon.parser('test/example.txt', dump => {
    expect(dump.metaFields.NAME).toBe('Test')

    let links = [...dump.links()]
    expect(links.length).toBe(7)

    for (let i = 0; i < 7; i++) {
      expect(links[i].source).toBe('source')
      expect(links[i].target).toBe(i < 4 ? 'source' : 'target')
      expect(links[i].relation).toBe('http://www.w3.org/2000/01/rdf-schema#seeAlso')
      expect(links[i].annotation).toBe([2, 3, 5, 6].includes(i) ? 'annotation' : '')
    }
  })
})
