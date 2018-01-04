/**
 * Stores links via its link tokens. Each link is an array of two
 * (source, target) or three (source, target, annotation) tokens.
 */
class TokenIndex {
  constructor (meta) {
    this.tokens = []
    this.sources = {}
    this.targets = {}
    this.annotations = {}
  }

  addTokens (source, target, annotation) {
    // this method does not validate arguments!
    const tokens = [source, target]
    if (annotation !== undefined) tokens.push(annotation)

    // TODO?: don't add duplicate links
    // const given = this.query(...tokens)
    // if (!given.next().done) return

    const id = this.tokens.length
    this.tokens.push(tokens)

    pushArray(this.sources, source, id)
    pushArray(this.targets, target, id)

    if (annotation !== undefined) {
      pushArray(this.annotations, annotation, id)
    }
  }

  * query (source, target, annotation) {
    // no token specified
    if (source === undefined && annotation === undefined && target === undefined) {
      yield * this.tokens
    } else {
      // one token specified?
      var ids

      if (target === undefined && annotation === undefined) {
        ids = this.sources[source]
        if (!ids) return
      } else if (source === undefined && annotation === undefined) {
        ids = this.targets[target]
        if (!ids) return
      } else if (source === undefined && target === undefined) {
        ids = this.annotations[annotation]
        if (!ids) return
      }

      if (ids) {
        for (let id of ids) {
          yield this.tokens[id]
        }
        return
      }

      // two or three token specified
      ids = []

      if (source !== undefined) {
        if (source in this.sources) {
          ids.push(this.sources[source])
        } else {
          return
        }
      }

      if (target !== undefined) {
        if (target in this.targets) {
          ids.push(this.targets[target])
        } else {
          return
        }
      }

      if (annotation !== undefined) {
        if (annotation in this.annotations) {
          ids.push(this.annotations[annotation])
        } else {
          return
        }
      }

      // exactely one link (or none)
      if (ids.length === 3) {
        const [a, b, c] = ids
        const [an, bn, cn] = ids.map(l => l.length)
        let [ai, bi, ci] = [0, 0, 0]

        while (ai < an && bi < bn && ci < cn) {
          if (a[ai] === b[bi] && b[bi] === c[ci]) {
            yield this.tokens[a[ai]]
            return
          } else if (a[ai] < b[bi]) {
            ai++
          } else if (b[bi] < c[ci]) {
            bi++
          } else {
            ci++
          }
        }
      } else {
        // calulate intersection
        const [a, b] = ids
        let [ai, bi] = [0, 0]

        console.log(source, target, annotation)
        console.log(a, b)

        while (ai < a.length && bi < b.length) {
          if (a[ai] < b[bi]) { ai++ } else if (a[ai] > b[bi]) { bi++ } else {
            yield this.tokens[a[ai]]
            ai++; bi++
          }
        }
      }
    }
  }
}

function pushArray (obj, key, value) {
  if (key in obj) {
    obj[key].push(value)
  } else {
    obj[key] = [value]
  }
}

module.exports = () => new TokenIndex()
