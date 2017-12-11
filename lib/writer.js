const { metaFieldValue } = require('./metafields')

class Writer {
  constructor (outputStream, options = {}) {
    this.stream = outputStream
    this.omitDefaults = options.omitDefaults
    this.omitEmptyLine = options.omitEmptyLine
    var highlight = options.highlight || {}
    ;['delimiter', 'field', 'value', 'source', 'annotation', 'target'].forEach(col => {
      if (!highlight[col]) highlight[col] = s => s
    })
    this.highlight = highlight
  }

  writeMetaLines (metaFields) {
    const hl = this.highlight
    var lines = []
    for (let field in metaFields) {
      if (metaFields[field] !== '') {
        if (!this.omitDefaults ||
            String(metaFields[field]) !== String(metaFieldValue(field))) {
          lines.push(hl.delimiter('#') + hl.field(field) + hl.delimiter(': ') +
                     hl.value(metaFields[field]))
        }
      }
    }
    if (lines.length) {
      if (!this.omitDefaults) lines.unshift(hl.delimiter('#FORMAT: BEACON'))
      if (!this.omitEmptyLine) lines.push('')
    }
    lines.forEach(line => this.stream.write(line + '\n'))
  }

  writeLinkLine (source, annotation, target) {
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
    this.stream.write(tokens.join(this.highlight.delimiter('|')) + '\n')
  }
}

module.exports = (...args) => new Writer(...args)
