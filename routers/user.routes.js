const express = require("express")
const { register, getAllUsers, updateUser, login, verifyUser } = require("../controllers/user.controller")

const router = express.Router()

router.post("/register", register)
router.get("/allUsers",verifyUser, getAllUsers)
router.patch('/user/:id', updateUser)
router.post("/login", login)


module.exports= router