const fs = require('fs')
const { AVATAR_PATH } = require('../constants/file-types')
const { getAvatarInfo, care, cancelCare } = require('../service/user.service')
const service = require('../service/user.service')
const { successMes } = require('../utils/common')
const redis = require('../utils/redis')

class User {
  async create(ctx, next) {
    const { name, email, password } = ctx.request.body
    await service.create({ name, email, password })
    await redis.del(email)
    ctx.body = successMes('注册成功')
  }

  // 展示图片
  async showAvatar(ctx) {
    const { userId } = ctx.params

    const result = await getAvatarInfo(userId)

    ctx.response.set('content-type', result[0].mimetype)
    ctx.body = fs.createReadStream(`${AVATAR_PATH}/${result[0].filename}`)
  }

  async reactive(ctx) {
    ctx.body = successMes('验证码发送成功，请及时查收')
  }

  async care(ctx) {
    const { userId: toUid } = ctx.params
    const { userId: formUid } = ctx.user
    await care(formUid, toUid)
    ctx.body = successMes('关注成功')
  }

  async cancelCare(ctx) {
    const { userId: toUid } = ctx.params
    const { userId: formUid } = ctx.user
    await cancelCare(formUid, toUid)
    ctx.body = successMes('取消关注成功')
  }
}

module.exports = new User()
