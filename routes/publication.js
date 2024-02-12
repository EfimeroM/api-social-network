const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publication")
const check = require("../middlewares/auth")
const multer = require("multer")
const { PUBLICATIONS_IMAGE_PATH } = require("../config")

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PUBLICATIONS_IMAGE_PATH),
  filename: (req, file, cb) => cb(null, `pub-${Date.now()}-${file.originalname}`)
})

const uploads = multer({ storage })

router.post("/save", check.auth, PublicationController.save)
router.get("/detail/:id", check.auth, PublicationController.detail)
router.delete("/remove/:id", check.auth, PublicationController.remove)
router.get("/user/:id/:page?", check.auth, PublicationController.user)
router.post("/upload/:id", [check.auth, uploads.single("file0")], PublicationController.uploadImage)
router.get("/media/:file", PublicationController.getImage)
router.get("/feed/:page?", check.auth, PublicationController.feed)

module.exports = router