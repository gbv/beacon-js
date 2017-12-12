const { constructLink, MetaFields } = require('../index')

test('constructLink', () => {
  const meta = MetaFields({ MESSAGE: 'Hello World!' })

  expect(constructLink(meta, ['foo'])).toEqual({
    source: 'foo',
    target: 'foo',
    relation: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    annotation: 'Hello World!'
  })

  expect(constructLink(meta, ['foo', '', 'bar'])).toEqual({
    source: 'foo',
    target: 'bar',
    relation: 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    annotation: 'Hello World!'
  })
})
