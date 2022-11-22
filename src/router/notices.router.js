const Router = require('koa-router')
const { showNotices, readNotices, delNotice } = require('../controller/notices.controller')
const { verifyAuth, verifyPermission } = require('../middleware/auth.middleware')
const { handleNotices } = require('../middleware/notices.middleware')

const noticeRouter = new Router({ prefix: '/notices' })

// 获取通知列表
noticeRouter.get('/:type', verifyAuth, handleNotices, showNotices)
// 读消息
noticeRouter.patch('/', verifyAuth, readNotices)
// 删除消息
noticeRouter.del('/:noticesId', verifyAuth, verifyPermission, delNotice)

module.exports = noticeRouter
