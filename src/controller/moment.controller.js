const {
  create,
  del,
  update,
  praise,
  cancelPraise,
  getPicInfo,
  detail,
} = require('../service/moment.service')
const { successBody } = require('../utils/common')
const { PICTURE_PATH } = require('../constants/file-types')
const fs = require('fs')
const { getPraisedList } = require('../service/moment.service')
const { getUserInfo } = require('../service/user.service')

class Moment {
  async create(ctx) {
    const { id } = ctx.user
    const { title, content, plateId, visible } = ctx.request.body
    const result = await create(title, content, id, plateId, visible)
    let moment = (await detail(result.insertId))[0]
    if (moment.visible === 1) {
      moment.author = {
        id: moment.author.id,
        avatar_url: `${APP_HOST}:${APP_PORT}/users/0/avatar`,
        name: '匿名用户',
      }
    } else {
      moment.author = await getUserInfo(moment.author)
    }

    ctx.body = successBody(moment, '发表动态成功')
  }

  async search(ctx) {
    const result = ctx.result
    ctx.body = successBody(result)
  }

  // 查询一条动态
  async detail(ctx) {
    ctx.body = successBody(ctx.result)
  }

  // 查询多条动态
  async list(ctx) {
    const result = ctx.result
    const total = ctx.total
    ctx.body = successBody({
      total,
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
    await del(momentId)
    ctx.body = successBody(momentId, '删除成功')
  }

  async showPicture(ctx) {
    let { filename } = ctx.params
    const { type } = ctx.query
    const types = ['large', 'middle', 'small']
    let realFileName = ''
    if (type) {
      if (types.some((item) => item === type)) {
        realFileName = filename + '-' + type
      } else return
    } else {
      realFileName = filename
    }
    try {
      const result = await getPicInfo(filename)
      ctx.response.set('content-type', result[0].mimetype)
      ctx.body = fs.createReadStream(`${PICTURE_PATH}/${realFileName}`)
    } catch (error) {
      console.log(e)
    }
  }

  async praiseMoment(ctx) {
    const { momentId } = ctx.params
    const { id } = ctx.user
    if (isNaN(momentId)) return
    await praise(id, momentId)
    const moment = (await detail(momentId))[0]
    const praiseCount = moment.praiseCount
    ctx.body = successBody({
      praiseCount,
      momentId,
    })
  }

  async cancelPraiseMoment(ctx) {
    const { momentId } = ctx.params
    const { id } = ctx.user
    if (isNaN(momentId)) return
    await cancelPraise(id, momentId)
    const moment = (await detail(momentId))[0]
    const praiseCount = moment.praiseCount
    ctx.body = successBody({
      praiseCount,
      momentId,
    })
  }

  async praiseList(ctx) {
    const { id } = ctx.user
    const praiseList = (await getPraisedList(id)).map((item) => item.momentId)
    ctx.body = successBody(praiseList)
  }
}

module.exports = new Moment()
