const Router = require('koa-router')
const { verifyAuth, verifyPermission } = require('../middleware/auth.middleware')
const { saveAvatar, savePicture, delPicFromLocal } = require('../controller/file.controller')
const {
  handleAvatar,
  rmExistAvatar,
  handlePicture,
  resizePicture,
  delPicFromDB,
} = require('../middleware/file.middleware')

const uploadRouter = new Router({ prefix: '/upload' })

// 上传头像
uploadRouter.post('/avatar', verifyAuth, rmExistAvatar, handleAvatar, saveAvatar)
// 上传动态配图
uploadRouter.post('/picture', verifyAuth, handlePicture, resizePicture, savePicture)
// 删除动态图片
uploadRouter.del('/picture/:momentId', verifyAuth, verifyPermission, delPicFromDB, delPicFromLocal)

module.exports = uploadRouter
