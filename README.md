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

### As library

~~~
const beacon = require('beacon-links')
~~~

See [API description](#api) below for details.

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

### LinkDump

[BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#introduction) are implemented as object with a `meta` property for the [meta fields](#metafields) and a `links` property with an array of [Link](#link):

~~~
interface LinkDump {
  attribute MetaFields meta;
  attribute Link[] links;
}
~~~

Link dump objects are not required when processing link dumps as streams.

### MetaFields

[BEACON meta fields](http://gbv.github.io/beaconspec/beacon.html#meta-fields) are implemented as object with properties for each meta field:

~~~
interface MetaFields {
  attribute URIPattern PREFIX;
  attribute URIPattern TARGET;
  attribute string MESSAGE;
  attribute URI|URIPattern RELATION;
  attribute URI ANNOTATION;
  attribute string DESCRIPTION;
  attribute string CREATOR;
  attribute string CONTACT;
  attribute URL HOMEPAGE;
  attribute URL FEED;
  attribute string TIMESTAMP;
  attribute string UPDATE;
  attribute URI SOURCESET;
  attribute URI TARGETSET;
  attribute string NAME;
  attribute string INSTITUTION;
}
~~~

Property values `PREFIX`, `TARGET`, and `RELATION` can be [URIPattern](#uripattern) objects.  URIs and URLs are stored as plain strings. Additional constraints apply on property TIMESTAMP and UPDATE. A new MetaFields object can be created with function `MetaFields`:

~~~javascript
meta = beacon.MetaFields({INSTITUTION: 'ACME'})
console.log(meta.RELATION) // default value "http://www.w3.org/2000/01/rdf-schema#seeAlso"
~~~

### Link

[BEACON links](http://gbv.github.io/beaconspec/beacon.html#links) are implemented as object with four properties:

~~~
interface Link {
  attribute string source;
  attribute string target;
  attribute string relation;
  attribute string annotation;
}
~~~

Function `Link` can be used for [link construction](http://gbv.github.io/beaconspec/beacon.html#link-construction) from meta fields and link tokens:

~~~
meta = MetaFields({
  PREFIX: 'http://example.org/',
  TARGET: 'http://example.com/',
 MESSAGE: 'Hello World!'
}(
link = Link(['foo'], meta)
~~~

### Parser

Parsing [BEACON format](http://gbv.github.io/beaconspec/beacon.html#beacon-format) is implemented as stream transformer. A parser emits

* a `meta` event for all meta fields combined (with [MetaField](#MetaField) interface)
* a `token` event for each non-empty link line (with an array of tokens)
* a `data` event for each constructed link (with [Link](#Link) interface)
* a `error` event on parsing errors (with [Error](#Error) interface)

~~~javascript
fs.createReadStream('beacon-file.txt')
  .pipe(beacon.Parser())
  .on('meta', metaFields => ... )
  .on('token', tokens => ... )
  .on('data', link => ... )
  .on('error', error => ... )
~~~

The `parse` method can alternatively be used to parse the whole stream and return a promise with a [LinkDump](#linkdump) on success:

~~~javascript
beacon.parse(fs.createReadStream('beacon-file.txt'))
  .then(dump => ...)
  .catch(error => ...)
~~~

### Serializer

Implements serialization of link dumps in [BEACON format](http://gbv.github.io/beaconspec/beacon.html#beacon-format)

~~~javascript
const serializer = beacon.Serializer()
for (let line of serializer.metaLines(metaFields)) {
  stream.write(line)
}

stream.write(serializer.linkLine(source, annotation, target))
~~~

Serialization can be configured with:

* `omitDefaults` to omit meta fields with default values (false by default)
* `omitEmptyLine` to omit the empty line after meta fields
* `highlight`: optional object with functions to highlight
    * `delimiter` (delimiter characters)
    * `field` (meta field name)
    * `value` (meta field value)
    * `source` (source token)
    * `annotation` (annotation token)
    * `target` (target token)

### Error

An `Error` object is extended by properties `number` and `line` for parsing errors.

### URIPattern

Implements [BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#uri-patterns)

~~~
interface URIPattern {
  string expand(string ID);
  attribute string uriSpace;
  attribute string uriRegexPattern;  // not implemented yet
  string toString();
}
~~~

### RDFMapper

~~~
interface RDFMapper {
  Object *triples(LinkDump dump);

  Object *metaTriples(MetaFields meta);
  Object *linkTriples(Link link, String annotation);
  Object *countTriples();
}
~~~

BEACON link dumps can be mapped to RDF with the `rdfmapper` function. It requires an instance of the [JavaScript RDF Interfaces DataFactory interface].

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

