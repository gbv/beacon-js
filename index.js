const Parser = require('./lib/parser')
const Serializer = require('./lib/serializer')
const characters = require('./lib/characters')
const Link = require('./lib/link')
const { metaFieldValue, MetaFields } = require('./lib/metafields')
const uriPattern = require('./lib/uripattern')
const RDFMapper = require('./lib/rdfmapper')
const TokenIndex = require('./lib/tokenindex')

module.exports = {
  Link,
  MetaFields,

  replaceDisallowedChars: characters.replaceDisallowedChars,
  whitespaceNormalize: characters.whitespaceNormalize,

  Parser,
  parse: (stream, options) => Parser(options).parse(stream),

  Serializer,
  RDFMapper,

  metaFieldValue,
  uriPattern,

  TokenIndex,
}
