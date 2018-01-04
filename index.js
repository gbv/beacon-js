const Parser = require('./lib/parser')
const Writer = require('./lib/writer')
const characters = require('./lib/characters')
const { metaFieldValue, MetaFields } = require('./lib/metafields')
const URIPattern = require('./lib/uripattern')
const RDFMapper = require('./lib/rdfmapper')
const TokenIndex = require('./lib/tokenindex')

module.exports = {
  MetaFields,

  replaceDisallowedChars: characters.replaceDisallowedChars,
  whitespaceNormalize: characters.whitespaceNormalize,

  Parser,
  parse: (stream, options) => Parser(options).parse(stream),
  Writer,
  RDFMapper,

  metaFieldValue,
  URIPattern,

  TokenIndex
}
