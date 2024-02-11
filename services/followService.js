const Follow = require("../models/Follow")

const followUserIds = async (identityUserId) => {
  let following = await Follow.find({ user: identityUserId }).select({ _id: 0, followed: 1 })
  let followers = await Follow.find({ followed: identityUserId }).select({ _id: 0, user: 1 })

  let followingClean = []
  following.forEach(follow => followingClean.push(follow.followed))

  let followersClean = []
  followers.forEach(follow => followersClean.push(follow.user))

  return {
    following: followingClean,
    followers: followersClean
  }
}

const followThisUser = async (identityUserId, profileUserId) => {
  let following = await Follow.findOne({ user: identityUserId })
  let followers = await Follow.findOne({ user: profileUserId, followed: identityUserId })

  return {
    following,
    followers
  }
}

module.exports = {
  followUserIds,
  followThisUser
}