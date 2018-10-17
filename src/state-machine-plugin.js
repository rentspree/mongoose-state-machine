/* eslint-disable no-param-reassign */
import StateMachine from "javascript-state-machine"

// TODO:- move this to an external library
export default function createStateMachineModel(schema, options) {
  let { statusFieldName } = options
  if (!statusFieldName) statusFieldName = "status"
  if (options.stateMachine) {
    schema.post("init", function() {
      const state = {
        ...options.stateMachine
      }
      state.init = this[statusFieldName]
      StateMachine.apply(this, state)
    })

    schema.pre("save", function() {
      if (this.state) {
        this[statusFieldName] = this.state
      }
    })
  }

  schema.statics.new = function(obj) {
    const j = new this(obj)
    if (obj) {
      const state = {
        ...options.stateMachine
      }
      if (obj[statusFieldName]) {
        state.init = obj[statusFieldName]
      }
      StateMachine.apply(j, state)
    } else {
      StateMachine.apply(j, options.stateMachine)
    }
    return j
  }
}
