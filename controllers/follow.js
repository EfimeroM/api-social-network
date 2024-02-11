const Follow = require("../models/Follow")
const User = require("../models/User")
const mongoosePaginate = require("mongoose-pagination")
const followService = require("../services/followService")

const save = async (req, res) => {
  const params = req.body
  const identity = req.user
  const userToFollow = new Follow({
    user: identity._id,
    followed: params.followed
  })

  const followStored = await userToFollow.save()
  if (!followStored) return res.status(400).send({ status: "error", message: "Error to follow user" })
  return res.status(200).send({ status: "success", message: "Success followed user", identity: req.user, follow: followStored })
}

const unfollow = async (req, res) => {
  const userId = req.user._id
  const followedId = req.params.id

  const followDeleted = await Follow.findOneAndDelete({ user: userId, followed: followedId })
  if (!followDeleted) return res.status(404).send({ status: "error", message: "User followed not found" })

  return res.status(200).send({ status: "success", message: "Success deleted follow" })
}

const following = async (req, res) => {
  const userId = req.params.id || req.user._id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  const usersStored = await Follow
    .find({ user: userId })
    .populate("user followed", "-password -role -__v")
    .paginate(page, itemsPerPage)
  const total = await Follow.find({ user: userId }).countDocuments().exec()
  const followUserIds = await followService.followUserIds(req.user._id)

  return res.status(200).send({
    status: "success",
    message: "List of followed users",
    follows: usersStored,
    usersFollowing: followUserIds.following,
    usersFollowers: followUserIds.followers,
    page,
    pages: Math.ceil(total / itemsPerPage),
    itemsPerPage,
    total
  })
}

const followers = async (req, res) => {
  const userId = req.params.id || req.user._id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  const usersStored = await Follow
    .find({ followed: userId })
    .populate("user", "-password -role -__v")
    .paginate(page, itemsPerPage)
  const total = await Follow.find({ followed: userId }).countDocuments().exec()
  const followUserIds = await followService.followUserIds(req.user._id)

  return res.status(200).send({
    status: "success",
    message: "Followers list",
    follows: usersStored,
    usersFollowing: followUserIds.following,
    usersFollowers: followUserIds.followers,
    page,
    pages: Math.ceil(total / itemsPerPage),
    itemsPerPage,
    total
  })
}

module.exports = {
  save,
  unfollow,
  following,
  followers
}