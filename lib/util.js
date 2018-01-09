const { Readable } = require('stream')

module.exports = {
  InputStream: input => {
    if (typeof input === 'string') {
      const string = input
      input = new Readable()
      input.push(string)
      input.push(null)
    }
    return input
  }
}
