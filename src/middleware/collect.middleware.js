const { getCollectStatus, collectDetail, getCollectInfo } = require('../service/collect.service')
const { getPraisedList } = require('../service/moment.service')
const { getUserInfo } = require('../service/user.service')
const { isMyNaN, successBody } = require('../utils/common')

const handleCollectDetail = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { collectId } = ctx.params
  const result = await getCollectInfo(collectId)
  const id = ctx?.user?.id
  if (!id || id !== result.uid) {
    if (result.status === 1) return
  }
  let children = await collectDetail(collectId, pagenum, pagesize)
  if (id) {
    const praiseList = (await getPraisedList(id)).map((item) => item.momentId)
    children = children.map((item) => {
      item.isPraise = praiseList.some((praiseId) => praiseId === item.id)
      return item
    })
  }
  const promiseArr = children.map(async (item) => {
    item.author = await getUserInfo(item.author)
    return item
  })
  result.children = await Promise.all(promiseArr)
  ctx.result = result
  await next()
}

module.exports = {
  handleCollectDetail,
}
