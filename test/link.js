const { MetaFields } = require('../index')

test('constructLink/constructTokens', () => {
  var meta = MetaFields({ MESSAGE: 'Hello World!' })

  function check (tokens, link) {
    expect(meta.constructLink(...tokens)).toEqual(link)
    expect(meta.constructTokens(link)).toEqual(tokens)
  }

  check(['foo'], {
    source: 'foo',
    target: 'foo',
    relation: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    annotation: 'Hello World!'
  })

  check(['foo', undefined, 'bar'], {
    source: 'foo',
    target: 'bar',
    relation: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    annotation: 'Hello World!'
  })

  meta = MetaFields({RELATION: '{+ID}'})

  check([
    'foo', 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf', 'bar'
  ], {
    source: 'foo',
    target: 'bar',
    relation: 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf',
    annotation: ''
  })

  expect(meta.constructLink('foo', '', 'bar')).toBe(undefined)
})
