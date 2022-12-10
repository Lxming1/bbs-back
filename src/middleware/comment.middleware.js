const {
  list,
  verify,
  getCommentCount,
  getPraiseList,
  verifyDelComment,
} = require('../service/comment.service')
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
  const { momentId } = ctx.query
  const { id: userId } = ctx.user
  if (!momentId) return
  try {
    const result = await list(momentId)
    const promiseArr = result.map(async (item) => {
      item.author = await getUserInfo(item.author)
      return item
    })
    await Promise.all(promiseArr)
    const total = await getCommentCount(momentId)
    if (userId) {
      let praiseList = await getPraiseList(userId)
      praiseList = praiseList.map((item) => item.commentId).filter(Boolean)
      ctx.praiseList = praiseList
    }
    ctx.total = total[0].count
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

const handleDelComment = async (ctx, next) => {
  const { commentId } = ctx.params
  const { id } = ctx.user
  const { momentId } = ctx.request.body

  if (await verifyDelComment(id, commentId, momentId)) {
    await next()
  }
}

module.exports = {
  verifyComment,
  handleComment,
  handleDelComment,
}
