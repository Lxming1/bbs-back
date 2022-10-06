const Router = require('koa-router')
const { create, showAvatar, reactive } = require('../controller/user.controller')
const {
  verifyUEmail,
  sendEmail,
  verifyCode,
  verifyPass,
  handlePassword,
} = require('../middleware/user.middleware')

const userRouter = new Router({ prefix: '/users' })

// 发送验证码
userRouter.post('/sendemail', verifyUEmail, sendEmail, reactive)
// 注册
userRouter.post('/', verifyCode, verifyPass, handlePassword, create)
// 获取头像
userRouter.get('/:userId/avatar', showAvatar)

module.exports = userRouter
