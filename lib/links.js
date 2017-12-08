const { whitespaceNormalize } = require('./characters')

module.exports = {

  /**
   * Perform link construction (section 3.2).
   *
   * Expects tokens to match the TOKEN grammar rule.
   */
  constructLink: (meta, tokens) => {
    var [source, annotation, target] = tokens.map(whitespaceNormalize)

    if (source === undefined || source === '') return

    if (target === undefined || target === '') target = source
    if (annotation === undefined) annotation = ''

    const relationIsURI = typeof meta.RELATION !== 'object'

    const relationType = relationIsURI
        ? meta.RELATION
        : meta.RELATION.expand(annotation)

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

}
