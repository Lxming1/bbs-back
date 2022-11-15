const Router = require('koa-router')
const {
  create,
  showAvatar,
  reactive,
  care,
  cancelCare,
  showCareFansList,
  edit,
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

const careFansFn = [verifyAuth, setCareFansList, showCareFansList]
// 获取粉丝列表
userRouter.get('/:userId/fans', ...careFansFn)
// 获取以关注列表
userRouter.get('/:userId/care', ...careFansFn)
// 编辑资料
userRouter.post('/edit', verifyAuth, handleUserInfo, edit)

module.exports = userRouter
