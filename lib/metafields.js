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

function MetaFields (fields = {}) {
  if (!(this instanceof MetaFields)) return new MetaFields(fields)

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

module.exports = { metaFieldValue, MetaFields }
