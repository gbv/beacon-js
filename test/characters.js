const { whitespaceNormalize, replaceDisallowedChars } = require('../index')

test('whitespaceNormalize', () => {
  expect(whitespaceNormalize('\n\r\t a \t\n\rb\r\t\n')).toBe('a b')
})

test('replaceDisallowedChars', () => {
  const chars = (from, to) => {
    function * codepoints (start, stop) {
      while (start <= stop) yield start++
    }
    return String.fromCodePoint(...codepoints(from, to))
  }

  const strip = (str) => replaceDisallowedChars(str, true)

  expect(strip(chars(0, 0x20))).toBe(String.fromCodePoint(0x09, 0x0A, 0x0C, 0x20))
  expect(strip(chars(0x7E, 0xA0))).toBe('~\xA0')
  expect(strip(chars(0xD7FF, 0xE000))).toBe('\uD7FF\uE000')

/*
  TODO

  // -1FFFD / %x20000-2FFFD / ... / %x100000-
  for (let i=2; i<=16; i++) {
    let code = i*0x10000
    console.log(chars(code-3,code))
    expect(strip(chars(code-3,code))).toBe(String.fromCodePoint(code-3,code))
  }

  // %x10000-10FFFD
  expect(strip(chars(0x10FFFD,0x10FFFF))).toBe(String.fromCodePoint(0x10FFFD))
*/
})
