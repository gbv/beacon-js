const { Parser, RDFMapper, Link } = require('../index')
const { createReadStream } = require('fs')

const dataFactory = {
  triple: (s, p, o) => [s, p, o],
  namedNode: (uri) => '<' + uri + '>',
  blankNode: (name) => '_:' + name,
  literal: (value, datatype) =>
    '"' + String(value).replace(/["\\\r\n]/, c => '\\' + c) +
    '"' + (datatype ? '^^' + datatype : '')
}

test('RDFMapper', done => {
  var metaTriples
  var linkTriples = []
  var meta

  const mapper = RDFMapper(dataFactory)

  createReadStream('test/rdf-example.txt')
  .pipe(Parser())
  .on('meta', m => {
    meta = m
    metaTriples = [...mapper.metaTriples(m)]
  })
  .on('data', link =>
    linkTriples.push(...mapper.linkTriples(link, meta.ANNOTATION))
  )
  .on('end', () => {
    expect(metaTriples).toEqual([
      [
        '_:dump',
        '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
        '<http://rdfs.org/ns/void#Linkset>'
      ], [
        '_:dump',
        '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
        '<http://www.w3.org/ns/hydra/core#Collection>'
      ], [
        '_:dump',
        '<http://rdfs.org/ns/void#subjectsTarget>',
        '_:sourceset'
      ], [
        '_:dump',
        '<http://rdfs.org/ns/void#objectsTarget>',
        '_:targetset'
      ], [
        '_:sourceset',
        '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
        '<http://rdfs.org/ns/void#Dataset>'
      ], [
        '_:targetset',
        '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
        '<http://rdfs.org/ns/void#Dataset>'
      ], [
        '_:dump',
        '<http://creativecommons.org/ns#license>',
        '<http://creativecommons.org/publicdomain/zero/1.0/>'
      ], [
        '_:sourceset',
        '<http://rdfs.org/ns/void#uriSpace>',
        '"http://example.org/"'
      ], [
        '_:targetset',
        '<http://rdfs.org/ns/void#uriSpace>',
        '"http://example.com/"'
      ], [
        '_:dump',
        '<http://rdfs.org/ns/void#linkPredicate>',
        '<http://xmlns.com/foaf/0.1/primaryTopic>'
      ], [
        '_:creator',
        '<http://xmlns.com/foaf/0.1/mbox>',
        '<mailto:bea@example.org>'
      ], [
        '_:creator',
        '<http://xmlns.com/foaf/0.1/name>',
        '"Bea Beacon"'
      ], [
        '_:dump',
        '<http://purl.org/dc/terms/creator>',
        '_:creator'
      ], [
        '_:creator',
        '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>',
        '<http://xmlns.com/foaf/0.1/Agent>'
      ], [
        '_:dump',
        '<http://purl.org/dc/terms/title>',
        '"\\""'
      ]
    ])

    expect(linkTriples).toEqual([
       ['<http://example.org/abc>', '<http://xmlns.com/foaf/0.1/primaryTopic>', '<http://example.com/xy>'],
       ['<http://example.com/xy>', '<http://purl.org/dc/terms/extent>', '"12"']
    ])

    done()
  })
})

test('RDFMapper.countTriples', () => {
  const mapper = RDFMapper(dataFactory)

  function countTriples (items, triples) {
    return [
      [
        '_:dump',
        '<http://www.w3.org/ns/hydra/core#totalItems>',
        '"' + items + '"^^<http://www.w3.org/2001/XMLSchema#integer>'
      ], [
        '_:dump',
        '<http://rdfs.org/ns/void#entities>',
        '"' + items + '"^^<http://www.w3.org/2001/XMLSchema#integer>'
      ], [
        '_:dump',
        '<http://rdfs.org/ns/void#triples>',
        '"' + triples + '"^^<http://www.w3.org/2001/XMLSchema#integer>'
      ]
    ]
  }

  expect([...mapper.countTriples()]).toEqual(countTriples(0, 0))

  var link = Link(['http://example.com/documents/23', '', 'http://example.com/people/alice.about'])
  ;mapper.linkTriples(link).next()

  expect([...mapper.countTriples()]).toEqual(countTriples(1, 1))
})
