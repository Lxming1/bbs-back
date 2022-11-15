const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')
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
      userInfo.token = token
      ctx.body = successBody(userInfo, '登录成功')
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Auth()
