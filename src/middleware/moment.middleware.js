const { getUserInfo } = require('../service/user.service')
const { FORMAT_ERROR } = require('../constants/error-types')
const { list, detail, search, getMomentTotal, getAllMoment } = require('../service/moment.service')
const { isMyNaN } = require('../utils/common')
const { getMomentListByPlate, getMomentByPlateCount } = require('../service/plate.service')

const getMultiMoment = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { plateId } = ctx.params
  try {
    let result, total
    if (plateId == 0 || plateId === undefined) {
      result = await list(pagesize, pagenum)
      total = (await getMomentTotal()).count
    } else {
      result = await getMomentListByPlate(plateId, pagenum, pagesize)
      total = (await getMomentByPlateCount(plateId)).count
    }
    if (!result) {
      ctx.result = []
      ctx.total = 0
    } else {
      const promissArr = result.map(async (item) => {
        item.author = await getUserInfo(item.author)
        return item
      })
      ctx.result = await Promise.all(promissArr)
    }
    ctx.total = total
    await next()
  } catch (err) {
    console.log(err)
  }
}

const getSingleMoment = async (ctx, next) => {
  const { momentId } = ctx.params
  try {
    const result = (await detail(momentId))[0]
    if (!result) {
      ctx.result = null
    } else {
      result.author = await getUserInfo(result.author)
      ctx.result = result
    }
    await next()
  } catch (err) {
    console.log(err)
  }
}

const searchMoment = async (ctx, next) => {
  const { content, pagenum, pagesize } = ctx.query
  if (content === undefined) return
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  try {
    const result = await search(content, pagenum, pagesize)
    result.forEach(async (item) => {
      item.author = await getUserInfo(item.author)
    })
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getMultiMoment,
  getSingleMoment,
  searchMoment,
}
