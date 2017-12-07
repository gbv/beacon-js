const characters = require('./lib/characters')
const links = require('./lib/links')
const datatypes = require('./lib/datatypes')
const { metaFieldValue, metaFields } = require('./lib/metafields')

module.exports = {
  replaceDisallowedChars: characters.replaceDisallowedChars,
  whitespaceNormalize: characters.whitespaceNormalize,

  parser: require('./lib/parser.js'),

  constructLink: links.constructLink,

  metaFieldValue,
  metaFields,

  uriPattern: datatypes.uriPattern
}
