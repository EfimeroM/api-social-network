const Follow = require("../models/Follow")
const mongoosePaginate = require("mongoose-pagination")
const followService = require("../services/followService")

const save = async (req, res) => {
  const params = req.body
  const identity = req.user

  try {
    const followStored = await Follow.create({ user: identity._id, followed: params.followed })
    if (!followStored) return res.status(400).json({ status: "error", message: "Error to follow user" })

    return res.status(200).json({ status: "success", message: "Success followed user", follow: followStored })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to register user" })
  }
}

const unfollow = async (req, res) => {
  const userId = req.user._id
  const followedId = req.params.id

  try {
    const followDeleted = await Follow.findOneAndDelete({ user: userId, followed: followedId })
    if (!followDeleted) return res.status(404).send({ status: "error", message: "User followed not found" })

    return res.status(200).json({ status: "success", message: "Success deleted follow" })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to unfollow" })
  }
}

const following = async (req, res) => {
  const userId = req.params.id || req.user._id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  try {
    // get information about the follower and followed user
    const usersStored = await Follow
      .find({ user: userId })
      .populate("user followed", "-password -role -__v -email -created_at")
      .paginate(page, itemsPerPage)
    if (!usersStored) return res.status(404).send({
      status: "error",
      message: "Information about the follower and followed user not found"
    })

    const total = await Follow.find({ user: userId }).countDocuments()

    // get ids about my followers and followed
    const followUserIds = await followService.followUserIds(req.user._id)

    return res.status(200).json({
      status: "success",
      message: "List of followed users",
      page,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage,
      total,
      usersFollowing: followUserIds.following,
      usersFollowers: followUserIds.followers,
      follows: usersStored,
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to list following"+error })
  }
}

const followers = async (req, res) => {
  const userId = req.params.id || req.user._id
  const page = parseInt(req.params.page) || 1
  const itemsPerPage = 5

  try {
    const usersStored = await Follow
      .find({ followed: userId })
      .populate("user", "-password -role -__v -email -created_at")
      .paginate(page, itemsPerPage)
    if (!usersStored) return res.status(404).send({
      status: "error",
      message: "Information about the follower and followed user not found"
    })

    const total = await Follow.find({ followed: userId }).countDocuments()
    // get ids about my followers and followed
    const followUserIds = await followService.followUserIds(req.user._id)

    return res.status(200).json({
      status: "success",
      message: "Followers list",
      page,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage,
      total,
      usersFollowing: followUserIds.following,
      usersFollowers: followUserIds.followers,
      follows: usersStored,
    })
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Error to list followers" })
  }
}

module.exports = {
  save,
  unfollow,
  following,
  followers
}