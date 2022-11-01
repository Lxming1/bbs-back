const { getPlate } = require('../service/plate.service')
const { successBody } = require('../utils/common')

class Plate {
  async list(ctx) {
    const result = await getPlate()
    ctx.body = successBody(result)
  }
}

module.exports = new Plate()
