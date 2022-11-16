const { FORMAT_ERROR } = require('../constants/error-types')
const { getMomentListByPlate } = require('../service/plate.service')
const { isMyNaN } = require('../utils/common')

const getMomentByPlateId = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  const { plateId } = ctx.params
  console.log(plateId)
  try {
    const result = await getMomentListByPlate(plateId, pagenum, pagesize)
    ctx.result = result
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getMomentByPlateId,
}
