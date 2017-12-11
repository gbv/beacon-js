# beacon-links.js

> JavaScript implementation of [BEACON link dump format](https://gbv.github.io/beaconspec/)

*EXPERIMENTAL PRE-RELEASE*

[![npm package](https://img.shields.io/npm/v/beacon-links.svg)](https://www.npmjs.com/package/beaconlinks)
[![Build Status](https://travis-ci.org/gbv/beacon-js.svg)](https://travis-ci.org/gbv/beacon-js)
[![Coverage](https://img.shields.io/coveralls/gbv/beacon-js/master.svg)](https://coveralls.io/r/gbv/beacon-js)
[![License](https://img.shields.io/npm/l/beacon-links.svg)](https://opensource.org/licenses/MIT)

## Installation

Install the latest [npm](https://npmjs.org/) release with

    npm install beacon-links

Requires at least Node 6.4

## Usage

*Final API has not been specified yet. Please try the command line client for testing!*

<!--

### Parsing

~~~javascript
const beacon = require('beacon-links')

...
~~~

-->

### Serializing

~~~javascript
const { Writer } = require('beacon-links')

const writer = Writer(outputStream, options)
writer.writeMetaLines(metaFields)
writer.writeLinkLine(sourceTokens, annotationToken, targetToken)
~~~

***Configuration***

* `omitDefaults` to omit meta fields with default values (false by default)
* `omitEmptyLine` to omit the empty line after meta fields
* `highlight`: optional object with functions to highlight
    * `delimiter` (delimiter characters)
    * `field` (meta field name)
    * `value` (meta field value)
    * `source` (source token)
    * `annotation` (annotation token)
    * `target` (target token)

### Command line client

This packages includes a simple command-line client to parse, serialize, and map BEACON link dumps.

~~~shell
$ beaconlinks -h                    # show help
$ beaconlinks beacon.txt            # read and write BEACON format
$ beaconlinks < beacon.txt
$ beaconlinks -m beacon.txt         # only read and write meta lines
$ beaconlinks -f rdf beacon.txt     # map to RDF (incomplete by now)
~~~

## API

### Links

Implement [BEACON links](http://gbv.github.io/beaconspec/beacon.html#links)

~~~
interface Link {
  attribute string source;
  attribute string target;
  attribute string relation;
  attribute string annotation;
}
~~~

### Link dumps

Implement [BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#introduction)

~~~
interface LinkDump {
  attribute MetaFields metaFields;
  Link *links();
}
~~~

### URI Patterns

Implement [BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#uri-patterns)

~~~
interface URIPattern {
  string expand(string ID);
  attribute string uriSpace;
  attribute string uriSpace;
  attribute string uriRegexPattern;
  string toString();
}
~~~

### Meta fields

Implement [BEACON meta fields](http://gbv.github.io/beaconspec/beacon.html#meta-fields)

...

### BEACON file parser

...

### BEACON file writer

~~~
interface Writer {
  void writeMetaLines(MetaFields meta);
  void writeLinkLine(string source, string annotation, string target);
}
~~~

### Mapping to RDF

BEACON link dumps can be mapped to RDF with the `rdfmapper` function. It
requires an instance of the [JavaScript RDF Interfaces DataFactory interface].

~~~javascript
const { RDFMapper } = require('beacon-links')

var mapper = RDFMapper(dataFactory)
for (let triple of mapper.triples(linkDump)) {
  // ...
}

~~~

[JavaScript RDF Interfaces DataFactory interface]: http://rdf.js.org/#datafactory-interface
[rdf-ext]: https://www.npmjs.com/package/rdf-ext

## Contribution

Bug reports and fixes [are welcome](https://github.com/gbv/beacon-js/issues)! 

Clone this [project from github](https://github.com/gbv/beacon-js)

    git clone https://github.com/gbv/beacon-js.git

