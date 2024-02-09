const jwt = require("jwt-simple")
const moment = require("moment")
const { SECRET_KEY } = require("../config")

const secret_key = SECRET_KEY

const auth = (req, res, next) => {
  if (!req.headers.authorization) return res.status(403).send({ status: "error", message: "Header auth not found" })

  const token = req.headers.authorization.replace(/['"]+/g, '')
  try {
    const payload = jwt.decode(token, secret_key)
    if (payload.exp <= moment().unix()) return res.status(401).send({ status: "error", message: "Expired Token" })
    
    req.user = payload
  } catch (error) {
    return res.status(400).send({ status: "error", message: "Invalid Token" })
  }
  next()
}

module.exports = {
  auth
}