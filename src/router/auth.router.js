const Router = require('koa-router')
const { login } = require('../controller/auth.controller')
const { verifyLogin, setSchool } = require('../middleware/auth.middleware')

const authRouter = new Router()

authRouter.post('/login', verifyLogin, setSchool, login)

module.exports = authRouter
