const fs = require('fs')
const { AVATAR_PATH } = require('../constants/file-types')
const { getPraisedList, getMomentTotalByUser } = require('../service/moment.service')
const { getNoticeCount, allNoticesCount } = require('../service/notices.service')
const {
  getAvatarInfo,
  care,
  cancelCare,
  create,
  getUserInfo,
  changePassword,
  getMomentsByUser,
  getAddress,
  getRelation,
} = require('../service/user.service')
const { successMes, successBody, isMyNaN } = require('../utils/common')
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
    let result = await care(formUid, toUid)
    result = await getRelation(formUid, toUid)
    ctx.body = successBody(result, '关注成功')
  }

  async cancelCare(ctx) {
    const { userId: toUid } = ctx.params
    const { id: formUid } = ctx.user
    if (toUid === formUid) return
    let result = await cancelCare(formUid, toUid)
    result = await getRelation(formUid, toUid)
    ctx.body = successBody(result, '取消关注成功')
  }

  async showCareFansList(ctx) {
    const result = ctx.result
    const total = ctx.total
    ctx.body = successBody({
      total,
      followList: result,
    })
  }

  async edit(ctx) {
    const { id } = ctx.user
    const result = await getUserInfo(id)
    ctx.body = successBody(result, '编辑成功')
  }

  async showUserInfo(ctx) {
    const { id } = ctx.user
    const { userId, type } = ctx.params
    if (!['profile', 'other'].includes(type)) return
    try {
      let result
      if (type === 'other') {
        result = await getUserInfo(userId)
      } else {
        result = await getUserInfo(id)
        let noticeCount = await allNoticesCount(id)
        const map = ['praise', 'reply', 'follow']
        noticeCount = noticeCount.reduce(
          (pre, value) => ({
            ...pre,
            [map[value.type]]: value.count,
          }),
          {}
        )
        map.forEach((item) => {
          const key = noticeCount[item]
          noticeCount[item] = !key ? 0 : key
        })
        result.noticeCount = noticeCount
      }
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

  async showMomentsByUser(ctx) {
    const { pagenum, pagesize } = ctx.query
    if (isMyNaN(pagenum, pagesize)) return
    if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
      const err = new Error(FORMAT_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    const { userId } = ctx.params
    try {
      let result = await getMomentsByUser(userId, pagenum, pagesize)
      result = await Promise.all(
        result.map(async (item) => {
          item.author = await getUserInfo(item.author)
          return item
        })
      )
      const uid = ctx?.user?.id
      // 不是本人则过滤掉匿名动态
      if (parseInt(userId) !== uid) {
        result = result.filter((item) => item.visible === 0)
      }
      if (uid) {
        const praiseList = (await getPraisedList(uid)).map((item) => item.momentId)
        result = result.map((item) => {
          item.isPraise = praiseList.some((praiseId) => praiseId === item.id)
          return item
        })
      }
      const total = await getMomentTotalByUser(userId)
      ctx.body = successBody({
        total: total.count,
        moments: result,
      })
    } catch (e) {
      console.log(e)
    }
  }

  async addressList(ctx) {
    const result = await getAddress()
    const map = {}
    const res = []
    result.forEach((item) => {
      if (item.pid === null) {
        map[item.id] = item
      }
    })
    result.forEach((item) => {
      if (item.pid === null) {
        res.push(item)
      }
      if (item.pid !== null) {
        const parent = map[item.pid]
        parent.children = parent.children || []
        parent.children.push(item)
      }
    })
    ctx.body = successBody(res)
  }

  async careFanRelation(ctx) {
    const { uid } = ctx.params
    const { id } = ctx.user
    if (parseInt(uid) === id) return
    const result = await getRelation(id, uid)
    ctx.body = successBody(result)
  }
}

module.exports = new User()
