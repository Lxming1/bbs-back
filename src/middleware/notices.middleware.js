const { getNotices } = require('../service/notices.service')
const { getRelation } = require('../service/user.service')
const { isMyNaN } = require('../utils/common')
const handleNotices = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { type } = ctx.params
  const map = {
    praise: '0',
    reply: '1',
    follow: '2',
  }
  if (!map[type]) return
  const { id } = ctx.user
  try {
    let result = await getNotices(id, map[type], pagenum, pagesize)
    if (type === 'follow') {
      result = await Promise.all(
        result.map(async (item) => {
          const relation = await getRelation(id, item.author.id)
          item.author.relation = relation
          return item
        })
      )
    }
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  handleNotices,
}
