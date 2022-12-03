const errorTypes = require('../constants/error-types')
const redis = require('../utils/redis')
const { getUserByEmail, getCareFansList, updateDetailInfo } = require('../service/user.service')
const {
  md5handle,
  verifyEmail,
  randomFns,
  isMyNaN,
  verifyName,
  verifyPassword,
  verifyDate,
} = require('../utils/common')
const { getUserInfo } = require('../service/user.service')
const { emailTransport, send } = require('../utils/email')

// 验证邮箱密码
const verifyPass = async (ctx, next) => {
  // 抽取数据
  const { password } = ctx.request.body
  // 判断邮箱密码是否为空
  if (!password) return
  if (!verifyPassword(password)) {
    const err = new Error(errorTypes.FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

// 加密密码
const handlePassword = async (ctx, next) => {
  const { password } = ctx.request.body
  ctx.request.body.password = md5handle(String(password))
  await next()
}

const verifyUEmail = async (ctx, next) => {
  const { email } = ctx.request.body
  if (!email) return
  // 验证邮箱有效性
  if (!verifyEmail(email)) {
    const err = new Error(errorTypes.FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  // 判断邮箱是否已存在
  const result = await getUserByEmail(email)
  if (result.length !== 0) {
    const err = new Error(errorTypes.EMAIL_ALREADY_EXIST)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

const verifyUEmailFind = async (ctx, next) => {
  const { email } = ctx.request.body
  if (!email) return
  // 验证邮箱有效性
  if (!verifyEmail(email)) {
    const err = new Error(errorTypes.FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

const findPassSendEmail = async (ctx, next) => {
  const { email } = ctx.request.body
  if (!email) return
  const result = await redis.get(`${email}find`)
  if (result) {
    const err = new Error(errorTypes.EXIST_CODE)
    return ctx.app.emit('error', err, ctx)
  }
  const code = randomFns()
  const transporter = emailTransport()
  await redis.set(`${email}find`, code, 'EX', 60)
  await send(
    ctx,
    transporter,
    email,
    '验证你的电子邮件',
    `
      <p>你好！</p>
      <p>您正在找回密码</p>
      <p>你的验证码是：<strong style="color: #ff4e2a;">${code}</strong></p>
      <p>***该验证码1分钟内有效***</p>
    `
  )
  await next()
}

const sendEmail = async (ctx, next) => {
  const { email } = ctx.request.body
  if (!email) return
  const result = await redis.get(email)
  if (result) {
    const err = new Error(errorTypes.EXIST_CODE)
    return ctx.app.emit('error', err, ctx)
  }
  const code = randomFns()
  const transporter = emailTransport()
  await redis.set(email, code, 'EX', 60)
  await send(
    ctx,
    transporter,
    email,
    '验证你的电子邮件',
    `
      <p>你好！</p>
      <p>您正在注册BBS账号</p>
      <p>你的验证码是：<strong style="color: #ff4e2a;">${code}</strong></p>
      <p>***该验证码1分钟内有效***</p>
    `
  )
  await next()
}

const verifyCode = async (ctx, next) => {
  const { email, code } = ctx.request.body
  const rightCode = await redis.get(email)
  if (rightCode !== code) {
    const err = new Error(errorTypes.CODE_IS_INCORRECT)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

const verifyFindPassCode = async (ctx, next) => {
  const { email, code } = ctx.request.body
  const rightCode = await redis.get(`${email}find`)
  if (parseInt(rightCode) !== parseInt(code)) {
    const err = new Error(errorTypes.CODE_IS_INCORRECT)
    return ctx.app.emit('error', err, ctx)
  }
  await next()
}

const setCareFansList = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const { userId, type } = ctx.params
  if (!['care', 'fans'].includes || !userId) return
  const isFans = type === 'fans'
  const fansIdList = await getCareFansList(userId, pagenum, pagesize, isFans)
  const promiseArr = fansIdList.map(async (item) => await getUserInfo(item.id))
  ctx.result = await Promise.all(promiseArr)
  await next()
}

const handleUserInfo = async (ctx, next) => {
  const { id: userId } = ctx.user
  const { address, name, birthday, gender, introduction } = ctx.request.body
  console.log(userId, address, name, birthday, gender, introduction)
  if (!verifyName(name) || !verifyDate(birthday)) {
    const err = new Error(errorTypes.FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }
  const result = await updateDetailInfo(userId, address, name, birthday, gender, introduction)
  ctx.result = result
  await next()
}

module.exports = {
  verifyPass,
  verifyUEmail,
  verifyUEmailFind,
  handlePassword,
  findPassSendEmail,
  sendEmail,
  verifyCode,
  verifyFindPassCode,
  setCareFansList,
  handleUserInfo,
}
