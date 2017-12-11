const { Writer, MetaFields } = require('../index')

test('writer', () => {
  let out = {s:'', write(s) { this.s = this.s + s }}

  let writer = Writer(out)
  expect(writer).toBeInstanceOf(Writer)

  writer.writeMetaLines(MetaFields({NAME:'!\n!'}))

  expect(out.s).toMatch(/^#FORMAT: BEACON\n/)
})
