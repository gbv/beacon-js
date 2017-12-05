const disallowedChars = /[\u0000-\u0008\u000B\u000D-\u001F\u007F-\u009F\uD800-\uDFFF]/g

module.exports = {

  /**
   * Replace all characters not allowed as specified in section 2.2.
   */
  replaceDisallowedChars: (string, strip = false) =>
    string.replace(disallowedChars, strip ? '' : '\uFFFD'),

  /**
   * Perform whitespace normalization as specified in section 2.3.
   */
  whitespaceNormalize: string =>
    string.replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '').replace(/[\t\r\n ]+/g, ' ')

}
