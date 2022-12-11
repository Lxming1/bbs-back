const Router = require('koa-router')
const { verifyAuth, verifyPermission, verifyAuthNoLimit } = require('../middleware/auth.middleware')
const {
  create,
  search,
  detail,
  list,
  del,
  update,
  showPicture,
  praiseMoment,
  praiseList,
  cancelPraiseMoment,
} = require('../controller/moment.controller.js')
const {
  getMultiMoment,
  getSingleMoment,
  searchMoment,
  getProfileMoment,
  getCareMoments,
} = require('../middleware/moment.middleware')
const { rmPicIfMomentHas } = require('../middleware/file.middleware')

const momentRouter = new Router({ prefix: '/moment' })

// 发表动态
momentRouter.post('/', verifyAuth, create)
// 搜索动态
momentRouter.get('/search', searchMoment, search)
// 获取点赞列表
momentRouter.get('/praise', verifyAuth, praiseList)
// 关注的用户的动态
momentRouter.get('/care', verifyAuth, getCareMoments, search)
// 查询某一条动态
momentRouter.get('/:momentId', verifyAuthNoLimit, getSingleMoment, detail)
// 查询个人动态编辑
momentRouter.get('/profile/:momentId', verifyAuth, verifyPermission, getProfileMoment, detail)
// 查询所有动态
momentRouter.get('/plate/:plateId', verifyAuthNoLimit, getMultiMoment, list)
// 修改一条动态
momentRouter.patch('/:momentId', verifyAuth, verifyPermission, update)
// 删除一条动态
momentRouter.delete('/:momentId', verifyAuth, verifyPermission, rmPicIfMomentHas, del)
// 获取动态图片
momentRouter.get('/image/:filename', showPicture)
// 点赞动态
momentRouter.post('/:momentId/praise', verifyAuth, praiseMoment)
// 取消点赞
momentRouter.delete('/:momentId/praise', verifyAuth, cancelPraiseMoment)

module.exports = momentRouter
