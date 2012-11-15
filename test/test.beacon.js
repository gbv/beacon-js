var assert = require('assert');
var beacon = require('./../lib/beacon.js');

suite('beacon', function() {

	function parseBeaconTest(s,records,metadata,options) {
	  return function() {
		var b = beacon.parse(s,options);
		var exp = {
		  records: records,
		  metadata: metadata
		};
		assert.deepEqual(b, exp);
	  };
	};

	test("parseBeacon", parseBeaconTest(
	  '#FORMAT:  BEACON\n#FOO:  BAR\r\n#doZ: b  a\tz',
	  [],
	  { 
		format: "BEACON",
		foo: "BAR",
		doz: "b a z"
	  }
	));

	test("parseBeacon", parseBeaconTest(
	  '#FORMAT: BEACON\n\ra:bc\nf:oo|http://example.org/\nf:oo|doz|b:az',
	  [['a:bc','','a:bc'],
	   ['f:oo','','http://example.org/'],
	   ['f:oo','doz','b:az']
	  ],
	  {
		format: "BEACON"
	  }
	));

});
