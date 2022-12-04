const { APP_HOST, APP_PORT } = require('../app/config')
const { saveFileInfo, savaAvatar, savePicInfo } = require('../service/file.service')
const { detail } = require('../service/moment.service')
const { getUserInfo } = require('../service/user.service')
const { successBody } = require('../utils/common')

class FileController {
  async saveAvatar(ctx) {
    const { id } = ctx.user
    // 获取图像信息
    const { mimetype, filename, size } = ctx.req.file
    // 将图像地址存入用户数据库
    await savaAvatar(`${APP_HOST}:${APP_PORT}/users/${id}/avatar`, id)
    // 将图像信息保存到数据库
    const result = await saveFileInfo(filename, mimetype, size, id)
    ctx.body = successBody(result, '上传头像成功')
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
    ctx.body = successBody(moment, '发表动态成功')
  }
}

module.exports = new FileController()
