const { Writer, MetaFields } = require('../index')

test('Writer', () => {
  var writer = Writer()
  writer.writeMeta(MetaFields({NAME: 'Hi'}))
  writer.writeTokens('a', 'b', 'c')

  expect(writer.output).toBe(`#FORMAT: BEACON
#NAME: Hi
#PREFIX: {+ID}
#TARGET: {+ID}
#RELATION: http://www.w3.org/2000/01/rdf-schema#seeAlso

a|b|c
`)

  writer = Writer()
  writer.writeTokens('a', undefined, 'http://example/')
  expect(writer.output).toBe('a||http://example/\n')
})
