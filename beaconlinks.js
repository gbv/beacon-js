#!/usr/bin/env node

/**
 * Read BEACON from file or standard input.
 */

const beacon = require('./index')
const fs = require('fs')

const options = {
  '-h': 'show usage information',
  '-b': 'omit meta fields having default values',
  '-l': 'emit raw links'
}

var args = process.argv.slice(2)
var env = {}

while (args.length && args[0] in options) {
  env [ args.shift().substr(1) ] = true      
}

if (env.h) {
  console.log('parse and serialize BEACON from file or standard input')
  console.log('')
  for (let opt in options) {
    console.log(' ',opt,'\t',options[opt])
  }
  process.exit(0)
}

const stream = args.length ? fs.createReadStream(args[0]) : process.stdin

beacon.parser(stream, (dump) => {
  let meta = dump.meta()
  if (env.l) {
    for (let link of dump.links()) {
      console.log(link)
    }
  } else {
    for (let field in meta) {
      if (meta[field] !== '') {
        if (!env.b || String(meta[field]) !== String(beacon.metaFieldValue(field))) {
          console.log('#'+field+': '+meta[field])
        }
      }
    }
    console.log('') // TODO: only if not empty
    for (let tokens of dump.linkTokens()) {      
      console.log(tokens.join('|'))
    }
  }
}, (error) => {
  console.error(error)
})
