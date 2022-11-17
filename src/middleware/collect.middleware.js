const { getCollectStatus, collectDetail } = require('../service/collect.service')
const { getUserInfo } = require('../service/user.service')
const { isMyNaN, successBody } = require('../utils/common')

const verifyCollectStatus = async (ctx, next) => {
  const { collectId } = ctx.params
  try {
    const { status } = await getCollectStatus(collectId)
    if (status === 1) return
  } catch (e) {
    console.log(e)
  }
  await next()
}

const handleCollectDetail = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { collectId } = ctx.params
  const result = await collectDetail(collectId, pagenum, pagesize)
  const promiseArr = result.map(async (item) => {
    item.author = await getUserInfo(item.author)
    return item
  })
  await Promise.all(promiseArr)
  ctx.result = result
  await next()
}

module.exports = {
  verifyCollectStatus,
  handleCollectDetail,
}
