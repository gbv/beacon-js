# beacon.js

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

### Parsing

~~~javascript
const beacon = require('beacon-links')

...
~~~

### Serializing

~~~javascript
const beacon = require('beacon-links')

...
~~~

### Command line client

This packages includes a simple command-line client to parse, serialize, and map BEACON link dumps.

~~~shell
$ beaconlinks -h
$ beaconlinks beacon.txt
$ beaconlinks < beacon.txt
$ beaconlinks -l beacon.txt
$ beaconlinks -p beacon.txt
~~~

## API

...

## Contribution

Bug reports and fixes [are welcome](https://github.com/gbv/beacon-js/issues)! 

Clone this [project from github](https://github.com/gbv/beacon-js)

    git clone https://github.com/gbv/beacon-js.git

