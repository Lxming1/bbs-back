const connection = require('../utils/database')
class Collect {
  async create(uid, name, status) {
    const statement = `insert into collect (user_id, name, status) value(?,?,?)`
    const [result] = await connection.execute(statement, [uid, name, status])
    return result
  }

  async update(uid, name, status) {
    const statement = `update collect set name = ? , status = ? where user_id = ?`
    const [result] = await connection.execute(statement, [name, status, uid])
    return result
  }

  async getCollectByUID(uid) {
    const statement = `select id, name, status, create_at createTime, update_at updateTime from collect where user_id = ?`
    const [result] = await connection.execute(statement, [uid])
    return result
  }

  async createDetail(collectId, momentId) {
    const statement = `insert into collect_detail (moment_id, collect_id) values(?, ?)`
    const [result] = await connection.execute(statement, [momentId, collectId])
    return result
  }

  async cancel(collectId, momentId) {
    const statement = `delete from collect_detail where moment_id = ? and collect_id = ?`
    const [result] = await connection.execute(statement, [momentId, collectId])
    return result
  }
}

module.exports = new Collect()
