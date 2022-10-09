const Router = require('koa-router')
const { create, showAvatar, reactive, care, cancelCare } = require('../controller/user.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const {
  verifyName,
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
userRouter.post('/', verifyName, verifyUEmail, verifyCode, verifyPass, handlePassword, create)
// 获取头像
userRouter.get('/:userId/avatar', showAvatar)
// 关注
userRouter.post('/care/:userId', verifyAuth, care)
// 取消关注
userRouter.post('/cancel-care/:userId', verifyAuth, cancelCare)

module.exports = userRouter
