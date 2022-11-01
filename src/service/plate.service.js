const connection = require('../utils/database')
class Plate {
  async getPlate() {
    const statement = `select * from plate`
    let result = await connection.execute(statement)
    return result[0]
  }
}

module.exports = new Plate()
