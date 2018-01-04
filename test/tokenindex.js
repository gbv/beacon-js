const { TokenIndex } = require('../index')

test('TokenIndex', () => {
  var index = TokenIndex()

  expect([...index.query()]).toEqual([])

  var tokens = [['foo', 'bar']]
  index.addTokens('foo', 'bar')
  expect([...index.query()]).toEqual(tokens)

  index.addTokens('foo', 'bar', 'doz')
  tokens.push(['foo', 'bar', 'doz'])
  expect([...index.query()]).toEqual(tokens)
  expect([...index.query('foo', 'bar', 'doz')]).toEqual([tokens[1]])

  expect([...index.query('foo', undefined, undefined)]).toEqual(tokens)
  expect([...index.query(undefined, 'bar')]).toEqual(tokens)
  expect([...index.query(undefined, undefined, 'doz')]).toEqual([tokens[1]])

  index.addTokens('x', 'y')
  expect([...index.query('foo', undefined, undefined)]).toEqual(tokens)
  expect([...index.query(undefined, 'bar')]).toEqual(tokens)
  expect([...index.query(undefined, undefined, 'doz')]).toEqual([tokens[1]])

  tokens.push(['x', 'y'])
  expect([...index.query('x', undefined, undefined)]).toEqual([['x', 'y']])

  expect([...index.query('foo', 'bar', 'doz')]).toEqual([tokens[1]])
})
