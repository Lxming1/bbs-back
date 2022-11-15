const Router = require('koa-router')
const {
  showCollectList,
  create,
  update,
  createDetail,
  cancel,
} = require('../controller/collect.controller')
const { verifyAuth, verifyPermission } = require('../middleware/auth.middleware')

const collectRouter = new Router({ prefix: '/collect' })

// 新建收藏夹
collectRouter.post('/', verifyAuth, create)
// 获取用户收藏夹列表
collectRouter.get('/', verifyAuth, showCollectList)
// 修改收藏夹名称
collectRouter.patch('/:collectId', verifyAuth, verifyPermission, update)
// 添加动态至收藏夹
collectRouter.post('/:collectId', verifyAuth, verifyPermission, createDetail)
// 取消收藏
collectRouter.delete('/:collectId', verifyAuth, verifyPermission, cancel)

module.exports = collectRouter
