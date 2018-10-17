import mongoose from "mongoose"
import _debug from "debug"

const host = process.env.DB_HOST || "localhost"
const port = process.env.DB_PORT || "27017"
const database = process.env.DB_NAME || "state-machine-test"

const debug = _debug("mongoose-state-machine:mongoose")

const db = mongoose.createConnection(`mongodb://${host}:${port}/${database}`)
mongoose.Promise = require("bluebird")

db.on("error", () => {
  debug("MongoDB connection error ...")
  process.exit(1)
})

db.once("open", () => {
  debug("MongoDB Connected ...")
})

export default db
