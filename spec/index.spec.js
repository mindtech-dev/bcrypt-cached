const bcrypt = require('bcrypt')
const bcryptCached = new (require('../index'))()

const saltRounds = 10

describe('bcryptCached', () => {
  let correctPair = {
    password: '12345678',
    hash: bcrypt.hashSync('12345678', saltRounds)
  }

  let incorrectPair = {
    password: '12345678',
    hash: bcrypt.hashSync('1234567', saltRounds)
  }

  it('should compare and resolve true', (done) => {
    bcryptCached.compare(correctPair.hash, correctPair.password).then((res) => {
      expect(res).toBe(true)
      done()
    })
  })

  it('should compare and resolve false', (done) => {
    bcryptCached.compare(incorrectPair.hash, incorrectPair.password).then((res) => {
      expect(res).toBe(false)
      done()
    })
  })

  it('should cache result for correct pair (race test)', (done) => {
    var anotherPair = {
      password: 'asdoifuyhse',
      hash: bcrypt.hashSync('asdoifuyhse', saltRounds)
    }
    var cachedResult
    // run once to cache result for correctPair
    bcryptCached.compare(correctPair.hash, correctPair.password).then((res) => {
      // compare for the first time this pair
      bcryptCached.compare(anotherPair.hash, anotherPair.password).then((res) => {
        // should run after the cached test
        expect(cachedResult).toBe(true)
        done()
      })
      // compare using cache
      bcryptCached.compare(correctPair.hash, correctPair.password).then((res) => {
        cachedResult = res
      })
    })
  })

  it('should cache result for incorrect pair (race test)', (done) => {
    var anotherPair = {
      password: 'quiwejrnase',
      hash: bcrypt.hashSync('quiwejrnase', saltRounds)
    }
    var cachedResult
    // run once to cache result for incorrectPair
    bcryptCached.compare(incorrectPair.hash, incorrectPair.password).then((res) => {
      // compare for the first time this pair
      bcryptCached.compare(anotherPair.hash, anotherPair.password).then((res) => {
        // should run after the cached test
        expect(cachedResult).toBe(false)
        done()
      })
      // compare using cache
      bcryptCached.compare(incorrectPair.hash, incorrectPair.password).then((res) => {
        cachedResult = res
      })
    })
  })

  it('should cache result for correct pair (time test)', (done) => {
    var anotherPair = {
      password: 'r091poi23rnsdf',
      hash: bcrypt.hashSync('r091poi23rnsdf', saltRounds)
    }
    var initialTime = process.hrtime()
    initialTime = initialTime[0] * Math.pow(10, 9) + initialTime[1]
    // run once to cache result for incorrectPair
    bcryptCached.compare(anotherPair.hash, anotherPair.password).then((res) => {
      var uncachedTime = process.hrtime()
      uncachedTime = uncachedTime[0] * Math.pow(10, 9) + uncachedTime[1]

      // compare for the first time this pair
      bcryptCached.compare(anotherPair.hash, anotherPair.password).then((res) => {
        var cachedTime = process.hrtime()
        cachedTime = cachedTime[0] * Math.pow(10, 9) + cachedTime[1]

        // should run at least a 10 times faster (actual result ≃ 900)
        expect((uncachedTime - initialTime) / (cachedTime - uncachedTime)).toBeGreaterThan(10)
        done()
      })
    })
  })

  it('should cache result for incorrect pair (time test)', (done) => {
    var anotherIncorretPair = {
      password: 'asef98oil34knlrk2',
      hash: bcrypt.hashSync('asef98oil34knlrk23', saltRounds)
    }
    var initialTime = process.hrtime()
    initialTime = initialTime[0] * Math.pow(10, 9) + initialTime[1]
    // run once to cache result for incorrectPair
    bcryptCached.compare(anotherIncorretPair.hash, anotherIncorretPair.password).then((res) => {
      var uncachedTime = process.hrtime()
      uncachedTime = uncachedTime[0] * Math.pow(10, 9) + uncachedTime[1]

      // compare for the first time this pair
      bcryptCached.compare(anotherIncorretPair.hash, anotherIncorretPair.password).then((res) => {
        var cachedTime = process.hrtime()
        cachedTime = cachedTime[0] * Math.pow(10, 9) + cachedTime[1]

        // should run at least a 10 times faster (actual result ≃ 1000)
        expect((uncachedTime - initialTime) / (cachedTime - uncachedTime)).toBeGreaterThan(10)
        done()
      })
    })
  })
})
