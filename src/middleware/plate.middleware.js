const { FORMAT_ERROR } = require('../constants/error-types')
const { getMomentListByPlate, getMomentByPlateCount } = require('../service/plate.service')
const { isMyNaN } = require('../utils/common')

const getMomentByPlateId = async (ctx, next) => {
  const { pagenum, pagesize } = ctx.query
  if (isMyNaN(pagenum, pagesize)) return
  if (parseInt(pagenum) < 0 || parseInt(pagesize) < 0) {
    const err = new Error(FORMAT_ERROR)
    return ctx.app.emit('error', err, ctx)
  }

  const { plateId } = ctx.params
  try {
    ctx.result = await getMomentListByPlate(plateId, pagenum, pagesize)
    ctx.total = (await getMomentByPlateCount(plateId)).count
    await next()
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getMomentByPlateId,
}
