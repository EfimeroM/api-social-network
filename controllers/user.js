const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt")

const register = async (req, res) => {
  const params = req.body

  if (!params.name || !params.nick || !params.email || !params.password) {
    return res.status(400).json({ status: "error", message: "Missing data to send" })
  }

  try {
    const users = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() }
      ]
    }).exec()

    if (users.length >= 1) return res.status(400).json({ status: "error", message: "User already exists" })

    let pwd_hash = await bcrypt.hash(params.password, 10)
    params.password = pwd_hash

    const user_to_save = new User(params)
    const userStored = await user_to_save.save()

    if (!userStored) return res.status(500).json({ status: "error", message: "Error to register user" })

    return res.status(200).json({ status: "success", message: "User registered", user: userStored })
  } catch (error) {
    return res.status(400).json({ status: "error", message: `Error to register user: ${error.message}` })
  }
}

const login = async (req, res) => {
  const params = req.body
  if (!params.email || !params.password) return res.status(400).json({ status: "error", message: "User data not found" })

  const userDb = await User.findOne({ email: params.email })
  if (!userDb) return res.status(404).json({ status: "error", message: "User not found" })

  const pwd = bcrypt.compareSync(params.password, userDb.password)
  if (!pwd) return res.status(400).json({ status: "error", message: "User password is incorrect" })

  const token = jwt.createToken(userDb)

  return res.status(200).json({
    status: "success",
    message: "User loged",
    user: {
      _id: userDb._id,
      name: userDb.name,
      nick: userDb.nick
    },
    token
  })
}

const getById = async (req, res) => {
  const { id } = req.params
  const userDb = await User.findById(id).select({ password: 0, role: 0 }).exec()

  if (!userDb) return res.status(404).send({ status: "error", message: "User not found" })

  return res.status(200).send({ status: "success", message: "Get user by Id", user: userDb })
}

module.exports = {
  register,
  login,
  getById
}