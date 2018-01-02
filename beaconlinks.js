#!/usr/bin/env node

/**
 * Read BEACON from file or standard input.
 */

const beacon = require('./index')
const fs = require('fs')
const RDFData = require('./lib/rdfdatafactory')
const stdout = process.stdout

// yet another getopt-alike (to avoid dependencies)
const [opt, file] = (args => {
  var options = {
    '-h, --help': 'show usage information',
    '-b, --brief': 'omit meta fields having default values',
    '-l, --links': 'only write links',
    '-m, --meta': 'only read and write meta fields',
    '-f, --format <format>': 'output format (txt|json|rdf)',
    '-c, --color': 'enable color output'
  }

  var opt = {}
  var file = '-'

  while (args.length) {
    let arg = args.shift()
    if (arg === '--') break
    if (arg.charAt(0) !== '-') {
      file = arg
    } else {
      for (let spec in options) {
        var names = spec.replace(/ <.+>$/, '').split(', ')
        if (names.some(n => n === arg)) {
          opt[names[1].substring(2)] = spec.match(/ <.+>$/) ? args.shift() : true
          break
        }
      }
    }
  }
  while (args.length) file = args.shift()

  if (opt.help) {
    stdout.write(
`Usage: beaconlinks [options] [file]

Parse and serialize BEACON link dumps.

Options:

`)
    for (let opt in options) {
      stdout.write('  ' + opt + ' '.repeat(23 - opt.length) + options[opt] + '\n')
    }
    process.exit(0)
  }

  return [opt, file]
})(process.argv.slice(2))

const highlight = opt.color ? {
  delimiter: s => '\u001b[2m' + s + '\u001b[22m',
  field: s => '\u001b[1m' + s + '\u001b[22m',
  source: s => '\u001b[34m' + s + '\u001b[39m',
  target: s => '\u001b[36m' + s + '\u001b[39m'
} : {}

const stream = (file === '-' ? process.stdin : fs.createReadStream(file))
  .pipe(beacon.Parser({}))
  .on('error', error => {
    var msg = error
    if (error.number !== undefined) msg += ' ' + error.number
    if (error.line !== undefined) msg += ': ' + error.line
    if (opt.color) msg = '\u001b[31m' + msg + '\u001b[39m'
    console.error(msg)
    process.exit(1)
  })

if (opt.format === 'json') {
  if (opt.meta) {
    stream.on('meta', meta => {
      meta = Object.keys(meta).reduce(
        (o, field) => {
          if (meta[field] !== '') {
            if (!opt.brief ||
            String(meta[field]) !== String(beacon.metaFieldValue(field))) {
              o[field] = String(meta[field])
            }
          }
          return o
        }, {})
      stdout.write(JSON.stringify(meta, null, 4) + '\n')
    })
  } else {
    stream.on('data', link => stdout.write(JSON.stringify(link) + '\n'))
  }
} else if (opt.format === 'rdf') {
  const rdfSerializer = RDFData(highlight)
  const rdfmapper = beacon.RDFMapper(rdfSerializer)

  var annotation
  stream.on('meta', meta => { annotation = meta.ANNOTATION })

  if (!opt.links) {
    stream.on('meta', meta => {
      for (let triple of rdfmapper.metaTriples(meta)) {
        stdout.write(triple)
      }
      stdout.write('\n')
    })
  }

  if (!opt.meta) {
    stream.on('data', link => {
      for (let triple of rdfmapper.linkTriples(link, annotation)) {
        stdout.write(triple)
      }
    })
  }

  if (!opt.links) {
    stream.on('end', () => {
      stdout.write('\n')
      for (let triple of rdfmapper.countTriples()) {
        stdout.write(triple)
      }
    })
  }
} else {
  const serializer = beacon.Serializer({
    omitDefaults: opt.brief,
    omitEmptyLine: opt.meta,
    highlight: highlight
  })

  if (!opt.links) {
    stream.on('meta', meta => {
      for (let line of serializer.metaLines(meta)) {
        stdout.write(line)
      }
    })
  }

  if (!opt.meta) {
    stream.on('token', tokens => {
      stdout.write(serializer.linkLine(...tokens))
    })
  }
}
