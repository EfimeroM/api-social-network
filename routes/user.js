const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user")
const check = require("../middlewares/auth")

router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/profile/:id", check.auth, UserController.getById)

module.exports = router