const Router = require('koa-router')
const { list } = require('../controller/plate.controller')

const plateRouter = new Router({ prefix: '/plate' })

// 获取分类
plateRouter.get('/', list)

module.exports = plateRouter
