const fs = require('fs')
const { AVATAR_PATH } = require('../constants/file-types')
const {
  getAvatarInfo,
  care,
  cancelCare,
  create,
  getUserInfo,
  changePassword,
} = require('../service/user.service')
const { successMes, successBody } = require('../utils/common')
const redis = require('../utils/redis')

class User {
  async create(ctx) {
    const { email, password } = ctx.request.body
    const userId = await create({ email, password })
    const result = await getUserInfo(userId)
    await redis.del(email)
    ctx.body = successBody(result, '注册成功')
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

  async showUserInfo(ctx) {
    const { userId } = ctx.params
    if (!userId) return
    try {
      const result = await getUserInfo(userId)
      ctx.body = successBody(result)
    } catch (e) {
      console.log(e)
    }
  }

  async changPass(ctx) {
    const { email, password } = ctx.request.body
    try {
      const result = await changePassword(email, password)
      ctx.body = successBody(result, '修改成功')
      await redis.del(`${email}find`)
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new User()
