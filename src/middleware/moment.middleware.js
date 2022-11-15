const fs = require('fs')
const { getUserInfo } = require('../service/user.service')
const { FORMAT_ERROR, PICTURE_PATH } = require('../constants/error-types')
const { list, detail, getPicInfo, search } = require('../service/moment.service')

const getMultiMoment = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isNaN(parseInt(pagenum)) || isNaN(parseInt(pagesize))) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  try {
    let result = await list(pagesize, pagenum)
    if (!result) {
      ctx.result = []
    } else {
      const promissArr = result.map(async (item) => {
        item.author = await getUserInfo(item.author)
        console.log(item.author)
        return item
      })
      ctx.result = await Promise.all(promissArr)
    }
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

const handlePicture = async (ctx, next) => {
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
      ctx.result = fs.createReadStream(`${PICTURE_PATH}/${filename}`)
      await next()
    } catch (error) {
      throw new Error()
    }
  } catch (error) {
    const err = new Error()
    ctx.app.emit('error', err, ctx)
  }
}

const searchMoment = async (ctx, next) => {
  const { content, pagenum, pagesize } = ctx.query
  if (content === undefined) return
  if (isNaN(parseInt(pagenum)) || isNaN(parseInt(pagesize))) return
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
  handlePicture,
  searchMoment,
}
