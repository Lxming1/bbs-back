const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../app/config')
const { successBody } = require('../utils/common')

class Auth {
  async login(ctx, next) {
    const { id, email } = ctx.user
    const token = jwt.sign({ id, email }, PRIVATE_KEY, {
      expiresIn: 60 * 60 * 24 * 30,
      algorithm: 'RS256',
    })

    ctx.body = successBody({ ...ctx.user, token }, '登录成功')
  }
}

module.exports = new Auth()
