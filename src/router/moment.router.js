const Router = require('koa-router')
const { verifyAuth, verifyPermission } = require('../middleware/auth.middleware')
const {
  create,
  search,
  detail,
  list,
  del,
  update,
  showPicture,
  praiseMoment,
  cancelPraiseMoment,
} = require('../controller/moment.controller.js')
const { getMultiMoment, getSingleMoment, searchMoment } = require('../middleware/moment.middleware')

const momentRouter = new Router({ prefix: '/moment' })

// 发表动态
momentRouter.post('/', verifyAuth, create)
// 搜索动态
momentRouter.get('/search', searchMoment, search)
// 查询某一条动态
momentRouter.get('/:momentId', getSingleMoment, detail)
// 查询所有动态
momentRouter.get('/', getMultiMoment, list)
// 修改一条动态
momentRouter.patch('/:momentId', verifyAuth, verifyPermission, update)
// 删除一条动态
momentRouter.delete('/:momentId', verifyAuth, verifyPermission, del)
// 获取动态图片
momentRouter.get('/image/:filename', showPicture)
// 点赞动态
momentRouter.post('/:momentId/praise', verifyAuth, praiseMoment)
// 取消点赞
momentRouter.delete('/:momentId/praise', verifyAuth, cancelPraiseMoment)

module.exports = momentRouter
