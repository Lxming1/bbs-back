const { create, del, update, praise, cancelPraise } = require('../service/moment.service')
const { successBody } = require('../utils/common')

class Moment {
  async create(ctx) {
    const { id } = ctx.user
    const { title, content, plateId, visible } = ctx.request.body
    const result = await create(title, content, id, plateId, visible)
    ctx.body = successBody(result, '发表动态成功')
  }

  async search(ctx) {
    const result = ctx.result
    ctx.body = successBody({
      total: result.length,
      momentList: result,
    })
  }

  // 查询一条动态
  async detail(ctx, next) {
    ctx.body = successBody(ctx.result)
  }

  // 查询多条动态
  async list(ctx, next) {
    const result = ctx.result
    ctx.body = successBody({
      total: result?.length ?? 0,
      moments: result,
    })
  }

  // 修改动态
  async update(ctx, next) {
    const { momentId } = ctx.params
    const { title, content, plateId, visible } = ctx.request.body
    const result = await update(momentId, title, content, plateId, visible)
    ctx.body = successBody(result, '编辑成功')
  }

  // 删除动态
  async del(ctx, next) {
    const { momentId } = ctx.params
    const result = await del(momentId)
    ctx.body = successBody(result, '删除成功')
  }

  async showPicture(ctx) {
    ctx.body = ctx.result
  }

  async praiseMoment(ctx) {
    const { momentId } = ctx.params
    const { id } = ctx.user
    if (isNaN(momentId)) return
    const result = await praise(id, momentId)
    ctx.body = successBody(result, '点赞成功')
  }

  async cancelPraiseMoment(ctx) {
    const { momentId } = ctx.params
    const { id } = ctx.user
    if (isNaN(momentId)) return
    const result = await cancelPraise(id, momentId)
    ctx.body = successBody(result, '取消点赞成功')
  }
}

module.exports = new Moment()
