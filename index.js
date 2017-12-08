const characters = require('./lib/characters')
const links = require('./lib/links')
const datatypes = require('./lib/datatypes')
const { metaFieldValue, metaFields } = require('./lib/metafields')
const rdfmapper = require('./lib/rdfmapper')

module.exports = {
  replaceDisallowedChars: characters.replaceDisallowedChars,
  whitespaceNormalize: characters.whitespaceNormalize,

  parser: require('./lib/parser.js'),

  constructLink: links.constructLink,

  metaFieldValue,
  metaFields,

  rdfmapper,

  uriPattern: datatypes.uriPattern
}
