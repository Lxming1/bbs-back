const Multer = require('koa-multer')
const fs = require('fs')
const path = require('path')
const jimp = require('jimp')

const { AVATAR_PATH, PICTURE_PATH } = require('../constants/file-types')
const { currentAvatar, rmAvatar, getPicByMoment, delMomentPic } = require('../service/file.service')

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
  avatarMes.length &&
    (await Promise.all([rmAvatar(id), fs.promises.rm(`${AVATAR_PATH}/${avatarMes[0].filename}`)]))

  await next()
}

const rmPicIfMomentHas = async (ctx, next) => {
  const { momentId } = ctx.params
  const { id } = ctx.user
  try {
    const result = await getPicByMoment(momentId, id)
    const promiseArr = result.map(async (item) => {
      const picPath = `${PICTURE_PATH}/${item.filename}`
      const promiseArr = [
        fs.promises.rm(picPath),
        fs.promises.rm(`${picPath}-large`),
        fs.promises.rm(`${picPath}-small`),
      ]
      await Promise.all(promiseArr)
    })
    await Promise.all(promiseArr)
    await next()
  } catch (e) {
    console.log(e)
  }
}

const resizePicture = async (ctx, next) => {
  const { files } = ctx.req
  for (let file of files) {
    const destination = path.join(file.destination, file.filename)
    jimp.read(file.path).then((image) => {
      image.resize(1280, jimp.AUTO).write(`${destination}-large`)
      image.resize(320, jimp.AUTO).write(`${destination}-small`)
    })
  }
  await next()
}

const delPicFromDB = async (ctx, next) => {
  const images = ctx.request.body
  const { momentId } = ctx.params
  const { id } = ctx.user
  await Promise.all(images.map((image) => delMomentPic(momentId, id, image)))
  await next()
}

module.exports = {
  handleAvatar,
  handlePicture,
  rmExistAvatar,
  rmPicIfMomentHas,
  resizePicture,
  delPicFromDB,
}
