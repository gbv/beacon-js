const { Parser, RDFMapper, MetaFields } = require('../index')
const { createReadStream } = require('fs')

function triple (subject, predicate, object) {
  return { subject, predicate, object }
}

const expectedMetaTriples = [
  triple(
    '_:dump',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://rdfs.org/ns/void#Linkset'
  ), triple(
    '_:dump',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://www.w3.org/ns/hydra/core#Collection'
  ), triple(
    '_:dump',
    'http://rdfs.org/ns/void#subjectsTarget',
    '_:sourceset'
  ), triple(
    '_:dump',
    'http://rdfs.org/ns/void#objectsTarget',
    '_:targetset'
  ), triple(
    '_:sourceset',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://rdfs.org/ns/void#Dataset'
  ), triple(
    '_:targetset',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://rdfs.org/ns/void#Dataset'
  ), triple(
    '_:dump',
    'http://creativecommons.org/ns#license',
    'http://creativecommons.org/publicdomain/zero/1.0/'
  ), triple(
    '_:sourceset',
    'http://rdfs.org/ns/void#uriSpace',
    '"http://example.org/"'
  ), triple(
    '_:targetset',
    'http://rdfs.org/ns/void#uriSpace',
    '"http://example.com/"'
  ), triple(
    '_:dump',
    'http://rdfs.org/ns/void#linkPredicate',
    'http://xmlns.com/foaf/0.1/primaryTopic'
  ), triple(
    '_:creator',
    'http://xmlns.com/foaf/0.1/mbox',
    'mailto:bea@example.org'
  ), triple(
    '_:creator',
    'http://xmlns.com/foaf/0.1/name',
    '"Bea Beacon"'
  ), triple(
    '_:dump',
    'http://purl.org/dc/terms/creator',
    '_:creator'
  ), triple(
    '_:creator',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://xmlns.com/foaf/0.1/Agent'
  ), triple(
    '_:dump',
    'http://purl.org/dc/terms/title',
    '"""'
  )
]

const expectedLinkTriples = [
  triple(
    'http://example.org/abc',
    'http://xmlns.com/foaf/0.1/primaryTopic',
    'http://example.com/xy'
  ), triple(
    'http://example.com/xy',
    'http://purl.org/dc/terms/extent',
    '"12"'
  )
]

function countTriples (items, triples) {
  return [
    triple(
      '_:dump',
      'http://www.w3.org/ns/hydra/core#totalItems',
      '"' + items + '"^^http://www.w3.org/2001/XMLSchema#integer'
    ), triple(
      '_:dump',
      'http://rdfs.org/ns/void#entities',
      '"' + items + '"^^http://www.w3.org/2001/XMLSchema#integer'
    ), triple(
      '_:dump',
      'http://rdfs.org/ns/void#triples',
      '"' + triples + '"^^http://www.w3.org/2001/XMLSchema#integer'
    )
  ]
}

test('RDFMapper', done => {
  var metaTriples
  var linkTriples = []
  var meta

  const mapper = RDFMapper()

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
    expect(metaTriples).toEqual(expectedMetaTriples)
    expect(linkTriples).toEqual(expectedLinkTriples)
    done()
  })
})

test('RDFMapper.allTriples', done => {
  Parser().parse(createReadStream('test/rdf-example.txt'))
    .then(dump => {
      var triples = RDFMapper().allTriples(dump.meta, dump.links)
      expect([...triples]).toEqual(
        expectedMetaTriples
        .concat(expectedLinkTriples)
        .concat(countTriples(1, 2))
      )
      done()
    })
})

test('RDFMapper.countTriples', () => {
  const mapper = RDFMapper()

  expect([...mapper.countTriples()]).toEqual(countTriples(0, 0))

  var link = MetaFields().constructLink(
      'http://example.com/documents/23', '', 'http://example.com/people/alice.about'
  )
  ;mapper.linkTriples(link).next()

  expect([...mapper.countTriples()]).toEqual(countTriples(1, 1))
})
