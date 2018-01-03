const { MetaFields } = require('./metafields')

class Serializer {
  constructor (options = {}) {
    this.omitDefaults = options.omitDefaults
    this.omitEmptyLine = options.omitEmptyLine

    var highlight = options.highlight || {}
    ;['delimiter', 'field', 'value', 'source', 'annotation', 'target'].forEach(col => {
      if (!highlight[col]) highlight[col] = s => s
    })

    this.highlight = highlight
  }

  * metaLines (metaFields) {
    if (!metaFields) metaFields = MetaFields()

    const hl = this.highlight
    var meta = metaFields.simplify(this.omitDefaults)
    var lines = Object.keys(meta).map(
      field => hl.delimiter('#') + hl.field(field) + hl.delimiter(': ') + hl.value(meta[field])
    )

    if (lines.length) {
      if (!this.omitDefaults) lines.unshift(hl.delimiter('#FORMAT: BEACON'))
      if (!this.omitEmptyLine) lines.push('')
    }

    for (let line of lines) {
      yield line + '\n'
    }
  }

  linkLine (source, annotation, target) {
    var tokens = [ this.highlight.source(source) ]
    if (annotation !== undefined) {
      tokens.push(this.highlight.annotation(annotation))
      if (target !== undefined) {
        tokens.push(this.highlight.target(target))
      }
    } else {
      if (target !== undefined) {
        if (target.match(/^https?:\/\//)) {
          tokens.push('')
        }
        tokens.push(this.highlight.target(target))
      }
    }
    return tokens.join(this.highlight.delimiter('|')) + '\n'
  }
}

module.exports = opts => new Serializer(opts)
