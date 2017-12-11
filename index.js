const beaconWriter = require('./lib/writer')
const characters = require('./lib/characters')
const links = require('./lib/links')
const { metaFieldValue, metaFields } = require('./lib/metafields')
const uriPattern = require('./lib/uripattern')
const rdfMapper = require('./lib/rdfmapper')

module.exports = {
  beaconWriter,

  replaceDisallowedChars: characters.replaceDisallowedChars,
  whitespaceNormalize: characters.whitespaceNormalize,

  parser: require('./lib/parser.js'),

  constructLink: links.constructLink,

  metaFieldValue,
  metaFields,

  uriPattern,
  rdfMapper
}
