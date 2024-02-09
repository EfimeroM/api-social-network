const jwt = require("jwt-simple")
const moment = require("moment")

const { SECRET_KEY } = require("../config")

const secret_key = SECRET_KEY

const createToken = (user) => {
  const payload = {
    _id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix()
  }

  return jwt.encode(payload, secret_key)
}

module.exports = {
  createToken
}