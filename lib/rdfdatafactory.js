/**
 * Returns a DataFactory that serializes RDF triples with optional highlighting.
 *
 * Only used internally.
 */
module.exports = (highlight) => {
  if (!highlight) highlight = {}

  const delimiter = highlight && highlight.delimiter ? highlight.delimiter : s => s

  return {
    triple: (subject, predicate, object) => {
      return [subject, predicate, object].join(' ') + delimiter(' .') + '\n'
    },

    namedNode: (iri) => {
      return delimiter('<') + iri + delimiter('>')
    },

    blankNode: (name) => {
      return delimiter('_:') + name
    },

    literal: (value, datatype) => {
      return delimiter('"') +
        String(value).replace(/["\\\r\n]/, c => '\\' + c) +
        delimiter('"') + (datatype ? delimiter('^^') + datatype : '')
    }
  }
}
