# beacon-links.js

[![npm package](https://img.shields.io/npm/v/beacon-links.svg?style=flat-square)](https://www.npmjs.com/package/beacon-links)
[![Build Status](https://img.shields.io/travis/gbv/beacon-js.svg?style=flat-square)](https://travis-ci.org/gbv/beacon-js)
[![Coverage](https://img.shields.io/coveralls/gbv/beacon-js/master.svg?style=flat-square)](https://coveralls.io/r/gbv/beacon-js)
[![License](https://img.shields.io/npm/l/beacon-links.svg?style=flat-square)](https://opensource.org/licenses/MIT)

JavaScript implementation of [BEACON link dump format](https://gbv.github.io/beaconspec/).

## Installation

Requires at least NodeJS 6.4. Install latest [npm](https://npmjs.org/) release with

    $ npm install beacon-links

## Background

[BEACON](https://gbv.github.io/beaconspec/) is a data interchange format for large numbers of uniform links. A BEACON link dump consists of a set of links and a set of describing metadata fields. Link dumps can be serialized in a condense text format that utilizes common patterns for abbreviation. Link dumps can further be mapped to and from RDF with minor limitations. The most popular use case of BEACON link dumps is collection of resources related to some known entities.

To give an example, this link dump in BEACON format consists two links from authors, identified by their Integrated Authority File (GND) URI, to reviews in the German literary magazine "Perlentaucher":

    #PREFIX: http://d-nb.info/gnd/
    #TARGET: http://www.perlentaucher.de/autor/
    #TARGETSET: http://www.wikidata.org/entity/Q2071388
    #NAME: Perlentaucher
    #TIMESTAMP: 2017-11-24
    
    118757261|Dylan Thomas|dylan-thomas.html
    128915706|Shirin Ebadi|shirin-ebadi.html

The links can be mapped to RDF triples:

  <http://d-nb.info/gnd/118757261> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <http://www.perlentaucher.de/autor/dylan-thomas.html> .
  <http://d-nb.info/gnd/128915706> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <http://www.perlentaucher.de/autor/shirin-ebadi.html> .

This package and its command line client provide methods to parse, serialize and map BEACON link dumps.

## Usage

### Command line client

    $ beaconlinks -h

    Usage: beaconlinks [options] [file]

    Parse and serialize BEACON link dumps.

    Options:

      -h, --help             show usage information
      -b, --brief            omit meta fields having default values
      -l, --links            only write links
      -m, --meta             only read and write meta fields
      -f, --format <format>  output format (txt|json|rdf)
      -c, --color            enable color output
      -C, --no-color         disable color output

Try for instance `beaconlinks -f rdf test/perlentaucher.txt` to map the sample link dump to RDF.

### API

~~~javascript
const beacon = require('beacon-links')

var meta = beacon.MetaFields({
  PREFIX: 'http://d-nb.info/gnd/',
  TARGET: 'http://www.perlentaucher.de/autor/'
})

var tokens = ['118757261', 'Dylan Thomas', 'dylan-thomas.html']
var link = beacon.Link(tokens, meta)
~~~

#### LinkDump

[BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#introduction) are implemented as object with a `meta` property for the [meta fields](#metafields) and a `links` property with an array of [Link](#link) objects:

~~~
interface LinkDump {
  attribute MetaFields meta;
  attribute Link[] links;
}
~~~

However, LinkDump objects are not required when processing link dumps as streams.

#### MetaFields

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

  string simplify(bool brief);
}
~~~

Property values `PREFIX`, `TARGET`, and `RELATION` can be [URIPattern](#uripattern) objects.  URIs and URLs are stored as plain strings. Additional constraints apply on property TIMESTAMP and UPDATE. A new MetaFields object can be created with function `MetaFields`:

~~~javascript
meta = beacon.MetaFields({INSTITUTION: 'ACME'})
console.log(meta.RELATION) // default value "http://www.w3.org/2000/01/rdf-schema#seeAlso"
~~~

Method `simplify` returns a plain object with flat field values, optionally omitting default values.

#### Link

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

~~~javascript
meta = MetaFields({
  PREFIX: 'http://example.org/',
  TARGET: 'http://example.com/',
  MESSAGE: 'Hello World!'
}(
link = Link(['foo'], meta)
~~~

#### Parser

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

#### Serializer

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

#### Error

An `Error` object is extended by properties `number` and `line` for parsing errors.

#### URIPattern

Implements [BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#uri-patterns)

~~~
interface URIPattern {
  string expand(string ID);
  attribute string uriSpace;
  attribute string uriRegexPattern;  // not implemented yet
  string toString();
  string match(string);
}
~~~

The `match` method can be used to abbreviate a URI to a token.

#### RDFMapper

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

