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

module.exports = {
  md5handle,
  successBody,
  successMes,
  randomFns,
  verifyEmail,
}
