const beacon = require('../index')
const { createReadStream } = require('fs')

test('RDFMapper', () => {
  beacon.parser(createReadStream('test/rdf-example.txt'), dump => {
    const dataFactory = {
      triple: (s, p, o) => [s, p, o],
      namedNode: (uri) => '<' + uri + '>',
      blankNode: (name) => '_:' + name,
      literal: (value, datatype) =>
        '"' + String(value).replace(/["\\\r\n]/, c => '\\' + c) +
        '"' + (datatype ? '^^' + datatype : '')
    }

    const mapper = beacon.RDFMapper(dataFactory)

    let metaTriples = [...mapper.metaTriples(dump.metaFields)]
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

    let linkTriples = [...mapper.linkTriples(dump.links(), dump.metaFields.ANNOTATION)]

    expect(linkTriples).toEqual([
       ['<http://example.org/abc>', '<http://xmlns.com/foaf/0.1/primaryTopic>', '<http://example.com/xy>'],
       ['<http://example.com/xy>', '<http://purl.org/dc/terms/extent>', '"12"']
    ])
  })
})
