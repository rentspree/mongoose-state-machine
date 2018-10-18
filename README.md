# mongoose-state-machine

[![Generated with nod](https://img.shields.io/badge/generator-nod-2196F3.svg?style=flat-square)](https://github.com/diegohaz/nod)
[![NPM version](https://img.shields.io/npm/v/@rentspree/mongoose-state-machine.svg?style=flat-square)](https://npmjs.org/package/mongoose-state-machine)
[![Build Status](https://img.shields.io/travis/rentspree/mongoose-state-machine/master.svg?style=flat-square)](https://travis-ci.org/rentspree/mongoose-state-machine) [![Coverage Status](https://img.shields.io/codecov/c/github/rentspree/mongoose-state-machine/master.svg?style=flat-square)](https://codecov.io/gh/rentspree/mongoose-state-machine/branch/master)

A mongoose plugin fomr Javascript State Machine

The plugin base the module on [Javascript State Machine](https://github.com/jakesgordon/javascript-state-machine) which had done really well on creating a State-like environment for Javascript.

This Plugin will merge Mongoose to Javascript State Machine! The goal is to make the API simple and allow a mongoose model to have the State machine API provided by Javascript State Machine.

This plugin simply intercetp the Model Initilizer to include Javascript State Machine instance to the model.

## Install

    $ npm install --save @rentspree/mongoose-state-machine

## Usage

First lets initialize our mongoose model

```js
import stateMachinePlugin from "@rentspree/mongoose-state-machine"
import mongoose from "mongoose"

// first create your model
const personSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    status: String // check this field out
})
```

Then, we can define the State Machine definition. This is the exact same object which should be passed upon creating a `StateMachine` object [here](https://github.com/jakesgordon/javascript-state-machine#usage).

```js
const stateMachine = {
    init: 'solid',
    transitions: [
      { name: 'melt',     from: 'solid',  to: 'liquid' },
      { name: 'freeze',   from: 'liquid', to: 'solid'  },
      { name: 'vaporize', from: 'liquid', to: 'gas'    },
      { name: 'condense', from: 'gas',    to: 'liquid' }
    ],
    methods: {
      onMelt:     function() { console.log('I melted')    },
      onFreeze:   function() { console.log('I froze')     },
      onVaporize: function() { console.log('I vaporized') },
      onCondense: function() { console.log('I condensed') }
    }
  }
```

For more detail on this definitions, you can visit Javascript State Machine [document](https://github.com/jakesgordon/javascript-state-machine#documentation). Every config in this part is passed to it.

Now, lets apply the plugin to our model

```js
personSchema.plugin(stateMachinePlugin, { stateMachine: stateMachine } )
```

There are some options available, but we'll come back later.

```js
const Person = mongoose.model("Person", personSchema)
```

Done!! The `Person` Model now become a StateMachine model. The field `status` declared earlier is the field responsible for the initial state of the State Machine. This is **slightly different** from the normal behaviour of the Javascript State Machine.

### Usage Example

According to the example above, the first thing needs to clearify is that, the value in `status` field of this `Person` model would only have 3 states which are what declared in the State Machine; `solid`, `liquid`, and `gas`.

#### Query

Let's do the query, assuming a `Person` in the database:

```js
Person.create({
    _id: "first-person-ever",
    firstName: "John",
    lastName: "Doe",
    status: "liquid"
})
```

Now, on somewhere in the code, we can do this

```js
const person = await Person.findOne({_id: "first-person-ever"})
console.log(person.status)
// this will long "liquid"
console.log(person.state)
// this is the Javascript State Machine api and it will log "liquid"
person.vaporize()
// this will log "I vaporized"
console.log(person.state)
// "gas"
console.log(person.status)
// "liquid" --IMPORTANT, explain below
await person.save()
console.log(person.status)
// "gas"
```

The Javascript State Machine API is available for the `person` model here and it will behave like [Applying State Machine Behavior to Existing Objects](https://github.com/jakesgordon/javascript-state-machine/blob/master/docs/state-machine-factory.md#applying-state-machine-behavior-to-existing-objects).

**_Important Note_** The important thing to notice here is that, this plugin _will not_ manipulate the data at the database level. The goal is to make Mongoose model work together with Javascript State Machine. From the example above, the code must run `person.save()` in order to update the latest status to the database. The purpose for this is to delegate database saving decision to the developer.

When the `person.save()` happen, it will move the value in the `state` of the Javascript State Machine into the field `status` which relate to value in the database.

#### New Model

Things get a little different while creating new model. According to Mongoose, it is not recommended to use [middleware](https://mongoosejs.com/docs/middleware.html) instead of overriding the model method.

Normally, when creating new model in Mongoose

```js
const person = new Person({firstName: "hero"})
// this still work
person.melt()
// error
```

Instead, use the method provided by the plugin

```js
const person = Person.new({firstName: "hero"})
person.melt()
console.log(person.state)
// liquid
```

## Options

These are the option available when defining plugin

```js
personSchema.plugin(stateMachinePlugin, options )
```

| Option            | description                                                                                                                                                                                                  | default  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `stateMachine`    | The state machine definition object which will be passed to `new StateMachine()` of [Javascript State Machine](https://github.com/jakesgordon/javascript-state-machine#usage)                                | null     |
| `statusFieldName` | The state field name in the database. This is the initial state for the state machine when getting Mongoose model from the database, also it's the field that the current state will be update upon `save()` | "status" |

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

## License

MIT © [Putt](https://github.com/rentspree)
