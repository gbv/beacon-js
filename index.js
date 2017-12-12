const Writer = require('./lib/writer')
const characters = require('./lib/characters')
const links = require('./lib/links')
const { metaFieldValue, MetaFields } = require('./lib/metafields')
const uriPattern = require('./lib/uripattern')
const RDFMapper = require('./lib/rdfmapper')
const RDFSerializer = require('./lib/rdfserializer')

module.exports = {
  MetaFields,
  Writer,
  replaceDisallowedChars: characters.replaceDisallowedChars,
  whitespaceNormalize: characters.whitespaceNormalize,
  parser: require('./lib/parser.js'),
  constructLink: links.constructLink,
  metaFieldValue,
  uriPattern,
  RDFMapper,
  RDFSerializer
}
