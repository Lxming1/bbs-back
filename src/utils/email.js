const nodemailer = require('nodemailer')
const { MY_EMAIL, MY_EMAIL_PASS } = require('../app/config.js')
const { EMAIL_ERROR } = require('../constants/error-types.js')

const emailTransport = () => {
  return nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: MY_EMAIL,
      pass: MY_EMAIL_PASS,
    },
  })
}

const send = async (ctx, transporter, email, subject, content) => {
  const receiver = {
    from: MY_EMAIL,
    to: email,
    subject,
    html: content,
  }
  await transporter.sendMail(receiver, (err, info) => {
    if (err) {
      const err = new Error(EMAIL_ERROR)
      return ctx.app.emit('error', err, ctx)
    }
    transporter.close()
    console.log('发送成功:', info.response)
  })
}

module.exports = {
  emailTransport,
  send,
}
