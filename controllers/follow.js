const Follow = require("../models/Follow")
const User = require("../models/User")

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

module.exports = {
  save,
  unfollow
}