const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user")
const check = require("../middlewares/auth")
const uploads = require("../middlewares/multerStorage")

router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/profile/:id", check.auth, UserController.getById)
router.get("/list/:page?", check.auth, UserController.list)
router.put("/update", check.auth, UserController.update)
router.post("/upload", [check.auth, uploads("avatar").single("file0")], UserController.uploadImage)
router.get("/avatar/:file", UserController.getImage)
router.get("/counters/:id?", check.auth, UserController.counters)

module.exports = router