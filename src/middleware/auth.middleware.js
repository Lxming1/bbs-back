const jwt = require('jsonwebtoken')
const { PUBLIC_KEY } = require('../app/config')

const errorTypes = require('../constants/error-types')
const { checkResource } = require('../service/auth.service')
const {
  getUserByEmail,
  getAddressInfo,
  getDetailInfo,
  getUserAvatar,
} = require('../service/user.service')
const { md5handle } = require('../utils/common')

const verifyLogin = async (ctx, next) => {
  const user = ctx.request.body

  // 判断邮箱或密码是否为空
  if (!user.email || !user.password) {
    const err = new Error(errorTypes.EMAIL_OR_PASSWORD_IS_REQUIRED)
    return ctx.app.emit('error', err, ctx)
  }

  // 判断用户是否存在
  let result = (await getUserByEmail(user.email))[0]
  if (!result) {
    const err = new Error(errorTypes.EMAIL_DOSE_NOT_EXIST)
    return ctx.app.emit('error', err, ctx)
  }
  //判断密码是否正确
  if (result.password !== md5handle(user.password)) {
    const err = new Error(errorTypes.PASSORD_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  ctx.user = result

  await next()
}

const setDetailInfo = async (ctx, next) => {
  try {
    const { id, email, create_at, update_at } = ctx.user
    const { name, age, gender, introduction, avatar_url } = (await getDetailInfo(1))[0]
    const { country, province, city } = (await getAddressInfo(1))[0]

    const userInfo = {
      id,
      email,
      name,
      age,
      gender,
      introduction,
      avatar_url,
      create_at,
      update_at,
    }

    ctx.user = {
      ...userInfo,
      address: { country, province, city },
    }

    await next()
  } catch (e) {
    console.log(e)
  }
}

const verifyAuth = async (ctx, next) => {
  try {
    const authorization = ctx.headers.authorization
    if (!authorization) throw new Error()
    const token = authorization.replace('Bearer ', '')
    const result = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
    })
    ctx.user = result
  } catch (error) {
    // 捕获token过期
    console.log(error)
    const err = new Error(errorTypes.UNAUTHORIZATION)
    return ctx.app.emit('error', err, ctx)
  }
  try {
    await next()
  } catch (error) {
    // 捕获其他错误
    console.log(error)
    const err = new Error()
    return ctx.app.emit('error', err, ctx)
  }
}

const verifyPermission = async (ctx, next) => {
  const [key] = Object.keys(ctx.params)
  const id = ctx.params[key]
  const tableName = key.replace('Id', '')
  const userId = ctx.user.id

  const result = await checkResource(tableName, id, userId)

  // 不是本人
  if (!result.length) {
    const err = new Error(errorTypes.UNPERMISSION)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

module.exports = {
  verifyLogin,
  setDetailInfo,
  verifyAuth,
  verifyPermission,
}
