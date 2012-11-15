// TODO: move recline specific parts to backend.beacon.js
this.recline = this.recline || {};
this.recline.Backend = this.recline.Backend || {};
this.recline.Backend.Beacon = this.recline.Backend.Beacon || {};

(function(my, $) {

  // ## fetch
  //
  // fetch supports 3 options depending on the attribute provided on the dataset argument
  //
  // 1. `dataset.file`: `file` is an HTML5 file object. This is opened and parsed with the Beacon parser.
  // 2. `dataset.data`: `data` is a string in Beacon format. This is passed directly to the Beacon parser
  // 3. `dataset.url`: a url to an online Beacon file that is ajax accessible (note this usually requires either local or on a server that is CORS enabled). The file is then loaded using $.ajax and parsed using the Beacon parser (NB: this requires jQuery)
  //
  // All options generates similar data and use the memory store outcome, that is they return something like:
  //
  // <pre>
  // {
  //   records: [ [...], [...], ... ],
  //   metadata: { Beacon meta fields and possibly file name }
  //   useMemoryStore: true
  // }
  // </pre>

  // TODO: only if $ defined!
 
  my.fetch = function(dataset) {
    var dfd = $.Deferred();
    if (dataset.file) {
      var reader = new FileReader();
      var encoding = dataset.encoding || 'UTF-8';
      reader.onload = function(e) {
        var beacon = my.parseBeacon(e.target.result, dataset);
        beacon.metadata.filename = dataset.file.name;
        beacon.useMemoryStore = true;
        dfd.resolve(beacon);
      };
      reader.onerror = function (e) {
        alert('Failed to load file. Code: ' + e.target.error.code);
      };
      reader.readAsText(dataset.file, encoding);
    } else if (dataset.data) {
      var beacon = my.parseBeacon(dataset.data, dataset);
      beacon.useMemoryStore = true;
      dfd.resolve(beacon);
    } else if (dataset.url) {
      $.get(dataset.url).done(function(data) {
        var beacon = my.parseBeacon(data, dataset);
        beacon.useMemoryStore = true;
        dfd.resolve(beacon);
      });
    }
    return dfd.promise();
  };

  // ## parseBeacon
  //
  // Parses Beacon text format.
  //
  // @return The Beacon parsed as an object with records (array) and metadata (object)
  // @type Object
  // 
  // @param {String} s The string to convert
  // @param {Object} options Options for loading Beacon including
  // 	  @param {Boolean} [expand=true] If set to True all links are expanded
  //
  my.parseBeacon = function(s, options) {

    var options = options || {};
    var expand = (options.expand === null) ? true : !!options.expand;

    var i = 0, line, meta = {
        target: '{+ID}',
        message: '{annotation}'
    }, links = [ ];

    // read the next line, delimited by "\n", "\r\n", "\r", or EOF
    var readLine = function() {
        if (i >= s.length) return null;

        var p, c;
        for (p = i; i < s.length; i++) {
            c = s.charAt(i);
            if (c == "\n") { 
                return s.substring(p, i++);
            } else if( c == "\r") {
                if ( s.charAt(i+1) == "\n" ) {
                    i += 2;
                    return s.substring(p, i-2);
                } else {
                    return s.substring(p, i++);
                }
            }
        }

        return s.substr(p); // last line
    }

    // TODO: remove BOM
    
    // Normalize to NFKC if Unicode Normalizer is available
    if (typeof(unorm) != "undefined") s = unorm.nfkc(s);

    while( (line = readLine()) != null && line.charAt(0) == '#' ) {
        var p = line.indexOf(':');
        if (p == -1) {
            i = s.length;
            break;
        }
        var field = line.substring(1,p).toLowerCase();
        var value = normalize(line.substring(p+1));
        
        meta[field] = value;
    }

    var shortmode = (meta.message == '{annotation}' && meta.target == '{+ID}');

    for( ; line != null; line = readLine() ) {
        var parts = line.split("|");
        
        var source = normalize(parts[0]);
        var target, annotation = "";

        if (source == "") continue;

        if (parts.length == 1) {
            target = source;
        } else if(parts.length == 2) {
            target = source;
            annotation = normalize(parts[1]); 
            if (shortmode && annotation.search(/^https?:/) == 0) {
                target = annotation;
                annotation = "";
            }
        } else if(parts.length == 3) {
            annotation = normalize(parts[1]); 
            target = normalize(parts[2]); 
        }

        var link = [source,annotation,target];

        // TODO: expand
        
        links.push(link);
    }

    delete meta.target;
    delete meta.message;

    return { records: links, metadata: meta };
  };

  my.parse = my.parseBeacon;

  // normalize whitespace in a string
  var normalize = String.prototype.trim ?
    function (s) { return s.trim().replace(/\s+/g,' '); } :
    function (s) { return s.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\s+/g,' '); };

}(this.recline.Backend.Beacon, typeof(jQuery) == "undefined" ? null : jQuery));

module.exports = this.recline.Backend.Beacon;
