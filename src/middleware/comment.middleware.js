const service = require('../service/comment.service')

const verifyReply = async (ctx, next) => {
  const { momentId } = ctx.request.body
  const { commentId } = ctx.params

  // 验证该动态是否有这条评论
  const result = await service.verifyReply(momentId, commentId)

  if (!result.length) {
    const err = new Error()
    return ctx.app.emit('error', err, ctx)
  }

  await next()
}

module.exports = {
  verifyReply,
}
