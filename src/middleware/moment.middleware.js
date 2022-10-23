const { FORMAT_ERROR } = require('../constants/error-types')
const { list, detail } = require('../service/moment.service')
const { getDetailInfo, getAddressInfo } = require('../service/user.service')

const setMultiUserInfo = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  try {
    let result = await list(pagesize, pagenum)
    if (!result) {
      ctx.result = []
    } else {
      ctx.result = result.map(async (item) => {
        const author = await resetDetail(item)
        item.author = author
        return item
      })
    }
    await next()
  } catch (err) {
    console.log(err)
  }
}

const setSingleUserInfo = async (ctx, next) => {
  const { momentId } = ctx.params
  try {
    const result = (await detail(momentId))[0]
    if (!result) {
      ctx.result = null
    } else {
      const author = await resetDetail(result)
      result.author = author
      ctx.result = result
    }
    await next()
  } catch (err) {
    console.log(err)
  }

  await next()
}

async function resetDetail(result) {
  const user = result.author
  const userInfo = await getDetailInfo(user.detailId)
  if (userInfo.address_id) {
    const address = await getAddressInfo(userInfo.address_id)
    userInfo.address = address
  }
  delete result.author.detailId
  return { ...result.author, ...userInfo }
}

module.exports = {
  // verifyQuery,
  setMultiUserInfo,
  setSingleUserInfo,
}
