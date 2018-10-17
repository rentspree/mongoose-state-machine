const fs = require("fs");

const prettierOptions = JSON.parse(fs.readFileSync("./.prettierrc", "utf8"));

module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "airbnb-base",
    "plugin:flowtype/recommended",
    "plugin:prettier/recommended",
    "prettier/flowtype"
  ],
  "plugins": [
    "flowtype",
    "flowtype-errors",
    "prettier",
    "mocha"
  ],
  "env": {
    "mocha": true,
    "mongo": true,
    "node": true,
    "es6": true
  },
  "rules": {
    "prettier/prettier": [2, prettierOptions],
    "flowtype-errors/show-errors": "error",
    "mocha/prefer-arrow-callback": "off",
    "mocha/handle-done-callback": "error",
    "mocha/no-sibling-hooks": "off",
    "mocha/no-identical-title": "error",
    "no-underscore-dangle": "off",
    "func-names": ["error", "never"]
  }
}
