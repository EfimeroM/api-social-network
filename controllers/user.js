const User = require("../models/User")
const bcrypt = require("bcrypt")

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

    return res.status(200).json({ status: "success", message: "register", user: userStored })
  } catch (error) {
    return res.status(400).json({ status: "error", message: `Error to register user: ${error.message}` })
  }
}

module.exports = {
  register
}