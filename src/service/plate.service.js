const connection = require('../utils/database')
const { getOffset } = require('../utils/common')
const { momentSqlFragment } = require('./moment.service')

class Plate {
  async getPlate() {
    const statement = `select * from plate`
    let result = await connection.execute(statement)
    return result[0]
  }

  async getMomentListByPlate(plateId, pagenum, pagesize) {
    const statement = `
      ${momentSqlFragment} where m.plate_id = ? and status = 1 order by updateTime desc limit ?, ?
    `
    let result = await connection.execute(statement, [
      plateId,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result[0]
  }

  async getMomentByPlateCount(plateId) {
    const statement = `select count(*) count from moment where plate_id = ? and status = 1`
    let [result] = await connection.execute(statement, [plateId])
    return result
  }
}

module.exports = new Plate()
