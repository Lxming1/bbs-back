const Router = require('koa-router')
const {
  create,
  reply,
  del,
  list,
  pariseComment,
  cancelPariseComment,
} = require('../controller/comment.controller')
const { verifyAuth, verifyAuthNoLimit } = require('../middleware/auth.middleware')
const {
  verifyComment,
  handleDelComment,
  handleComment,
} = require('../middleware/comment.middleware')

const commentRouter = new Router({ prefix: '/comment' })

// 发表评论
commentRouter.post('/', verifyAuth, create)
// 点赞评论
commentRouter.post('/:commentId/praise', verifyAuth, verifyComment, pariseComment)
// 取消点赞
commentRouter.delete('/:commentId/praise', verifyAuth, verifyComment, cancelPariseComment)
// 回复评论
commentRouter.post('/:commentId/reply', verifyAuth, verifyComment, reply)
// 删除评论
commentRouter.delete('/:commentId', verifyAuth, handleDelComment, del)
// 获取评论列表
commentRouter.get('/', verifyAuthNoLimit, handleComment, list)

module.exports = commentRouter
