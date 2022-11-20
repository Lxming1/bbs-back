const Router = require('koa-router')
const {
  create,
  showAvatar,
  reactive,
  care,
  cancelCare,
  showCareFansList,
  edit,
  showUserInfo,
} = require('../controller/user.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const {
  verifyUEmail,
  sendEmail,
  verifyCode,
  verifyPass,
  handlePassword,
  setCareFansList,
  handleUserInfo,
} = require('../middleware/user.middleware')

const userRouter = new Router({ prefix: '/users' })
// 发送验证码
userRouter.post('/sendemail', verifyUEmail, sendEmail, reactive)
// 注册
userRouter.post('/', verifyUEmail, verifyCode, verifyPass, handlePassword, create)
// 获取头像
userRouter.get('/:userId/avatar', showAvatar)
// 关注
userRouter.post('/:userId/care', verifyAuth, care)
// 取消关注
userRouter.delete('/:userId/care', verifyAuth, cancelCare)
// 获取用户个人信息
userRouter.get('/:userId/detail', showUserInfo)
// 获取粉丝或关注列表
userRouter.get('/:userId/:type', setCareFansList, showCareFansList)
// 编辑资料
userRouter.post('/edit', verifyAuth, handleUserInfo, edit)

module.exports = userRouter
