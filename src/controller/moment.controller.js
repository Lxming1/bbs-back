const fs = require('fs')
const { PICTURE_PATH } = require('../constants/file-types')
const { create, del, update, getPicInfo } = require('../service/moment.service')
const { successBody } = require('../utils/common')

class Moment {
  async create(ctx, next) {
    const userId = ctx.user.id
    const { content } = ctx.request.body

    const result = await create(userId, content)

    ctx.body = successBody(result, '发表动态成功')
  }

  // 查询一条动态
  async detail(ctx, next) {
    const result = ctx.result
    ctx.body = successBody(result)
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
    const { content } = ctx.request.body

    const result = await update(momentId, content)

    ctx.body = successBody(result, '编辑成功')
  }

  // 删除动态
  async del(ctx, next) {
    const { momentId } = ctx.params

    const result = await del(momentId)

    ctx.body = successBody(result, '删除成功')
  }

  async showPicture(ctx) {
    try {
      let { filename } = ctx.params
      const { type } = ctx.query
      const types = ['large', 'middle', 'small']
      if (type) {
        if (types.some((item) => item === type)) {
          filename = filename + '-' + type
        } else throw new Error()
      }
      try {
        const result = await getPicInfo(filename)

        ctx.response.set('content-type', result[0].mimetype)
        ctx.body = fs.createReadStream(`${PICTURE_PATH}/${filename}`)
      } catch (error) {
        throw new Error()
      }
    } catch (error) {
      const err = new Error()
      ctx.app.emit('error', err, ctx)
    }
  }
}

module.exports = new Moment()
