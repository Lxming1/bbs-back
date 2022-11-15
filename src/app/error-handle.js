const {
  EMAIL_ALREADY_EXIST,
  EMAIL_DOSE_NOT_EXIST,
  PASSORD_ERROR,
  UNAUTHORIZATION,
  UNPERMISSION,
  EXIST_CODE,
  EMAIL_ERROR,
  CODE_IS_INCORRECT,
  MISSING_PARAMETER,
  FORMAT_ERROR,
  EXIST_COLLECT,
} = require('../constants/error-types')

const errorHandle = (err, ctx) => {
  let status, errMessage, code

  switch (err.message) {
    case EXIST_COLLECT:
      status = 409
      code = 2
    case MISSING_PARAMETER:
      status = 400 //Bad request
      code = 1
      break
    case CODE_IS_INCORRECT:
      status = 409
      code = 1
      break
    case EXIST_CODE:
      status = 409
      code = 2
      break
    case EMAIL_ERROR:
      status = 500
      code = 1
      break
    case EMAIL_ALREADY_EXIST:
      status = 409 //conflict
      code = 2
      break
    case EMAIL_DOSE_NOT_EXIST:
      status = 400 //Bad request
      code = 2
      break
    case FORMAT_ERROR:
      status = 400
      code = 2
      break
    case PASSORD_ERROR:
      status = 401
      code = 1
      break
    case UNAUTHORIZATION:
      status = 403
      code = 2
      break
    case UNPERMISSION:
      status = 401
      code = 2
      break
    default:
      status = 500
      code = 2
  }
  errMessage = err.message || 'Not Found'
  ctx.status = status
  ctx.body = {
    code,
    message: errMessage,
  }
}

module.exports = errorHandle
