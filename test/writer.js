const { Writer, MetaFields } = require('../index')

test('Writer', () => {
  var writer = Writer(MetaFields({NAME: 'Hi'}))
  writer.writeTokens('a', 'b', 'c')

  expect(writer.output).toBe('a|b|c\n')
})
