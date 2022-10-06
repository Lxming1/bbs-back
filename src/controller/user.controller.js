const fs = require('fs')
const { AVATAR_PATH } = require('../constants/file-types')
const { getAvatarInfo } = require('../service/user.service')
const service = require('../service/user.service')
const { successMes } = require('../utils/common')
const redis = require('../utils/redis')

class User {
  async verifyEmail(ctx, next) {}

  async create(ctx, next) {
    const { email, password } = ctx.request.body
    await service.create({ email, password })
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
}

module.exports = new User()
