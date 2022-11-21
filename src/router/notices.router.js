const Router = require('koa-router')
const { showNotices } = require('../controller/notices.controller')
const { verifyAuth } = require('../middleware/auth.middleware')
const { handleNotices } = require('../middleware/notices.middleware')

const noticeRouter = new Router({ prefix: '/notices' })

// 获取通知列表
noticeRouter.get('/:type', verifyAuth, handleNotices, showNotices)

module.exports = noticeRouter
