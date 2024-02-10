const dotenv = require("dotenv")

dotenv.config()

module.exports = {
  NODE_ENV : process.env.NODE_ENV || "development",
  MONGO_URI : process.env.MONGO_URI || "mongodb://localhost:27017/mi_blog",
  PORT : process.env.PORT || 8080,
  SECRET_KEY: process.env.SECRET_KEY || "",
  IMAGES_PATH: process.env.IMAGES_PATH || "./uploads/avatars/"
}