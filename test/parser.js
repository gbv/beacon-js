const beacon = require('../index')

test('parser: links', () => {
  beacon.parser('test/example.txt', dump => {

    let meta = dump.meta()
    expect(meta.NAME).toBe('Test')

    let links = [...dump.links()]
    expect(links.length).toBe(7)

    for(let i=0; i<7; i++) {
      expect(links[i].source).toBe('source')
      expect(links[i].target).toBe(i < 4 ? 'source' : 'target')
      expect(links[i].relation).toBe('http://www.w3.org/2000/01/rdf-schema#seeAlso')
      expect(links[i].annotation).toBe([2,3,5,6].includes(i) ? 'annotation' : '')
    }
  })
})

test('parser: triples', () => {
  beacon.parser('test/example.txt', dump => {
    expect([...dump.triples()]).toEqual([])
  })

  beacon.parser('test/rdf-example.txt', dump => {
    expect([...dump.triples()]).toEqual([
      [
       ['http://example.org/abc','http://xmlns.com/foaf/0.1/primaryTopic','http://example.com/xy'],
       ['http://example.com/xy','http://purl.org/dc/terms/extent','12']
      ]
    ])
  })

})
