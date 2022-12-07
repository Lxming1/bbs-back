const Router = require('koa-router')
const {
  showCollectList,
  create,
  update,
  createDetail,
  cancel,
  getCollectDetail,
  delCollect,
} = require('../controller/collect.controller')
const { handleCollectDetail } = require('../middleware/collect.middleware')
const { verifyAuth, verifyPermission, verifyAuthNoLimit } = require('../middleware/auth.middleware')

const collectRouter = new Router({ prefix: '/collect' })

// 新建收藏夹
collectRouter.post('/', verifyAuth, create)
// 获取用户收藏夹列表
collectRouter.get('/', verifyAuthNoLimit, showCollectList)
// 删除收藏库
collectRouter.del('/del/:collectId', verifyAuth, verifyPermission, delCollect)
// 修改收藏夹名称
collectRouter.patch('/:collectId', verifyAuth, verifyPermission, update)
// 添加动态至收藏夹
collectRouter.post('/:collectId', verifyAuth, verifyPermission, createDetail)
// 取消收藏
collectRouter.delete('/:collectId', verifyAuth, verifyPermission, cancel)
// 获取收藏夹明细
collectRouter.get('/detail/:collectId', verifyAuthNoLimit, handleCollectDetail, getCollectDetail)

module.exports = collectRouter
