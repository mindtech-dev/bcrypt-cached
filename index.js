const bcrypt = require('bcrypt')
const NodeCache = require('node-cache')

const _compound = (hash, text) => {
  return String(hash + ':' + text)
}

class bcryptCached {
  constructor () {
    var options = {
      stdTTL: 600,
      checkperiod: 60
    }
    if (arguments[0]) {
      var { ttl, checkperiod } = arguments[0]
      if (Number.isInteger(ttl)) options.stdTTL = ttl
      if (Number.isInteger(checkperiod)) options.checkperiod = checkperiod
    }
    this._cache = new NodeCache(options)
  }

  compare (hash, text) {
    return new Promise((resolve, reject) => {
      // get value from cache
      this._cache.get(_compound(hash, text), (err, value) => {
        // not in cache
        if (err || !value) {
          // test text with bcrypt
          bcrypt.compare(text, hash).then((res) => {
            // save result to cache and resolve
            this._cache.set(_compound(hash, text), String(res), (err, success) => {
              if (err) throw err
              resolve(res)
            })
          })
        } else {
          resolve(value === 'true')
        }
      })
    })
  }
}

module.exports = bcryptCached
