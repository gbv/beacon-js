const { beaconWriter, metaFields } = require('../index')


test('writer', () => {
  let out = {s:'', write(s) { this.s = this.s + s }}

  let writer = beaconWriter(out)
  writer.writeMetaLines(metaFields({NAME:'!\n!'}))

  expect(out.s).toMatch(/^#FORMAT: BEACON\n/)
})
