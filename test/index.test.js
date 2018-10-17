import mongodb from "./connection"

// Import all factory module
before(done => {
  mongodb
    .dropDatabase()
    .then(() => {
      done()
    })
    .catch(done)
})

after(() => mongodb.close())
