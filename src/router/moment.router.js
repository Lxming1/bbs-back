const Router = require('koa-router')
const { verifyAuth, verifyPermission } = require('../middleware/auth.middleware')
const {
  create,
  detail,
  list,
  del,
  update,
  showPicture,
} = require('../controller/moment.controller.js')
const { setMultiUserInfo, setSingleUserInfo } = require('../middleware/moment.middleware')

const momentRouter = new Router({ prefix: '/moment' })

// 发表动态
momentRouter.post('/', verifyAuth, create)
// 查询某一条动态
momentRouter.get('/:momentId', setSingleUserInfo, detail, (ctx) => {
  ctx.body = {
    message: 'success',
  }
})
// 查询所有动态
momentRouter.get('/', setMultiUserInfo, list)
// 修改一条动态
momentRouter.patch('/:momentId', verifyAuth, verifyPermission, update)
// 删除一条动态
momentRouter.delete('/:momentId', verifyAuth, verifyPermission, del)
// 获取动态图片
momentRouter.get('/image/:filename', showPicture)

module.exports = momentRouter
