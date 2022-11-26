const { getPlate } = require('../service/plate.service')
const { successBody } = require('../utils/common')

class Plate {
  async showPlateList(ctx) {
    try {
      const result = await getPlate()
      ctx.body = successBody(result)
    } catch (e) {
      console.log(e)
    }
  }

  async showMomentByPlage(ctx) {
    ctx.body = successBody({
      total: ctx.total,
      moments: ctx.result,
    })
  }
}

module.exports = new Plate()
