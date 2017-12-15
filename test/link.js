const { Link, MetaFields } = require('../index')

test('Link', () => {
  var meta = MetaFields({ MESSAGE: 'Hello World!' })

  expect(Link(['foo'], meta)).toEqual({
    source: 'foo',
    target: 'foo',
    relation: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    annotation: 'Hello World!'
  })

  expect(Link(['foo', '', 'bar'], meta)).toEqual({
    source: 'foo',
    target: 'bar',
    relation: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    annotation: 'Hello World!'
  })

  meta = MetaFields({RELATION: '{+ID}'})

  expect(Link([
    'foo', 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf', 'bar'
  ], meta)).toEqual({
    source: 'foo',
    target: 'bar',
    relation: 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf',
    annotation: ''
  })

  expect(Link(['foo', '', 'bar'], meta)).toBe(undefined)
})
