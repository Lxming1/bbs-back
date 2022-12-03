const crypto = require('crypto')

// 加密密码
const md5handle = (password) => {
  const md5 = crypto.createHash('md5')
  const result = md5.update(password).digest('hex')
  return result
}
// 成功且有数据返回格式
const successBody = (data, message) => {
  return {
    code: 0,
    message,
    data,
  }
}
// 成功无数据返回格式
const successMes = (message) => {
  return {
    code: 0,
    message,
  }
}
// 生成6位随机数
const randomFns = () => {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += parseInt(Math.random() * 10)
  }
  return code
}
// 验证邮箱有效性
const verifyEmail = (email) => {
  const regEmail =
    /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/ //验证邮箱正则
  return regEmail.test(email)
}
const verifyPassword = (pass) => {
  const regPass = /^[0-9a-zA-Z_]{6,16}$/
  return regPass.test(pass)
}
const verifyName = (name) => {
  const regName = /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,16}$/
  return regName.test(name)
}

const verifyDate = (time) => {
  const regTime = /\d{4}-\d{2}-\d{2}/
  return regTime.test(time)
}

const getOffset = (pagenum, pagesize) => String((pagenum - 1) * pagesize)

const isMyNaN = (...num) => num.some((item) => isNaN(item))

module.exports = {
  verifyName,
  verifyPassword,
  md5handle,
  successBody,
  successMes,
  randomFns,
  verifyEmail,
  getOffset,
  isMyNaN,
  verifyDate,
}
