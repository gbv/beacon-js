# beacon-links.js

[![npm package](https://img.shields.io/npm/v/beacon-links.svg?style=flat-square)](https://www.npmjs.com/package/beacon-links)
[![Build Status](https://img.shields.io/travis/gbv/beacon-js.svg?style=flat-square)](https://travis-ci.org/gbv/beacon-js)
[![Coverage](https://img.shields.io/coveralls/gbv/beacon-js/master.svg?style=flat-square)](https://coveralls.io/r/gbv/beacon-js)
[![License](https://img.shields.io/npm/l/beacon-links.svg?style=flat-square)](https://opensource.org/licenses/MIT)

JavaScript implementation of [BEACON link dump format](https://gbv.github.io/beaconspec/). The `beacon-links` package provides for:

* **[Parsing](#parsing)** BEACON link dump format
* **[Writing](#writing)** BEACON link dump format
* **[RDF Mapping](#rdf-mapping)** BEACON link dumps
* **[Storage](#storage)** of BEACON link dumps in memory
* **[command line client](#command-line-client)** for processing BEACON link dumps

## Installation

Requires at least node.js 6.4. Install the [npm package](https://npmjs.org/package/beacon-links):

    $ npm install beacon-links

## Introduction

[BEACON](https://gbv.github.io/beaconspec/) is a data interchange format for large numbers of uniform links. A **BEACON link dump** consists of a set of links and a set of describing metadata fields. Link dumps can be serialized in a condense text format that utilizes common patterns for abbreviation. Link dumps can further be mapped to and from RDF with minor limitations. The most popular use case of BEACON link dumps is collection of resources related to entities identified in authority files.

For example this link dump in BEACON format consists two links from authors, identified by their Integrated Authority File URI (GND), to reviews in the German literary magazine "Perlentaucher":

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

The `beacon-links` package and its [command line client](#command-line-client) provide methods to parse, serialize and map BEACON link dumps:

~~~javascript
const { MetaFields } = require('beacon-links')

var meta = MetaFields({
  PREFIX: 'http://d-nb.info/gnd/',
  TARGET: 'http://www.perlentaucher.de/autor/',
  TARGETSET: 'http://www.wikidata.org/entity/Q2071388',
  NAME: 'Perlentaucher',
  TIMESTAMP: '2017-11-24'
})

var link = meta.constructLink('118757261', 'Dylan Thomas', 'dylan-thomas.html')
~~~

## Command line client

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

## Parsing

A `Parser` reads [BEACON format] from strings or [streams]. Method `parse` returns a with the whole link dump on success or an [Error] otherwise. The link dump is an object with properties `meta` (a [MetaFields]) and `links` (an array of [Link]). Parsing errors come with properties `number` for the line number and `line` for the faulty line.

~~~javascript
var parser = beacon.Parser()
var input = fs.createReadStream('beacon-file.txt')

parser.parse(input)
  .then(dump => {
    console.log('Read %d links', dump.links.length)
  ))
  .catch(error => {
    console.error('%s at line %d: %s', error.message, error.number, error.line)
  })
~~~

For more details and large data sets the parser should better be used on [streams]. Parsing emits:

* a `meta` event for all meta fields combined (a [MetaFields])
* a `tokens` event for each non-empty link line, passed as non-normalized array of tokens
* a `data` event for each constructed link (a [Link])
* a `error` event on parsing errors

~~~javascript
var parser = beacon.Parser()
fs.createReadStream('beacon-file.txt')
  .pipe(parser)
  .on('meta', metaFields => ... )
  .on('tokens', tokens => ... )
  .on('data', link => ... )
  .on('error', error => ... )
  .on('end', () => ... ) // called after successful parsing
~~~

To only parse meta fields, close the input stream like this:

~~~javascript
var input = fs.createReadStream('beacon-file.txt')
input.pipe(parser).on('meta' => {
  // ... 
  input.destroy()
})
~~~

## Writing

A `Writer` writes [BEACON format] to strings:

~~~javascript
writer = beacon.Writer(options)
writer.writeMeta(metaFields)
writer.writeTokens(source, annotation, target)
process.stdout.write(writer.output)
~~~

or to [streams]:

~~~javascript
writer = beacon.Writer(process.stdout, options)
writer.writeMeta(metaFields)
writer.writeTokens(source, annotation, target)
~~~

Writer options include:

* `omitDefaults` to omit meta fields with default values (false by default)
* `omitEmptyLine` to omit the empty line after meta fields
* `highlight`: optional object with functions to highlight
    * `delimiter` (delimiter characters)
    * `field` (meta field name)
    * `value` (meta field value)
    * `source` (source token)
    * `annotation` (annotation token)
    * `target` (target token)

## RDF Mapping

BEACON link dumps can be [mapped to RDF](https://gbv.github.io/beaconspec/beacon.html#mapping-to-rdf) with `RDFMapper`. The constructor can be configured with an instance of the [JavaScript RDF Interfaces DataFactory interface]. By default [N3 triples representation](https://github.com/RubenVerborgh/N3.js/blob/master/README.md#triple-representation) is used.

~~~
interface RDFMapper {
  Object *metaTriples(MetaFields meta);
  Object *linkTriples(Link link, String annotation);
  Object *countTriples();
  Object *allTriples(MetaFields meta, Link* links);
}
~~~

~~~javascript
const { RDFMapper } = require('beacon-links')

var mapper = RDFMapper(dataFactory)
for (let triple of mapper.allTriples(linkDump)) {
  // ...
}
~~~

## API

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

  string getValues(bool brief);

  Link constructLink(string source, string annotation, string target);
  array constructTokens(Link link);
}
~~~

Property values `PREFIX`, `TARGET`, and `RELATION` can be [URIPattern](#uripattern) objects.  URIs and URLs are stored as plain strings. Additional constraints apply on property TIMESTAMP and UPDATE. Empty fields are set to the empty string. A new MetaFields object can be created with function `MetaFields`:

~~~javascript
meta = beacon.MetaFields({INSTITUTION: 'ACME'})
console.log(meta.RELATION) // default value "http://www.w3.org/2000/01/rdf-schema#seeAlso"
~~~

Method `getValues` returns a plain object with flat field values, optionally omitting default values.

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

Links can [be constructed](http://gbv.github.io/beaconspec/beacon.html#link-construction) from meta fields and link tokens:

~~~javascript
meta = MetaFields({
  PREFIX: 'http://example.org/',
  TARGET: 'http://example.com/',
  MESSAGE: 'Hello World!'
})
link = meta.constructLink('foo')
~~~

### URIPattern

Implements [BEACON link dumps](http://gbv.github.io/beaconspec/beacon.html#uri-patterns)

~~~
interface URIPattern {
  string expand(string ID);
  attribute string uriSpace;
  attribute string uriRegexPattern;  // not implemented yet
  string toString();
  string match(string);
  boolean isDefault();
}
~~~

The `match` method can be used to abbreviate a URI to a token. Method `isDefault` return whether the pattern is `{+ID}`.

## Storage

An experimental `TokenIndex` is included to efficiently store and query links in memory.

To index a BEACON link dump:

~~~javascript
var input = fs.createReadStream('beacon-file.txt')
var index = beacon.TokenIndex()

index.parse(stream, (error) => {
  // called on success or error
})
.on('meta', metaFields => { ... }) // optional
~~~

[JavaScript RDF Interfaces DataFactory interface]: http://rdf.js.org/#datafactory-interface
[rdf-ext]: https://www.npmjs.com/package/rdf-ext

## Contribution

Bug reports and fixes [are welcome](https://github.com/gbv/beacon-js/issues)! 

Clone this [project from github](https://github.com/gbv/beacon-js)

    git clone https://github.com/gbv/beacon-js.git


[BEACON format]: http://gbv.github.io/beaconspec/beacon.html#beacon-format

[MetaFields]: #MetaFields
[Link]: #link

[Error]: https://nodejs.org/api/errors.html
[streams]: http://nodejs.org/api/stream.html
