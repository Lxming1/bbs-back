const { EXIST_COLLECT } = require('../constants/error-types')
const {
  getCollectByUID,
  create,
  update,
  createDetail,
  cancel,
  findMomentInCollect,
  delCollection,
} = require('../service/collect.service')
const { successBody } = require('../utils/common')

class Collect {
  async create(ctx) {
    const { id } = ctx.user
    const { name, status } = ctx.request.body
    if ([status, name].includes(undefined)) return
    try {
      const result = await create(id, name, status)
      ctx.body = successBody(result, '创建成功')
    } catch (e) {
      const err = new Error(EXIST_COLLECT)
      return ctx.app.emit('error', err, ctx)
    }
  }

  async update(ctx) {
    const { name, status } = ctx.request.body
    const { collectId } = ctx.params
    if ([status, name].includes(undefined)) return
    try {
      const result = await update(collectId, name, status)
      ctx.body = successBody(result, '编辑成功')
    } catch (e) {
      console.log(e)
    }
  }

  async showCollectList(ctx) {
    const { uid, momentId } = ctx.query
    let result = await getCollectByUID(uid)
    if (momentId) {
      const hasCollect = await findMomentInCollect(momentId, uid)
      result = result.map((item) => {
        item.isCollected = hasCollect.map((item1) => item1.id).includes(item.id)
        return item
      })
    }
    const id = ctx?.user?.id
    if (!id || parseInt(id) !== parseInt(uid)) {
      result = result.filter((item) => item.status === 0)
    }
    ctx.body = successBody(result)
  }

  async createDetail(ctx) {
    const { collectId } = ctx.params
    const { momentId } = ctx.request.body
    if (momentId === undefined) return

    try {
      const result = await createDetail(collectId, momentId)
      ctx.body = successBody(result, '添加成功')
    } catch (e) {}
  }

  async cancel(ctx) {
    const { collectId } = ctx.params
    const { momentId } = ctx.request.body
    if (momentId === undefined) return
    try {
      const result = await cancel(collectId, momentId)
      ctx.body = successBody(result, '取消收藏成功')
    } catch (e) {
      console.log(e)
    }
  }

  async getCollectDetail(ctx) {
    ctx.body = successBody(ctx.result, '获取成功')
  }

  async delCollect(ctx) {
    const { collectId } = ctx.params
    try {
      const result = await delCollection(collectId)
      ctx.body = successBody(result, '删除成功')
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new Collect()
