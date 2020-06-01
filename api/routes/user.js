const express = require('express')
const router = express.Router()

const UserController = require('../controllers/user')

router.post("/signup", UserController.user_singup)

router.post('/login', UserController.user_login)

router.delete('/:userId', UserController.user_delete_user)

router.patch('/:userId', UserController.user_update_user)


module.exports = router
