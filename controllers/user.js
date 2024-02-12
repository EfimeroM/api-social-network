const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt")
const mongoosePaginate = require("mongoose-pagination")
const Follow = require("../models/Follow")
const followService = require("../services/followService")
const Publication = require("../models/Publication")
const fs = require("fs")
const path = require("path")
const { IMAGES_PATH } = require("../config")
const { validationResult } = require("express-validator")

const register = async (req, res) => {
  const params = req.body
  // validate fields
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ status: "error", message: errors.array()[0].msg })

  try {
    // check if the email or nickname already exists
    const users = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() }
      ]
    })

    if (users.length >= 1) return res.status(400).json({ status: "error", message: "User already exists" })

    // encrypt password
    params.password = await bcrypt.hash(params.password, 10)

    const userStored = await User.create(params)

    if (!userStored) return res.status(500).json({ status: "error", message: "Error to register user" })

    return res.status(201).json({
      status: "success",
      message: "User registered",
      user: {
        _id: userStored._id,
        name: userStored.name,
        surname: userStored.surname || "",
        nick: userStored.nick,
        bio: userStored.bio || "",
        image: userStored.image
      }
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to register user" })
  }
}

const login = async (req, res) => {
  const params = req.body
  if (!params.email || !params.password) return res.status(404).json({ status: "error", message: "Email or password not found" })

  try {
    const userDb = await User.findOne({ email: params.email })
    if (!userDb) return res.status(404).json({ status: "error", message: "User not found" })

    // compare password
    const pwd = bcrypt.compareSync(params.password, userDb.password)
    if (!pwd) return res.status(400).json({ status: "error", message: "User password is incorrect" })

    // create user token
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
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to login user" })
  }
}

const getById = async (req, res) => {
  const { id } = req.params
  try {
    const userDb = await User.findById(id).select({ password: 0, role: 0, email: 0 })

    if (!userDb) return res.status(404).json({ status: "error", message: "User not found" })

    // get user following and followers
    const followInfo = await followService.followThisUser(req.user._id, id)

    return res.status(200).json({
      status: "success",
      message: "Get user by Id",
      user: userDb,
      following: followInfo.following,
      follower: followInfo.followers
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to get user" })
  }
}

const list = async (req, res) => {
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  const usersDb = await User
    .find()
    .select("-password -email -role -__v")
    .sort('_id')
    .paginate(page, itemsPerPage)
  if (!usersDb) return res.status(404).json({ status: "error", message: "Users not found" })

  const total = await User.countDocuments().exec()

  // get user ids following and followers
  const followUserIds = await followService.followUserIds(req.user._id)

  return res.status(200).json({
    status: "success",
    message: "Get users with page",
    page,
    pages: Math.ceil(total / itemsPerPage),
    itemsPerPage,
    total,
    usersFollowing: followUserIds.following,
    usersFollowers: followUserIds.followers,
    users: usersDb
  })
}

const update = async (req, res) => {
  // clear unnecessary fields
  const userIdentity = req.user
  const userToUpdate = req.body
  // validate fields
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ status: "error", message: errors.array()[0].msg })

  try {
    const usersDb = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() }
      ]
    })

    // check data user duplicate
    let userIsset = false
    usersDb.forEach(user => {
      if (user && user._id != userIdentity._id) userIsset = true
    })
    if (userIsset) return res.status(400).json({ status: "error", message: "User already exists" })

    if (userToUpdate.password) {
      userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10)
    } else {
      delete userToUpdate.password
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error user not found" })
  }

  try {
    const userUpdated = await User.findByIdAndUpdate(userIdentity._id, userToUpdate, { new: true })
    if (!userUpdated) return res.status(404).json({ status: "error", message: "User not found" })
    // create new token
    const token = jwt.createToken(userUpdated)

    return res.status(200).json({
      status: "success",
      message: "User updated",
      user: {
        _id: userUpdated._id,
        name: userUpdated.name,
        surname: userUpdated.surname || "",
        nick: userUpdated.nick,
        bio: userUpdated.bio || "",
        image: userUpdated.image
      },
      token
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to update user" })
  }
}

const uploadImage = async (req, res) => {
  const { file } = req
  if (!file) return res.status(404).json({ status: "error", message: "Image not found" })
  let fileName = file.originalname
  let splitFile = fileName.split(".")
  let fileExtension = splitFile[1]

  if (!["png", "jpg", "jpeg", "gif"].includes(fileExtension)) {
    fs.unlinkSync(file.path)
    return res.status(400).json({ status: "error", message: "Invalid File" })
  }

  try {
    const userUpdated = await User.findByIdAndUpdate(req.user._id, { image: req.file.filename }, { new: true })
    if (!userUpdated) return res.status(400).json({ status: "error", message: "Error to update user" })

    return res.status(200).json({
      status: "success",
      message: "Image uploaded",
      file: req.file,
      user: {
        _id: userUpdated._id,
        name: userUpdated.name,
        surname: userUpdated.surname || "",
        nick: userUpdated.nick,
        bio: userUpdated.bio || "",
        image: userUpdated.image
      }
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to update image user" })
  }
}

const getImage = async (req, res) => {
  const fileName = req.params.file
  const filePath = `${IMAGES_PATH}${fileName}`

  fs.stat(filePath, (error, exists) => {
    if (exists) return res.sendFile(path.resolve(filePath))
    else return res.status(404).json({ status: "error", message: "Image not found", fileName, filePath })
  })
}

const counters = async (req, res) => {
  const userId = req.params.id || req.user._id

  try {
    const following = await Follow.find({ user: userId }).countDocuments()
    const followed = await Follow.find({ followed: userId }).countDocuments()
    const publications = await Publication.find({ user: userId }).countDocuments()

    return res.status(200).json({
      status: "success",
      message: "Counters of user",
      userId,
      following,
      followed,
      publications
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to get user information" })
  }
}

module.exports = {
  register,
  login,
  getById,
  list,
  update,
  uploadImage,
  getImage,
  counters
}