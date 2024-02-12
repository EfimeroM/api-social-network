const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publication")
const check = require("../middlewares/auth")
const uploads = require("../middlewares/multerStorage")

router.post("/save", check.auth, PublicationController.save)
router.get("/detail/:id", check.auth, PublicationController.detail)
router.delete("/remove/:id", check.auth, PublicationController.remove)
router.get("/user/:id/:page?", check.auth, PublicationController.user)
router.post("/upload/:id", [check.auth, uploads("pub").single("file0")], PublicationController.uploadImage)
router.get("/media/:file", PublicationController.getImage)
router.get("/feed/:page?", check.auth, PublicationController.feed)

module.exports = router