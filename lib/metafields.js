const { isURI, isURL, isTimestamp, isUpdate } = require('./datatypes')
const { whitespaceNormalize } = require('./characters')
const uriPattern = require('./uripattern')

function optional (check, defaultValue = '', normalize = x => x) {
  return (value) => {
    if (value === undefined || value === '') {
      return defaultValue
    }
    value = whitespaceNormalize(value)
    return (check && !check(value)) ? null : normalize(value)
  }
}

const defaultPattern = optional(
  null,
  uriPattern('{+ID}'),
  value => uriPattern(value, true)
)

/**
 * Validate and expand meta field values (section 4) by replacing undefined
 * with default values, applying whitespace normalization and checking
 * constraints. Constraint violations will result in a null value which is
 * different from an empty field value.
 */
const knownMetaFields = {

  // Meta fields for link construction (4.1)
  PREFIX: defaultPattern,
  TARGET: defaultPattern,

  MESSAGE: optional(),

  RELATION: optional(
    null,
    'http://www.w3.org/2000/01/rdf-schema#seeAlso',
    value => {
      let pattern = uriPattern(value)
      if (pattern) return pattern
      return isURI(value) ? value : null
    }
  ),

  ANNOTATION: optional(isURI),

  // Meta fields for link dumps (4.2)
  DESCRIPTION: optional(),
  CREATOR: optional(),
  CONTACT: optional(),
  HOMEPAGE: optional(isURL),
  FEED: optional(isURL),
  TIMESTAMP: optional(isTimestamp),
  UPDATE: optional(isUpdate),

  // Meta fields for datasets (4.3)
  SOURCESET: optional(isURI),
  TARGETSET: optional(isURI),
  NAME: optional(),
  INSTITUTION: optional()
}

/**
* Returns a normalized field value, null for invalid values
* or undefined for unknown fields.
*/
function metaFieldValue (field, value) {
  return (field in knownMetaFields) ? knownMetaFields[field](value) : undefined
}

class MetaFields {
  constructor (fields = {}) {
    for (let field in fields) {
      let value = metaFieldValue(field, fields[field])
      if (value !== null && value !== undefined) {
        this[field] = value
      }
    }
    for (let field in knownMetaFields) {
      if (!this[field]) {
        this[field] = metaFieldValue(field)
      }
    }
  }

  getValues (brief = false) {
    return Object.keys(this).reduce(
        (o, field) => {
          if (this[field] !== '') {
            if (!brief ||
            String(this[field]) !== String(metaFieldValue(field))) {
              o[field] = String(this[field])
            }
          }
          return o
        }, {})
  }

  // 3.2. Link construction
  constructLink (s, a, t) {
    const norm = x => x === undefined ? '' : whitespaceNormalize(x)

    var source = norm(s)
    if (source === '') return

    var target = norm(t)
    if (target === '') target = source

    var annotation = norm(a)

    const relationIsURI = typeof this.RELATION !== 'object'

    const relationType = relationIsURI
        ? this.RELATION
        : this.RELATION.expand(annotation)

    // relation can be anything but empty
    if (relationType === '') return

    return {
      source: this.PREFIX.expand(source),
      target: this.TARGET.expand(target),
      relation: relationType,
      annotation: relationIsURI && annotation !== ''
          ? annotation
          : this.MESSAGE
    }
  }

  // reverse link construction
  constructTokens (link) {
    var source, annotation, target

    if (this.RELATION.expand) {
      if (link.annotation !== this.MESSAGE) return
      annotation = this.RELATION.match(link.relation)
      if (annotation === undefined) return
    } else {
      if (link.relation !== this.RELATION) return
      annotation = link.annotation
      if (annotation === this.MESSAGE) annotation = undefined
    }

    source = this.PREFIX.match(link.source)
    if (source === undefined) return

    target = this.TARGET.match(link.target)
    if (target === undefined) return

    // TODO: annotation must not start with http:?
    if (target !== source) {
      return [source, annotation, target]
    } else {
      if (annotation === undefined) {
        return [source]
      } else {
        return [source, annotation]
      }
    }
  }
}

module.exports = {
  metaFieldValue,
  MetaFields: fields => new MetaFields(fields)
}
