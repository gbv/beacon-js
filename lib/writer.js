const { MetaFields } = require('./metafields')

class Writer {
  constructor (stream, options) {
    // stream
    if (stream && typeof stream.write !== 'function') {
      options = stream
      stream = null
    }

    if (stream) {
      this.writeLine = (line) => { stream.write(line + '\n') }
    } else {
      this.output = ''
      this.writeLine = (line) => { this.output += line + '\n' }
    }

    // options
    if (!options) options = {}
    this.omitDefaults = options.omitDefaults
    this.omitEmptyLine = options.omitEmptyLine

    var highlight = options.highlight || {}
    ;['delimiter', 'field', 'value', 'source', 'annotation', 'target'].forEach(col => {
      if (!highlight[col]) highlight[col] = s => s
    })

    this.highlight = highlight
  }

  writeMeta (metaFields) {
    if (!metaFields) metaFields = MetaFields()

    const hl = this.highlight
    var meta = metaFields.simplify(this.omitDefaults)
    var lines = Object.keys(meta).map(
      field => hl.delimiter('#') + hl.field(field) + hl.delimiter(': ') + hl.value(meta[field])
    )

    if (lines.length) {
      lines.unshift(hl.delimiter('#FORMAT: BEACON'))
      if (!this.omitEmptyLine) lines.push('')
    }

    for (let line of lines) {
      this.writeLine(line)
    }
  }

  writeTokens (source, annotation, target) {
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
    this.writeLine(tokens.join(this.highlight.delimiter('|')))
  }
}

module.exports = (...args) => new Writer(...args)
