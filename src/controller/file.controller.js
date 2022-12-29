const { APP_HOST, APP_PORT } = require('../app/config')
const { saveFileInfo, savaAvatar, savePicInfo } = require('../service/file.service')
const { detail } = require('../service/moment.service')
const { getUserInfo } = require('../service/user.service')
const { successBody } = require('../utils/common')
const { PICTURE_PATH } = require('../constants/file-types')
const fs = require('fs')

class FileController {
  async saveAvatar(ctx) {
    const { id } = ctx.user
    // 获取图像信息
    const { mimetype, filename, size } = ctx.req.file
    // 将图像地址存入用户数据库
    await savaAvatar(`${APP_HOST}:${APP_PORT}/users/${id}/avatar`, id)
    // 将图像信息保存到数据库
    await saveFileInfo(filename, mimetype, size, id)
    ctx.body = successBody(`${APP_HOST}:${APP_PORT}/users/${id}/avatar`, '上传头像成功')
  }

  async savePicture(ctx) {
    const { momentId } = ctx.query
    const { id } = ctx.user
    const { files } = ctx.req

    await Promise.all(
      files.map(async (file) => {
        const { mimetype, filename, size } = file
        await savePicInfo(filename, mimetype, size, momentId, id)
      })
    )
    const moment = (await detail(momentId))[0]
    if (moment.visible === 1) {
      moment.author = {
        id: moment.author.id,
        avatar_url: `${APP_HOST}:${APP_PORT}/users/0/avatar`,
        name: '匿名用户',
      }
    } else {
      moment.author = await getUserInfo(moment.author)
    }
    ctx.body = successBody(moment, '发布成功，请等待审核')
  }

  async delPicFromLocal(ctx) {
    const images = ctx.request.body
    const promiseArr = images.map(async (item) => {
      const picPath = `${PICTURE_PATH}/${item}`
      const promiseArr = [
        fs.promises.rm(picPath),
        fs.promises.rm(`${picPath}-large`),
        fs.promises.rm(`${picPath}-small`),
      ]
      await Promise.all(promiseArr)
    })
    await Promise.all(promiseArr)
    ctx.body = successBody({}, '删除成功')
  }
}

module.exports = new FileController()
