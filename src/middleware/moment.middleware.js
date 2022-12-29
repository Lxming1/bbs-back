const { getUserInfo, getRelation } = require('../service/user.service')
const { FORMAT_ERROR } = require('../constants/error-types')
const {
  list,
  detail,
  search,
  getMomentTotal,
  getPraisedList,
  getSearchTotal,
  careMoments,
  careMomentsCount,
} = require('../service/moment.service')
const { isMyNaN } = require('../utils/common')
const { getMomentListByPlate, getMomentByPlateCount } = require('../service/plate.service')
const { APP_HOST, APP_PORT } = require('../app/config')

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
      total = (await getMomentByPlateCount(plateId))[0].count
    }
    if (!result) {
      ctx.result = []
      ctx.total = 0
    } else {
      result = await Promise.all(
        result.map(async (item) => {
          if (item.visible === 1) {
            item.author = {
              id: item.author,
              avatar_url: `${APP_HOST}:${APP_PORT}/users/0/avatar`,
              name: '匿名用户',
            }
          } else {
            item.author = await getUserInfo(item.author)
          }
          return item
        })
      )
      const userId = ctx?.user?.id
      if (userId) {
        const praiseList = (await getPraisedList(userId)).map((item) => item.momentId)
        result = result.map((item) => {
          item.isPraise = praiseList.some((praiseId) => praiseId === item.id)
          return item
        })
      }
      ctx.result = result
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
      if (result.visible === 1) {
        result.author = {
          id: result.author,
          avatar_url: `${APP_HOST}:${APP_PORT}/users/0/avatar`,
          name: '匿名用户',
        }
      } else {
        result.author = await getUserInfo(result.author)
      }
      const userId = ctx?.user?.id
      if (userId) {
        const praiseList = (await getPraisedList(userId)).map((item) => item.momentId)
        result.isPraise = praiseList.some((praiseId) => praiseId === result.id)
        const relation = await getRelation(userId, result.author.id)
        result.author.relation = relation
      }
      ctx.result = result
    }
    await next()
  } catch (err) {
    console.log(err)
  }
}

const getProfileMoment = async (ctx, next) => {
  const { momentId } = ctx.params
  try {
    const result = (await detail(momentId))[0]
    if (!result) {
      ctx.result = null
    } else {
      ctx.result = result
    }
    await next()
  } catch (err) {
    console.log(err)
  }
}

const searchMoment = async (ctx, next) => {
  const { pagenum, pagesize, content } = ctx.query
  if (content === undefined) return
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  try {
    let result = await search(content, pagenum, pagesize)
    const total = (await getSearchTotal(content))[0].count
    result = result.map((item) => {
      if (item.visible === 1) {
        item.author = {
          id: item.author,
          avatar_url: `${APP_HOST}:${APP_PORT}/users/0/avatar`,
          name: '匿名用户',
        }
      }
      return item
    })
    result = await Promise.all(
      result.map(async (item) => {
        if (item.visible === 0) {
          item.author = await getUserInfo(item.author)
        }
        return item
      })
    )
    const userId = ctx?.user?.id
    if (userId) {
      const praiseList = (await getPraisedList(userId)).map((item) => item.momentId)
      result = result.map((item) => {
        item.isPraise = praiseList.some((praiseId) => praiseId === item.id)
        return item
      })
    }
    ctx.result = result
    ctx.total = total
    await next()
  } catch (e) {
    console.log(e)
  }
}

const getCareMoments = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const userId = ctx.user.id
  try {
    let result = await careMoments(userId, pagenum, pagesize)
    const total = (await careMomentsCount(userId))[0].count
    result = await Promise.all(
      result.map(async (item) => {
        item.author = await getUserInfo(item.author)
        return item
      })
    )
    const praiseList = (await getPraisedList(userId)).map((item) => item.momentId)
    result = result.map((item) => {
      item.isPraise = praiseList.some((praiseId) => praiseId === item.id)
      return item
    })
    ctx.result = result
    ctx.total = total
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getMultiMoment,
  getSingleMoment,
  searchMoment,
  getProfileMoment,
  getCareMoments,
}
