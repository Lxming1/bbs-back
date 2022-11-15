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
    const result = ctx.result
    ctx.body = successBody({
      total: result.length,
      momentList: result,
    })
  }
}

module.exports = new Plate()
