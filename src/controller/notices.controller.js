const { read, del } = require('../service/notices.service')
const { successBody } = require('../utils/common')

class Notices {
  async showNotices(ctx) {
    ctx.body = successBody(ctx.result)
  }

  async readNotices(ctx) {
    const { ids } = ctx.request.body
    const { id: uid } = ctx.user
    const result = await Promise.all(ids.map((id) => read(id, uid)))
    ctx.body = successBody(result)
  }

  async delNotice(ctx) {
    const { noticesId } = ctx.params
    try {
      const result = await del(noticesId)
      ctx.body = successBody(result, '删除成功')
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Notices()
