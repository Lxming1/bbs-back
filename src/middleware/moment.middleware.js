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
      const promissArr = result.map(async (item) => {
        item.author = await resetDetail(item)
        return item
      })
      ctx.result = await Promise.all(promissArr)
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
      result.author = await resetDetail(result)
      ctx.result = result
    }
    await next()
  } catch (err) {
    console.log(err)
  }
}

async function resetDetail(result) {
  const user = result.author
  const userInfo = (await getDetailInfo(user.detailId))[0]
  if (userInfo.address_id) {
    const address = await getAddressInfo(userInfo.address_id)
    const { id, country, province, city } = address[0]
    userInfo.address = { id, country, province, city }
  } else {
    userInfo.address = undefined
  }
  const { id, email, createTime, updateTime } = result.author
  const { name, age, gender, address, introduction, avatar_url } = userInfo

  return {
    id,
    name,
    age,
    gender,
    email,
    address,
    introduction,
    avatarUrl: avatar_url,
    createTime,
    updateTime,
  }
}

module.exports = {
  // verifyQuery,
  setMultiUserInfo,
  setSingleUserInfo,
}
