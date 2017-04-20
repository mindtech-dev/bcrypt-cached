# bcrypt-cached

Use memory cached results for bcrypt

Example:
```javascript
const bcryptCached = require('bcrypt-cached')

var myCache = new bcryptCached({
  ttl: 60, // default = 600
  checkperiod: 20 // default = 60
})

const plainTextPassword = '12345678'
const hash = '$2a$10$EotbI1GgQMZMg3siykIgKeSZe4MwF52pYj5FBd1fGdNiszP7RQGNu'

console.log(process.hrtime())
// saving to cache
myCache.compare(hash, plainTextPassword).then((res) => {
  console.log(process.hrtime(), res)
  // running really fast (≃ 1000 faster for a single core)
  myCache.compare(hash, plainTextPassword).then((res) => {
    console.log(process.hrtime(), res)
  })
})

```
