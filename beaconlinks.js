#!/usr/bin/env node

/**
 * Read BEACON from file or standard input.
 */

const beacon = require('./index')
const fs = require('fs')
const stdout = process.stdout

// yet another getopt-alike implementation to avoid dependencies
const [opt, file] = ((args) => {
  var options = {
    '-h, --help': 'show usage information',
    '-b, --brief': 'omit meta fields having default values',
    '-l, --links': 'only write links',
    '-m, --meta': 'only read and write meta fields',
    '-f, --format <format>': 'output format (txt|ndjson|rdf)',
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

// Partial implementation of RDF Environment Interface as NTriples writer
// or DataFactory interface
const RDF = {
  triple: (subject, predicate, object) =>
    [subject, predicate, object].join(' ') + ' .\n',
  namedNode: (value) =>
    value.match(/^[a-z]+:[a-z]+$/i) ? value : '<' + value + '>',
  blankNode: (name) =>
    '_:' + name,
  literal: (value, datatype) =>
    '"' + value + '"' + (datatype ? '^^' + datatype : '')
}

const rdfWriter = (out => {
  return { add: triple => out.write(triple) }
})(stdout)

const stream = file === '-' ? process.stdin : fs.createReadStream(file)

beacon.parser(stream, (dump) => {
  if (opt.format === 'ndjson') {
    for (let link of dump.links()) {
      stdout.write(JSON.stringify(link) + '\n')
    }
  } else if (opt.format === 'rdf') {
    const rdfmapper = beacon.rdfMapper(RDF)

    if (!opt.links) {
      for (let triple of rdfmapper.metaFieldTriples(dump.metaFields)) {
        rdfWriter.add(triple)
      }
      stdout.write('\n')
    }

    if (!opt.meta) {
      for (let triple of rdfmapper.linkTriples(dump.links(), dump.metaFields.ANNOTATION)) {
        rdfWriter.add(triple)
      }
    }

    if (!opt.links) {
      stdout.write('\n')
      for (let triple of rdfmapper.countTriples()) {
        rdfWriter.add(triple)
      }
    }
  } else {
    var highlight = opt.color ? {
      delimiter: s => '\u001b[2m' + s + '\u001b[22m',
      field: s => '\u001b[1m' + s + '\u001b[22m',
      source: s => '\u001b[34m' + s + '\u001b[39m',
      target: s => '\u001b[36m' + s + '\u001b[39m'
    } : {}
    var writer = require('./lib/writer')(process.stdout, {
      omitDefaults: opt.brief,
      omitEmptyLine: opt.meta,
      highlight: highlight
    })
    if (!opt.links) {
      writer.writeMetaLines(dump.metaFields)
    }
    if (!opt.meta) {
      for (let tokens of dump.linkTokens()) {
        writer.writeLinkLine(...tokens)
      }
    }
  }
}, (error) => {
  // TODO: not implemented yet
  console.error(error)
})
