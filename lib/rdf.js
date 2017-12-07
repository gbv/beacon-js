const { isURI } = require('./datatypes')

// Expects annotation to be a valid URI
function mapTriples(link, annotation) {
  var triples = [ [link.source, link.relation, link.target] ]

  if (!triples[0].every(uri => isURI(uri))) {
    return []
  }

  if (link.annotation !== '' && annotation) {
    triples.push([ link.target, annotation, link.annotation ])
  }

  return triples
}

module.exports = { mapTriples }
