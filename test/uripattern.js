const { uriPattern } = require('../index')

test('uriPattern', () => {

  var p = uriPattern('http://example.org/?id={ID}')
  expect(String(p)).toBe('http://example.org/?id={ID}')
  expect(p.uriSpace).toBe('http://example.org/?id=')

  expect(p.expand('Hello World!')).toBe('http://example.org/?id=Hello%20World%21')
  expect(p.expand('x/?a=1&b=2')).toBe('http://example.org/?id=x%2F%3Fa%3D1%26b%3D2')
  expect(p.expand('M%C3%BCller')).toBe('http://example.org/?id=M%25C3%25BCller')

  p = uriPattern('http://example.org/{+ID}')
  expect(String(p)).toBe('http://example.org/{+ID}')
  expect(p.uriSpace).toBe('http://example.org/')

  expect(p.expand('Hello World!')).toBe('http://example.org/Hello%20World!')
  expect(p.expand('x/?a=1&b=2')).toBe('http://example.org/x/?a=1&b=2')
  expect(p.expand('M%C3%BCller')).toBe('http://example.org/M%25C3%25BCller')

  for(let s of ['','foo','{ID','{?ID}','{ID}{FOO}']) {
    expect(uriPattern(s)).toBe(null)
  }

  for(let s of ['{ID}','x:{ID}y','x:{ID}{ID}']) {
    var p = uriPattern(s)
    expect(String(p)).toBe(s)
    expect(p.uriSpace).toBe('')
  }
})
