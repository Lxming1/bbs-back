const {
  create,
  reply,
  del,
  praise,
  cancelPraise,
  getPraiseList,
} = require('../service/comment.service')
const { successBody, isMyNaN } = require('../utils/common')

class Comment {
  async create(ctx) {
    const { content, momentId } = ctx.request.body
    const userId = ctx.user.id
    const result = await create(content, momentId, userId)
    ctx.body = successBody(result, '评论发表成功')
  }

  async reply(ctx) {
    const { content, momentId } = ctx.request.body
    const { commentId } = ctx.params
    const userId = ctx.user.id
    const result = await reply(content, momentId, userId, commentId)
    ctx.body = successBody(result, '回复评论成功')
  }

  async del(ctx) {
    const { commentId } = ctx.params
    const result = await del(commentId)
    ctx.body = successBody(result, '删除成功')
  }

  async list(ctx) {
    let result = ctx.result
    const praiseList = ctx.praiseList ?? []
    const res = []
    const map = result.reduce((pre, item) => {
      pre[item.id] = item
      return pre
    }, {})
    for (const item of result) {
      console.log(praiseList.length)
      if (praiseList.length) {
        item.isPraise = praiseList.includes(item.id)
      }
      if (item.commentId === null) {
        res.push(item)
      }
      if (item.commentId in map) {
        const parent = map[item.commentId]
        parent.children = parent.children || []
        parent.children.push(item)
      }
    }
    result = res
    ctx.body = successBody({
      total: ctx.total,
      comments: result,
    })
  }

  async pariseComment(ctx) {
    const { commentId } = ctx.params
    const { momentId } = ctx.request.body
    const { id } = ctx.user
    if (isMyNaN(commentId, momentId)) return
    const result = await praise(id, momentId, commentId)
    ctx.body = successBody(result, '点赞成功')
  }

  async cancelPariseComment(ctx) {
    const { commentId } = ctx.params
    const { momentId } = ctx.request.body
    const { id } = ctx.user
    if (isMyNaN(commentId, momentId)) return
    const result = await cancelPraise(id, momentId, commentId)
    ctx.body = successBody(result, '取消点赞成功')
  }
}

module.exports = new Comment()
