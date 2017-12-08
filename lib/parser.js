const fs = require('fs')
const { Readable } = require('stream')
const { metaFields, metaFieldValue } = require('./metafields')
const { whitespaceNormalize } = require('./characters')
const { constructLink } = require('./links')

/**
 * Read normalized lines from a stream.
 */
class LineReader {
  constructor (reader) {
    this.reader = reader
    this.lineNumber = 0
    this.lineBuffer = []
    this.charBuffer = ''
  }

  // read and return a line or null
  read () {
    if (this.hasLines()) {
      this.lineNumber++
      return this.lineBuffer.shift()
    } else {
      return null
    }
  }

  // return number of the line previously read
  line () {
    return this.lineNumber
  }

  // return read line line without reading it
  peek () {
    return this.hasLines() ? this.lineBuffer[0] : null
  }

  // check whether there are more lines to read
  hasLines () {
    if (this.lineBuffer.length) return true

    var chars = this.charBuffer
    var chunk = null

    // FIXME: may this exhaust the reader so null is not the end?
    while ((chunk = this.reader.read()) !== null) {
      chars = chars + chunk
      if (chars.match(/\n|\r./)) break
    }

    var lines = chars === '' ? [] : chars.split(/\r\n|\r|\n/)

    if (chunk === null) {  // end of stream
      this.charBuffer = ''
    } else {
      this.charBuffer = ''
      this.charBuffer = lines.pop()
    }
    this.lineBuffer = lines

    return this.lineBuffer.length > 0
  }
}

// implements LinkDump interface
class BeaconParser {
  constructor (stream) {
    // stream must be readable!
    this.lineReader = new LineReader(stream)
  }

  readMetaFields () {
    if (this.meta) return

    this.meta = metaFields()

    var line = this.lineReader.peek()
    while (line !== null && line.match(/^#/)) {
      line = this.lineReader.read()
      var match = line.match(/^#([A-Z]+)[: ]\s*(.*)$/)
      if (match) {
        var value = metaFieldValue(match[1], match[2])
        if (value !== null && value !== undefined) {
          this.meta[match[1]] = value
        }
      } else {
        // TODO: use Promise to emit errors?
        console.error(line)
        return
      }
      line = this.lineReader.peek()
    }
  }

  get metaFields () {
    this.readMetaFields()
    return this.meta
  }

  /**
   * Iterate over all link lines and return its tokens.
   *
   * Includes lines with more than three tokens but no empty lines.
   */
  * linkTokens () {
    this.readMetaFields()

    var line
    while ((line = this.lineReader.read()) !== null) {
      line = whitespaceNormalize(line)
      if (line !== '') {
        yield line.split('|')
      }
    }
  }

  /**
   * Iterate over all links.
   */
  * links () {
    for (let tokens of this.linkTokens()) {
      let link = constructLink(this.meta, tokens)
      if (link) yield link
    }
  }
}

module.exports = (input, callback, error) => {
  if (!error) {
    error = (e) => { throw Error(e) }
  }

  // TODO: move out of this module
  var stream
  if (typeof input === 'undefined') {
    stream = process.stdin
  } else if (typeof input === 'string') {
    stream = fs.createReadStream(input)
  } else if (input instanceof Readable) {
    stream = input
  } else {
    error('parser expects filename')
    return
  }

  var called = false
  try {
    stream.on('readable', () => {
      if (!called) {
        called = true
        callback(new BeaconParser(stream))
      }
    })
  } catch (e) {
    error(e)
  }
}
