const fs = require('fs')
const { AVATAR_PATH } = require('../constants/file-types')
const { getAvatarInfo, care, cancelCare } = require('../service/user.service')
const service = require('../service/user.service')
const { successMes, successBody } = require('../utils/common')
const redis = require('../utils/redis')

class User {
  async create(ctx, next) {
    const { email, password } = ctx.request.body
    await service.create({ email, password })
    await redis.del(email)
    ctx.body = successMes('注册成功')
  }

  // 展示图片
  async showAvatar(ctx) {
    const { userId } = ctx.params
    try {
      const result = await getAvatarInfo(userId)
      ctx.response.set('content-type', result[0].mimetype)
      ctx.body = fs.createReadStream(`${AVATAR_PATH}/${result[0].filename}`)
    } catch (e) {
      console.log(e)
    }
  }

  async reactive(ctx) {
    ctx.body = successMes('验证码已发送，请及时查收')
  }

  async care(ctx) {
    const { userId: toUid } = ctx.params
    const { id: formUid } = ctx.user
    if (toUid === formUid) return
    const result = await care(formUid, toUid)
    ctx.body = successBody(result, '关注成功')
  }

  async cancelCare(ctx) {
    const { userId: toUid } = ctx.params
    const { id: formUid } = ctx.user
    if (toUid === formUid) return
    const result = await cancelCare(formUid, toUid)
    ctx.body = successBody(result, '取消关注成功')
  }

  async showCareFansList(ctx) {
    const result = ctx.result
    ctx.body = successBody({
      total: result.length,
      users: result,
    })
  }

  async edit(ctx) {
    ctx.body = successBody(ctx.result, '编辑成功')
  }
}

module.exports = new User()
