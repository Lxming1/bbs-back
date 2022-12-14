const Router = require('koa-router')
const {
  create,
  showAvatar,
  reactive,
  care,
  cancelCare,
  showUserList,
  edit,
  showUserInfo,
  changPass,
  showMomentsByUser,
  addressList,
  careFanRelation,
  userTopList,
} = require('../controller/user.controller')
const { verifyAuth, verifyAuthNoLimit } = require('../middleware/auth.middleware')
const {
  verifyUEmail,
  sendEmail,
  verifyCode,
  verifyPass,
  handlePassword,
  setCareFansList,
  handleUserInfo,
  findPassSendEmail,
  verifyFindPassCode,
  verifyUEmailFind,
  getSearchUserList,
} = require('../middleware/user.middleware')

const userRouter = new Router({ prefix: '/users' })
// 发送验证码
userRouter.post('/sendemail', verifyUEmail, sendEmail, reactive)
// 注册
userRouter.post('/', verifyUEmail, verifyCode, verifyPass, handlePassword, create)
// 找回密码发送验证码
userRouter.post('/sendemail-find', verifyUEmailFind, findPassSendEmail, reactive)
// 修改密码
userRouter.patch('/', verifyUEmailFind, verifyFindPassCode, verifyPass, handlePassword, changPass)
// 获取用户榜单
userRouter.get('/toplist/:count', verifyAuthNoLimit, userTopList)
// 查询粉丝关注关系
userRouter.get('/care_fan/:uid', verifyAuth, careFanRelation)
// 获取头像
userRouter.get('/:userId/avatar', showAvatar)
// 关注
userRouter.post('/:userId/care', verifyAuth, care)
// 取消关注
userRouter.delete('/:userId/care', verifyAuth, cancelCare)
// 获取用户的动态
userRouter.get('/:userId/moments', verifyAuthNoLimit, showMomentsByUser)
// 获取用户个人信息
userRouter.get('/:userId/detail/:type', verifyAuthNoLimit, showUserInfo)
// 获取粉丝或关注列表
userRouter.get('/:userId/:type', verifyAuthNoLimit, setCareFansList, showUserList)
// 编辑资料
userRouter.put('/', verifyAuth, handleUserInfo, edit)
// 获取省市
userRouter.get('/address', addressList)
// 搜索用户
userRouter.get('/search', verifyAuthNoLimit, getSearchUserList, showUserList)

module.exports = userRouter
