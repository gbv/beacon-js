#!/usr/bin/env node

/**
 * Read BEACON from file or standard input.
 */

const beacon = require('./index')
const fs = require('fs')
const stdout = process.stdout

// yet another getopt-alike implementation
const [opt, file] = ((args) => {
  var options = {
    '-h, --help': 'show usage information',
    '-b, --brief': 'omit meta fields having default values',
    '-l, --links': 'only write links',
    '-m, --meta': 'only read and write meta fields',
    '-f, --format <format>': 'output format (txt|ndjson|rdf)',
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

const stream = file === '-' ? process.stdin : fs.createReadStream(file)


function metaLines(meta, brief=false) {
  var lines = []
  for (let field in meta) {
    if (meta[field] !== '') {
      if (!brief || String(meta[field]) !== String(beacon.metaFieldValue(field))) {
        lines.push('#' + field + ': ' + meta[field])
      }
    }
  }
  if (lines.length || !brief) {
    lines.unshift('#FORMAT: BEACON')
  }
  return lines
}

beacon.parser(stream, (dump) => {
  let meta = dump.meta()
  
  if (opt.format === 'ndjson') {
    for (let link of dump.links()) {
      stdout.write(JSON.stringify(link) + '\n')
    }
  } else if (opt.format === 'rdf') {
    var triples = 0
    if (!opt.links) {    
      // TODO
      stdout.write('# mapping meta fields to RDF not implemented yet')
    }
    if (!opt.meta) {
      var totalItems = 0
      for (let [link, annotation] of dump.triples()) {
         stdout.write( link.map(uri => `<${uri}>`).join(' ') + '.\n')
         if (annotation) {
           // TODO: escape
           stdout.write('<'+annotation[0]+'> <'+annotation[1]+'> "'+annotation[2]+'" .\n')
         }
         triples += annotation ? 2 : 1
         totalItems++
      }
      if (!opt.links) {
        stdout.write('_:dump <http://www.w3.org/ns/hydra/core#> "'+totalItems+'"^^<http://www.w3.org/2001/XMLSchema#integer> .\n')
        stdout.write('_:dump <http://rdfs.org/ns/void#triples> "'+triples+'"^^<http://www.w3.org/2001/XMLSchema#integer> .\n')
      }
    }    
  } else {
    if (!opt.links) {
      var metalines = metaLines(meta, opt.brief)    
      if (metalines.length) {    
        stdout.write(metalines.join('\n')+'\n')
        if (!opt.meta) stdout.write('\n')
      }
    }
    if (!opt.meta) {
      for (let tokens of dump.linkTokens()) {
        stdout.write(tokens.join('|')+'\n')
      }
    }
  }
}, (error) => {
  // TODO: not implemented yet
  console.error(error)
})
