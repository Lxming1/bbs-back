const Multer = require('koa-multer')
const fs = require('fs')
const path = require('path')
const jimp = require('jimp')

const { AVATAR_PATH, PICTURE_PATH } = require('../constants/file-types')
const { currentAvatar, rmAvatar } = require('../service/file.service')

// 配置上传位置
const upload = Multer({
  dest: AVATAR_PATH,
})

const upload1 = Multer({
  dest: PICTURE_PATH,
})

const handleAvatar = upload.single('avatar')
// 最大上传数量9
const handlePicture = upload1.array('picture', 9)

const rmExistAvatar = async (ctx, next) => {
  const { id } = ctx.user
  // 查询用户当前是否有头像
  const avatarMes = await currentAvatar(id)
  // 添加头像前有头像则删除之
  if (avatarMes.length) {
    await Promise.all([rmAvatar(id), fs.promises.rm(`${AVATAR_PATH}/${avatarMes[0].filename}`)])
  }

  await next()
}

const resizePicture = async (ctx, next) => {
  const { files } = ctx.req
  for (let file of files) {
    const destination = path.join(file.destination, file.filename)
    jimp.read(file.path).then((image) => {
      image.resize(1280, jimp.AUTO).write(`${destination}-large`)
      image.resize(640, jimp.AUTO).write(`${destination}-middle`)
      image.resize(320, jimp.AUTO).write(`${destination}-small`)
    })
  }

  await next()
}
module.exports = {
  handleAvatar,
  handlePicture,
  rmExistAvatar,
  resizePicture,
}
