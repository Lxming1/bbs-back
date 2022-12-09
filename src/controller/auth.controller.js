const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')
const { getNoticeCount, allNoticesCount } = require('../service/notices.service')
const { getUserInfo } = require('../service/user.service')
const { successBody } = require('../utils/common')

class Auth {
  async login(ctx) {
    const { id, email } = ctx.user
    const token = jwt.sign({ id, email }, PRIVATE_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
      algorithm: 'RS256',
    })
    try {
      const userInfo = await getUserInfo(id)
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
      userInfo.noticeCount = noticeCount
      userInfo.token = token
      ctx.body = successBody(userInfo, '登录成功')
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Auth()
