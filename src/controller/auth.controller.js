const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')
const { getUserAvatar } = require('../service/user.service')
const { successBody } = require('../utils/common')

class Auth {
  async login(ctx, next) {
    const { id, name, username: uname, school } = ctx.user
    const username = uname || '小白'
    const token = jwt.sign({ id, name }, PRIVATE_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
      algorithm: 'RS256',
    })

    const userAvatar = await getUserAvatar(id)
    const avatarUrl = userAvatar.avatar_url
    ctx.body = successBody({ id, name, avatarUrl, username, school, token }, '登录成功')
  }
}

module.exports = new Auth()
