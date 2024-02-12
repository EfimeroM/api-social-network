const validator = require("validator")

const validate = (params) => {
  const name = !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES")

  const surname = params.surname ? !validator.isEmpty(params.surname) &&
    validator.isLength(params.surname, { min: 3, max: undefined }) &&
    validator.isAlpha(params.surname, "es-ES") : true

  const nick = !validator.isEmpty(params.nick) && validator.isLength(params.nick, { min: 2, max: undefined })

  const email = !validator.isEmpty(params.email) && validator.isEmail(params.email)

  const password = !validator.isEmpty(params.password)

  const bio = params.bio ? validator.isLength(params.bio, { min: undefined, max: 255 }) : true

  if (!name || !surname || !nick || !email || !password || !bio) {
    throw new Error("Error to validate")
  }
}

module.exports = validate