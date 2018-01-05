const { Parser } = require('../index')
const { createReadStream, readFileSync } = require('fs')

function checkMeta (meta) {
  expect(meta.NAME).toBe('Test')
}

function checkLinks (links) {
  expect(links.length).toBe(7)
  for (let i = 0; i < 7; i++) {
    expect(links[i].source).toBe('source')
    expect(links[i].target).toBe(i < 4 ? 'source' : 'target')
    expect(links[i].relation).toBe('http://www.w3.org/2000/01/rdf-schema#seeAlso')
    expect(links[i].annotation).toBe([2, 3, 5, 6].includes(i) ? 'annotation' : '')
  }
}

test('Parser', done => {
  var tokens = []
  var links = []
  var meta

  createReadStream('test/example.txt')
  .pipe(Parser())
  .on('meta', m => { meta = m })
  .on('tokens', t => tokens.push(t))
  .on('data', l => links.push(l))
  .on('end', () => {
    checkMeta(meta)
    checkLinks(links)
    expect(tokens.length).toBe(12)
    done()
  })
})

test('parse stream', () => {
  return Parser().parse(createReadStream('test/example.txt'))
    .then(dump => {
      checkMeta(dump.meta)
      checkLinks(dump.links)
    })
})

test('parse string', () => {
  return Parser().parse(readFileSync('test/example.txt', 'utf8'))
    .then(dump => {
      checkMeta(dump.meta)
      checkLinks(dump.links)
    })
})

test('parse error', () => {
  return Parser().parse(createReadStream('test/malformed.txt'))
    .catch(e => {
      expect(e).toBeTruthy()
      expect(e.message).toBe('invalid meta line')
      expect(e.line).toBe('# bla')
      expect(e.number).toBe(2)
    })
})

test('parse error (2)', () => {
  return Parser().parse(true)
    .catch(e => {
      expect(e).toBeTruthy()
      expect(e.message).toBe('input not readable')
    })
})
