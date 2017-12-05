const { whitespaceNormalize } = require('./characters')

module.exports = {

  /**
   * Perform link construction (section 3.2)
   */
  constructLink: (meta, tokens) => {
    var [source, annotation, target] = tokens.map(whitespaceNormalize)

    if (target === undefined) target = source
    if (annotation === undefined) annotation = ''

    const relationIsURI = typeof meta.RELATION !== 'object'

    return {
      source: meta.PREFIX.fill({ID: source}),
      target: meta.TARGET.fill({ID: target}),
      relation: relationIsURI
          ? meta.RELATION
          : meta.RELATION.fill({ID: annotation}),
      annotation: relationIsURI && annotation !== ''
          ? annotation
          : meta.MESSAGE
    }
  }

}
