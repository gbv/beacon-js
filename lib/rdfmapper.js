/**
 * Mapping of a BEACON link dump to RDF (section 5).
 *
 * Uses the JavaScript RDF Interfaces DataFactory interface.
 */

const { isURI } = require('./datatypes')

/*

mapper = new RDFMapper(dataFactor, metaFields)
mapper.metaFieldTriples()
mapper.linkTriples(linkGenerator)
mapper.countTriples()
mapper.mapDump(linkDump)

 */

class RDFMapper {
  constructor (dataFactory, metaFields) {
    this.dataFactory = dataFactory
    this.tripleCount = 0
    this.linkCount = 0
    this.dumpNode = dataFactory.blankNode('dump')
  }

  * triples (linkDump) {
    const metaFields = linkDump.meta()
    yield * this.metaFieldTriples(metaFields)
    yield * this.linkTriples(linkDump.links(), metaFields.ANNOTATION)
    yield * this.countTriples()
  }

  * metaFieldTriples (metaFields) {
    const { triple, namedNode, blankNode, literal } = this.dataFactory
    const mf = metaFields

    const dump = this.dumpNode
    const sourceset = mf.SOURCESET ? namedNode(metaFields.SOURCESET) : blankNode('sourceset')
    const targetset = mf.TARGETSET ? namedNode(metaFields.TARGETSET) : blankNode('targetset')

    const a = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    const voi = localName => namedNode('http://rdfs.org/ns/void#' + localName)
    const foaf = localName => namedNode('http://xmlns.com/foaf/0.1/' + localName)
    const hydra = localName => namedNode('http://www.w3.org/ns/hydra/core#' + localName)
    const cc = localName => namedNode('http://creativecommons.org/' + localName)
    const dcterms = localName => namedNode('http://purl.org/dc/terms/' + localName)
    const rssynd = localName => namedNode('http://web.resource.org/rss/1.0/modules/syndication/' + localName)

    // Default triples (section 5.2)
    yield triple(dump, a, voi('Linkset'))
    yield triple(dump, a, hydra('Collection'))
    yield triple(dump, voi('subjectsTarget'), sourceset)
    yield triple(dump, voi('objectsTarget'), targetset)
    yield triple(sourceset, a, voi('Dataset'))
    yield triple(targetset, a, voi('Dataset'))

    yield triple(dump, cc('ns#license'), cc('publicdomain/zero/1.0/'))

    // Meta fields for link dumps (section 5.6)
    if (mf.DESCRIPTION) {
      yield triple(dump, dcterms('description'), literal(mf.DESCRIPTION))
    }

    if (mf.CREATOR) {
      if (mf.CREATOR.match(/^https?:\/\//)) {
        yield triple(dump, dcterms('creator'), namedNode(mf.CREATOR))
      } else {
        const creator = blankNode('creator')
        yield triple(dump, dcterms('creator'), creator)
        yield triple(creator, a, foaf('Agent'))
        yield triple(creator, foaf('name'), mf.CREATOR)
      }
    }

    if (mf.CONTACT) {
      // TODO
    }

    if (mf.HOMEPAGE) {
      yield triple(dump, foaf('homepage'), mf.HOMEPAGE)
    }

    if (mf.FEED) {
      yield triple(dump, voi('dataDump'), mf.FEED)
    }

    if (mf.TIMESTAMP) {
      // TODO: datatype
      yield triple(dump, dcterms('modified'), literal(mf.TIMESTAMP))
    }

    if (mf.UPDATE) {
      yield triple(dump, rssynd('updatePeriod'), mf.UPDATE)
    }

    // Meta fields for datasets (section 5.7)
    if (mf.NAME) {
      yield triple(dump, dcterms('title'), literal(mf.NAME))
    }

    if (mf.INSTITUTION) {
      if (mf.INSTITUTION.match(/^https?:\/\//)) {
        yield triple(dump, dcterms('publisher'), namedNode(mf.INSTITUTION))
      } else {
        const publisher = blankNode('publisher')
        yield triple(dump, dcterms('publisher'), publisher)
        yield triple(publisher, a, foaf('Agent'))
        yield triple(publisher, foaf('name'), mf.INSTITUTION)
      }
    }

    // TODO: RELATION => void
  }

  * linkTriples (linkGenerator, annotation) {
    const df = this.dataFactory
    const annotationProperty = annotation ? df.namedNode(annotation) : null

    for (let link of linkGenerator) {
      var linkTriple = [link.source, link.relation, link.target]

      if (linkTriple.every(uri => isURI(uri))) {
        this.linkCount++
        this.tripleCount++

        yield df.triple(...linkTriple.map(df.namedNode))

        if (annotationProperty && link.annotation !== '') {
          this.tripleCount++

          yield df.triple(
            df.namedNode(link.target),
            annotationProperty,
            df.literal(link.annotation)
          )
        }
      }
    }
  }

  * countTriples () {
    const df = this.dataFactory
    const integer = df.namedNode('http://www.w3.org/2001/XMLSchema#integer')

    yield df.triple(
      this.dumpNode,
      df.namedNode('http://www.w3.org/ns/hydra/core#totalItems'),
      df.literal(this.linkCount, integer)
    )

    yield df.triple(
      this.dumpNode,
      df.namedNode('http://rdfs.org/ns/void#entities'),
      df.literal(this.linkCount, integer)
    )

    yield df.triple(
      this.dumpNode,
      df.namedNode('http://rdfs.org/ns/void#triples'),
      df.literal(this.tripleCount, integer)
    )
  }
}

module.exports = (...args) => new RDFMapper(...args)
