const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt")
const mongoosePaginate = require("mongoose-pagination")
const followService = require("../services/followService")
const fs = require("fs")
const path = require("path")
const { IMAGES_PATH } = require("../config")

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
  const followInfo = await followService.followThisUser(req.user._id, id)

  return res.status(200).send({ status: "success", message: "Get user by Id", user: userDb, following: followInfo.following, follower: followInfo.followers })
}

const list = async (req, res) => {
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  const usersDb = await User.find().sort('_id').paginate(page, itemsPerPage)
  if (!usersDb) return res.status(404).send({ status: "error", message: "Users not found" })

  const total = await User.countDocuments().exec()
  const followUserIds = await followService.followUserIds(req.user._id)

  return res.status(200).send({
    status: "success",
    message: "Get users with page",
    users: usersDb,
    usersFollowing: followUserIds.following,
    usersFollowers: followUserIds.followers,
    page,
    pages: Math.ceil(total / itemsPerPage),
    itemsPerPage,
    total
  })
}

const update = async (req, res) => {
  const userIdentity = {
    ...req.user,
    iat: undefined,
    exp: undefined,
    role: undefined,
    image: undefined
  }
  const userToUpdate = req.body

  const usersDb = await User.find({
    $or: [
      { email: userToUpdate.email.toLowerCase() },
      { nick: userToUpdate.nick.toLowerCase() }
    ]
  }).exec()
  let userIsset = false

  usersDb.forEach(user => {
    if (user && user._id != userIdentity._id) userIsset = true
  })
  if (userIsset) return res.status(400).json({ status: "error", message: "User already exists" })

  if (userToUpdate.password) {
    let pwd_hash = await bcrypt.hash(userToUpdate.password, 10)
    userToUpdate.password = pwd_hash
  }

  try {
    const userUpdated = await User.findByIdAndUpdate(userIdentity._id, userToUpdate, { new: true })
    if (!userUpdated) return res.status(404).json({ status: "error", message: "User not found" })
    //token needs to be updated
    return res.status(200).send({ status: "success", message: "User updated", user: userUpdated })
  } catch (error) {
    return res.status(400).json({ status: "error", message: "Error to update user" })
  }
}

const uploadImage = async (req, res) => {
  const { file } = req
  if (!file) return res.status(404).json({ status: "error", message: "Image not found" })
  let fileName = file.originalname
  let split_file = fileName.split(".")
  let file_extension = split_file[1]

  if (!["png", "jpg", "jpeg", "gif"].includes(file_extension)) {
    fs.unlinkSync(file.path)
    return res.status(400).json({ status: "error", message: "Invalid File" })
  }

  //userUpdated needs to be delete password
  const userUpdated = await User.findByIdAndUpdate(req.user._id, { image: req.file.filename }, { new: true })
  if (!userUpdated) return res.status(400).json({ status: "error", message: "Error to update user" })
  return res.status(200).send({ status: "success", message: "Image uploaded", file: req.file, user: userUpdated })
}

const getImage = async (req, res) => {
  const fileName = req.params.file
  const filePath = `${IMAGES_PATH}${fileName}`

  fs.stat(filePath, (error, exists) => {
    if (exists) return res.sendFile(path.resolve(filePath))
    else return res.status(404).json({ status: "error", message: "Image not found", fileName, filePath })
  })
}

module.exports = {
  register,
  login,
  getById,
  list,
  update,
  uploadImage,
  getImage
}