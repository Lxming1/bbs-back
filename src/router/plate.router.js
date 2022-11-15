const Router = require('koa-router')
const { showPlateList, showMomentByPlage } = require('../controller/plate.controller')
const { getMomentByPlateId } = require('../middleware/plate.middleware')
const palteRouter = new Router({ prefix: '/plate' })

// 获取分类列表
palteRouter.get('/list', showPlateList)
// 根据分类获取动态
palteRouter.get('/:plateId', getMomentByPlateId, showMomentByPlage)

module.exports = palteRouter
