const { MetaFields } = require('../index')

test('constructLink/constructTokens', () => {
  var meta = MetaFields({ MESSAGE: 'Hello World!' })

  function check (tokens, link, reverse = true) {
    link.relation = link.relation || 'http://www.w3.org/2000/01/rdf-schema#seeAlso'
    expect(meta.constructLink(...tokens)).toEqual(link)
    expect(meta.constructTokens(link)).toEqual(tokens)
  }

  check(['foo'], {
    source: 'foo',
    target: 'foo',
    annotation: 'Hello World!'
  })

  check(['foo', undefined, 'bar'], {
    source: 'foo',
    target: 'bar',
    annotation: 'Hello World!'
  })

  check(['foo', 'bar'], {
    source: 'foo',
    target: 'foo',
    annotation: 'bar'
  })

  // TODO: move to parser
  /**
  check(['foo', 'http://example.org/bar'], {
    source: 'foo',
    target: 'http://example.org/bar',
    annotation: 'Hello World!'
  })
  */

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
