const URI = require('uri-js')

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

  isTimestamp: value => {
    return value.match(/^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T\d\d:\d\d:\d\d(\.\d+)?(Z|[+-]\d\d:\d\d))?$/)
  },

  isUpdate: value => {
    return value.match(/^(always|hourly|daily|weekly|monthly|yearly|nevery)$/)
  }

}
