const { list, verify } = require('../service/comment.service')
const { getUserInfo } = require('../service/user.service')
const { isMyNaN } = require('../utils/common')

const verifyComment = async (ctx, next) => {
  const { momentId } = ctx.request.body
  const { commentId } = ctx.params
  // 验证该动态是否有这条评论
  if (isMyNaN(commentId, momentId)) return
  const result = await verify(momentId, commentId)
  if (!result.length) return
  await next()
}

const handleComment = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { momentId } = ctx.query
  if (!momentId) return
  try {
    const result = await list(momentId, pagenum, pagesize)
    const promiseArr = result.map(async (item) => {
      item.author = await getUserInfo(item.author)
      return item
    })
    await Promise.all(promiseArr)
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  verifyComment,
  handleComment,
}
