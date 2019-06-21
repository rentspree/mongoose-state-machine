import { Schema } from "mongoose"
import { factory } from "factory-girl"
import mongodb from "./connection"
import createStateMachineModel from "../src"

describe("StateMachine Plugin Mongoose", () => {
  const accountSchema = new Schema({
    firstName: String,
    lastName: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String
    },
    balance: Number,
    accStatus: String
  })
  const stateMachine = {
    init: "open",
    transitions: [
      { name: "firstTransaction", from: "open", to: "used" },
      { name: "close", from: "*", to: "closed" },
      { name: "suspend", from: "*", to: "suspended" },
      { name: "reset", from: "*", to: "open" },
      {
        name: "unsuspend",
        from: "*",
        to() {
          if (this.state === "suspended") {
            if (this.shouldUnsuspend) {
              return "used"
            }
          }
          return this.state
        }
      }
    ],
    methods: {
      onBeforeReset() {
        if (this.shouldNotReset) {
          return false
        }
        return true
      }
    }
  }
  accountSchema.plugin(createStateMachineModel, {
    stateMachine,
    statusFieldName: "accStatus"
  })
  const Account = mongodb.model("Account", accountSchema)
  factory.define("account", Account, {
    firstName: factory.chance("first"),
    lastName: factory.chance("last"),
    address: {
      street: factory.chance("address"),
      city: factory.chance("city"),
      state: factory.chance("state"),
      zip: factory.chance("zip")
    },
    balance: factory.chance("integer", { min: 0, max: 3000 }),
    accStatus: factory.chance("pickone", ["used", "closed", "suspended"])
  })
  context("find", () => {
    before(function(done) {
      this.timeout(5000)
      factory
        .createMany("account", 20)
        .then(() => done())
        .catch(done)
    })
    after(function(done) {
      this.timeout(5000)
      Account.deleteMany()
        .then(() => done())
        .catch(done)
    })
    it("should have state after findOne", () =>
      Account.findOne().then(account => {
        account.should.have.property("state")
      }))

    it("should have state after findById", () =>
      Account.findOne()
        .then(account => Account.findById(account))
        .then(account => {
          account.should.have.property("state").to.equal(account.accStatus)
        }))

    it("should have initial state equal to accStatus", () =>
      Account.findOne().then(account => {
        account.should.have.property("state").to.equal(account.accStatus)
      }))

    it("should be able to go to the next state", () =>
      Account.findOne().then(account => {
        account.suspend()
        account.should.have.property("state").to.equal("suspended")
      }))

    it("should be able to use the conditional transition", () =>
      Account.findOne().then(account => {
        account.reset()
        account.should.have.property("state").to.equal("open")
        account.unsuspend()
        account.should.have.property("state").to.equal("open")
        account.suspend()
        account.should.have.property("state").to.equal("suspended")
        account.unsuspend()
        account.should.have.property("state").to.equal("suspended")
        account.shouldUnsuspend = true // eslint-disable-line
        account.unsuspend()
        account.should.have.property("state").to.equal("used")
      }))

    it("should be able to move state to identify status when save", () =>
      Account.findOne()
        .then(account => {
          account.reset()
          return account.save()
        })
        .should.eventually.have.property("accStatus")
        .to.equal("open"))

    it("find many should have state as well", () => {
      Account.find()
        .then(accounts => accounts[0])
        .then(account => {
          account.should.have.property("state").to.equal(account.accStatus)
        })
    })
  })
  context("new object", () => {
    it("should get state as new object", () => {
      const acc = Account.new()
      acc.should.have.property("state").to.equal("open")
    })
    it("should be able to traverse state and save", () => {
      const acc = Account.new({
        firstName: "John",
        lastName: "Doe",
        balance: 3000
      })
      acc.reset()
      return acc
        .save()
        .then(account => Account.findById(account._id))
        .should.eventually.have.property("accStatus")
        .to.equal("open")
    })
    it("should be able to retrieve the initial state fro the object field when init", () => {
      const acc = Account.new({
        firstName: "John",
        lastName: "Doe",
        balance: 3000,
        accStatus: "suspended"
      })
      acc.should.have.property("state").to.equal("suspended")
      acc.should.have.property("accStatus").to.equal("suspended")
    })
  })

  context("lifeCycleMethod", () => {
    it("should not traverse to open when reset with shouldNotReset", () => {
      const acc = Account.new({
        firstName: "John",
        lastName: "Doe",
        balance: 3000,
        accStatus: "suspended"
      })
      acc.shouldNotReset = true
      acc.reset()
      acc.should.have.property("state").to.equal("suspended")
    })
  })
})
