const { Schema, model } = require("mongoose")

const FollowSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true
  },
  followed: {
    type: Schema.ObjectId,
    ref: "User",
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = model("Follow", FollowSchema)