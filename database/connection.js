const mongoose = require("mongoose")
const { MONGO_URI } = require("../config")

const connectionDb = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("Database connected!")
  } catch (error) {
    console.log(error)
    throw new Error("Failed to connect database!")
  }
}

module.exports = connectionDb