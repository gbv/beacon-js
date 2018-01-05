/**
 * Mapping of a BEACON link dump to RDF (section 5).
 */

const { isURI } = require('./datatypes')

const N3DataFactory = {
  triple: (subject, predicate, object) => {
    return { subject, predicate, object }
  },
  namedNode: uri => uri,
  blankNode: name => '_:' + name,
  literal: (value, datatype) => '"' + value + '"' + (datatype ? '^^' + datatype : '')
}

class RDFMapper {
  constructor (dataFactory) {
    this.dataFactory = dataFactory || N3DataFactory
    this.tripleCount = 0
    this.linkCount = 0
    this.dumpNode = this.dataFactory.blankNode('dump')
  }

  * allTriples (metaFields, links) {
    yield * this.metaTriples(metaFields)
    for (let link of links) {
      yield * this.linkTriples(link, metaFields.ANNOTATION)
    }
    yield * this.countTriples()
  }

  * metaTriples (metaFields) {
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
    const xsd = localName => namedNode('http://www.w3.org/2001/XMLSchema#' + localName)

    // Default triples (section 5.2)
    yield triple(dump, a, voi('Linkset'))
    yield triple(dump, a, hydra('Collection'))
    yield triple(dump, voi('subjectsTarget'), sourceset)
    yield triple(dump, voi('objectsTarget'), targetset)
    yield triple(sourceset, a, voi('Dataset'))
    yield triple(targetset, a, voi('Dataset'))

    yield triple(dump, cc('ns#license'), cc('publicdomain/zero/1.0/'))

    // Meta fields for link construction (section 5.5)

    if (mf.PREFIX.uriSpace) {
      yield triple(sourceset, voi('uriSpace'), literal(mf.PREFIX.uriSpace))
    } else {
        // TODO
        // yield triple(sourceset, voi('uriRegexPattern'), literal(mf.PREFIX.uriRegexPattern))
    }

    if (mf.TARGET.uriSpace) {
      yield triple(targetset, voi('uriSpace'), literal(mf.TARGET.uriSpace))
    } else {
        // TODO
        // yield triple(targetset, voi('uriRegexPattern'), literal(mf.TARGET.uriRegexPattern))
    }

    if (typeof mf.RELATION === 'string') {
      yield triple(dump, voi('linkPredicate'), namedNode(mf.RELATION))
    }

    // Meta fields for link dumps (section 5.6)
    if (mf.DESCRIPTION) {
      yield triple(dump, dcterms('description'), literal(mf.DESCRIPTION))
    }

    var creator

    if (mf.CREATOR) {
      if (mf.CREATOR.match(/^https?:\/\//)) {
        yield triple(dump, dcterms('creator'), namedNode(mf.CREATOR))
      } else {
        creator = blankNode('creator')
        yield triple(creator, foaf('name'), literal(mf.CREATOR))
      }
    }

    if (mf.CONTACT) {
      var name, email
      let match = mf.CONTACT.match(/^(.*)<([^@ ]+@[^@ ]+)>/)
      if (match) {
        [name, email] = match.slice(1)
      } else if (mf.CONTACT.match(/^[^@ ]+@[^@ ]+$/)) {
        email = mf.CONTACT
      }

      if (email) {
        if (!creator) creator = blankNode('creator')
        yield triple(creator, foaf('mbox'), namedNode('mailto:' + email))
        if (name) {
          yield triple(creator, foaf('name'), literal(name.trim()))
        }
      }
    }

    if (creator) {
      yield triple(dump, dcterms('creator'), creator)
      yield triple(creator, a, foaf('Agent'))
    }

    if (mf.HOMEPAGE) {
      yield triple(dump, foaf('homepage'), namedNode(mf.HOMEPAGE))
    }

    if (mf.FEED) {
      yield triple(dump, voi('dataDump'), namedNode(mf.FEED))
    }

    if (mf.TIMESTAMP) {
      yield triple(
        dump, dcterms('modified'), literal(mf.TIMESTAMP),
        mf.TIMESTAMP.match(/T/) ? xsd('dateTime') : xsd('date')
      )
    }

    if (mf.UPDATE) {
      yield triple(dump, rssynd('updatePeriod'), literal(mf.UPDATE))
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
        yield triple(publisher, foaf('name'), literal(mf.INSTITUTION))
      }
    }
  }

  // Links (section 5.3)
  * linkTriples (link, annotation) {
    const df = this.dataFactory
    const annotationProperty = annotation ? df.namedNode(annotation) : null

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

  // Number of links with and without annotations (section 5.3 and 5.4)
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

// only export a factory method
module.exports = (...args) => new RDFMapper(...args)
