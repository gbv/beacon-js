/**
 * URI patterns (section 2.4)
 */
const { whitespaceNormalize } = require('./characters')
const uriTemplate = require('uri-templates')

class URIPattern {
  constructor (template) {
    this.template = template
  }

  expand (id) {
    return this.template.fill({ID: id})
  }

  toString () {
    return this.template.toString()
  }

  get uriSpace () {
    if (this.template.varNames.length !== 1) return ''
    var match = this.toString().match(/^(.+){\+?ID}$/)
    return match ? match[1] : ''
  }

  match (uri) {
    const vars = this.template.fromUri(uri)
    return vars ? vars.ID : null
  }
}

// factory method for class URIPattern
module.exports = (string, appendID = false) => {
  let value = whitespaceNormalize(string)

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
  const template = uriTemplate(value)
  if (!template.varNames.every(name => name === 'ID')) return null

  // all expressions must be {+ID} or {ID}
  if (template.varNames.length !== expressions.length) return null

  return new URIPattern(template)
}
