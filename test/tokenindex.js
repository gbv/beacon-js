const { TokenIndex } = require('../index')

test('TokenIndex', () => {
  var index = TokenIndex()

  expect([...index.queryTokens()]).toEqual([])

  var tokens = [['foo', 'bar']]
  index.addTokens('foo', 'bar')
  expect([...index.queryTokens()]).toEqual(tokens)
  expect([...index.queryTokens('no')]).toEqual([])

  index.addTokens('foo', 'bar', 'doz')
  tokens.push(['foo', 'bar', 'doz'])
  expect([...index.queryTokens()]).toEqual(tokens)
  expect([...index.queryTokens('foo', 'bar', 'doz')]).toEqual([tokens[1]])

  expect([...index.queryTokens('foo', 'no')]).toEqual([])
  expect([...index.queryTokens(undefined, 'no')]).toEqual([])
  expect([...index.queryTokens('foo', 'bar', 'no')]).toEqual([])
  expect([...index.queryTokens('no', 'bar', 'doz')]).toEqual([])

  expect([...index.queryTokens('foo', undefined, undefined)]).toEqual(tokens)
  expect([...index.queryTokens(undefined, 'bar')]).toEqual(tokens)
  expect([...index.queryTokens(undefined, undefined, 'doz')]).toEqual([tokens[1]])

  index.addTokens('x', 'y')
  expect([...index.queryTokens('foo', undefined, undefined)]).toEqual(tokens)
  expect([...index.queryTokens(undefined, 'bar')]).toEqual(tokens)
  expect([...index.queryTokens(undefined, undefined, 'doz')]).toEqual([tokens[1]])

  tokens.push(['x', 'y'])
  expect([...index.queryTokens('x', undefined, undefined)]).toEqual([['x', 'y']])

  expect([...index.queryTokens('foo', 'bar', 'doz')]).toEqual([tokens[1]])
  expect([...index.queryTokens('foo', undefined, 'doz')]).toEqual([tokens[1]])
  expect([...index.queryTokens(undefined, 'bar', 'doz')]).toEqual([tokens[1]])
})
