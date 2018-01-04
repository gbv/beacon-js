const { MetaFields, metaFieldValue } = require('./metafields')
const { whitespaceNormalize, replaceDisallowedChars } = require('./characters')
const { Transform } = require('stream')

class Parser extends Transform {
  constructor (options = {}) {
    super({objectMode: true})

    this.meta = MetaFields()
    this.metaRead = false
    this.lineNumber = 0
    this.buffer = ''

    // emit links
    this.on('token', tokens => {
      var link = this.meta.constructLink(...tokens)
      if (link) this.push(link)
    })
  }

  _transform (data, enc, cb) {
    if (typeof data !== 'string') data = data.toString()

    if (this.buffer !== '') {
      data = this.buffer + data
      this.buffer = ''
    }

    var error = null

    if (data.match(/\n|\r./)) {
      var lines = data.split(/\r\n|\r|\n/)
      data = lines.pop()

      for (let line of lines) {
        error = this._processLine(line)
        if (error) break
      }
    }

    this.buffer = data
    cb(error)
  }

  _processLine (line) {
    this.lineNumber++

    var clean = replaceDisallowedChars(line)
    line = clean

    if (!this.metaRead) {
      if (line[0] === '#') {
        var match = line.match(/^#([A-Z]+)[: ]\s*(.*)$/)

        if (match) {
          var value = metaFieldValue(match[1], match[2])
          if (value !== null && value !== undefined) {
            this.meta[match[1]] = value
          }
          return null
        } else {
          var error = new Error('invalid meta line')
          error.line = line
          error.number = this.lineNumber
          return error
        }
      } else {
        this.emit('meta', this.meta)
        this.metaRead = true
      }
    }

    line = whitespaceNormalize(line)

    if (line !== '') {
      this.emit('token', line.split('|').map(whitespaceNormalize))
    }

    return null
  }

  _flush (cb) {
    var error = null

    if (this.buffer !== '') {
      error = this._processLine(this.buffer)
      this.buffer = ''
    }

    cb(error)
  }

  parse (stream) {
    if (!stream.readable) return Promise.resolve([])

    return new Promise((resolve, reject) => {
      if (!stream.readable) return resolve([])

      var dump = { links: [] }

      stream = stream.pipe(this)

      function onEnd (error) {
        if (error) reject(error); else resolve(dump)
      }

      stream.on('meta', meta => { dump.meta = meta })
      stream.on('data', link => dump.links.push(link))
      stream.on('end', onEnd)
      stream.on('error', onEnd)
    })
  }
}

module.exports = (...args) => new Parser(...args)
