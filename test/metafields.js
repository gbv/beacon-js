const { metaFieldValue, MetaFields, uriPattern } = require('../index')

const tests = {
  PREFIX: {
    '': uriPattern('{+ID}'),
    ' {ID} ': uriPattern('{ID}'),
    'http://example.org/ ': uriPattern('http://example.org/{ID}'),
    '{FOO}': null,
    '{ID}{?ID}': null,
    '{ID}{+ID}': uriPattern('{ID}{+ID}')
  },
  MESSAGE: {
    '': '',
    'a\tb': 'a b',
    '0': '0'
  },
  RELATION: {
    '': 'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    'x': null,
    'x:y': 'x:y',
    '{ID': null,
    '{ID}': uriPattern('{ID}')
  },
  TIMESTAMP: {
    '': '',
    '1234': null,
    '0001-02-03': '0001-02-03',
    '9999-12-31T17:16:15Z': '9999-12-31T17:16:15Z'
  },
  UPDATE: {
    '': '',
    '?': null,
    'always': 'always'
  },
  HOMEPAGE: {
    '': '',
    'x:y': null,
    'http://example.org/': 'http://example.org/',
    'https://example.org/': 'https://example.org/'
  },
  UNKNOWN: {
    '': undefined,
    'whatever': undefined
  }
}

test('metaFieldValue', () => {
  for (let field in tests) {
    for (let value in tests[field]) {
      let got = metaFieldValue(field, value)
      let want = tests[field][value]
      expect(String(got)).toBe(String(tests[field][value]))
      if (typeof want === 'object') { // uriPattern
        expect(typeof got).toBe('object')
      }
    }
  }
})

test('metaFields', () => {
  var meta = MetaFields({
    NAME: 'alice| bob',
    FOO: 'bar'
  })

  expect(String(meta.PREFIX)).toBe('{+ID}')
  expect(String(meta.TARGET)).toBe('{+ID}')
  expect(meta.RELATION).toBe('http://www.w3.org/2000/01/rdf-schema#seeAlso')
  expect(meta.NAME).toBe('alice| bob')
  expect(meta.FOO).toBe(undefined)

  var flat = meta.simplify()
  expect(flat.PREFIX).toBe('{+ID}')
  expect(flat.NAME).toBe('alice| bob')

  flat = meta.simplify(true)
  expect(flat.PREFIX).toBe(undefined)
  expect(flat.NAME).toBe('alice| bob')
})
