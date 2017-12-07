const URI = require('uri-js')
const UriTemplate = require('uri-templates')

module.exports = {

  /**
   * Check whether value is a URI
   */
  isURI: value => {
    const uri = URI.parse(value)
    return uri.scheme !== undefined && URI.serialize(uri) === value
  },

  /**
   * Check whether value is a URL
   */
  isURL: value => {
    const uri = URI.parse(value)
    return uri.scheme && uri.scheme.match(/^https?$/) && URI.serialize(uri) === value
  },

  /**
   * Converts a whitespace-normalized string into an URI pattern (2.4).
   */
  uriPattern: (value, appendID) => {
    // there must be at least one template expression
    let expressions = value.match(/{[+]?ID}/g)
    if (!expressions) {
      if (appendID) {
        value += '{ID}'
        expressions = ['{ID}']
      } else {
        return null
      }
    }

    // all template expressions must use variable name 'ID'
    const pattern = UriTemplate(value)
    if (!pattern.varNames.every(name => name === 'ID')) return null

    // all expressions must be {+ID} or {ID}
    if (pattern.varNames.length !== expressions.length) return null

    return pattern
  },

  isTimestamp: value => {
    return value.match(/^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d))?$/)
  },

  isUpdate: value => {
    return value.match(/^(always|hourly|daily|weekly|monthly|yearly|nevery)$/)
  }

}
