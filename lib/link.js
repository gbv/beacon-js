const { whitespaceNormalize } = require('./characters')
const { MetaFields } = require('./metafields')

/**
 * Perform link construction (section 3.2).
 *
 * Expects tokens to match the TOKEN grammar rule.
 */
module.exports = (tokens, meta) => {
  var [source, annotation, target] = tokens.map(whitespaceNormalize)

  if (source === undefined || source === '') return

  if (target === undefined || target === '') target = source
  if (annotation === undefined) annotation = ''

  if (!meta) meta = MetaFields()

  const relationIsURI = typeof meta.RELATION !== 'object'

  const relationType = relationIsURI
      ? meta.RELATION
      : meta.RELATION.expand(annotation)

  // relation can be anything but empty
  if (relationType === '') return

  return {
    source: meta.PREFIX.expand(source),
    target: meta.TARGET.expand(target),
    relation: relationType,
    annotation: relationIsURI && annotation !== ''
        ? annotation
        : meta.MESSAGE
  }
}
