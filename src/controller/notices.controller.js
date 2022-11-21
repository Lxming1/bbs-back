const { successBody } = require('../utils/common')

class Notices {
  async showNotices(ctx) {
    ctx.body = successBody(ctx.result)
  }
}

module.exports = new Notices()
