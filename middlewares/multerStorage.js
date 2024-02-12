const multer = require("multer")
const { IMAGES_PATH, PUBLICATIONS_IMAGE_PATH } = require("../config")

const uploads = (name) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, name === "avatar" ? IMAGES_PATH : PUBLICATIONS_IMAGE_PATH),
    filename: (req, file, cb) => cb(null, `${name}-${Date.now()}-${file.originalname}`)
  })

  return multer({ storage })
}

module.exports = uploads