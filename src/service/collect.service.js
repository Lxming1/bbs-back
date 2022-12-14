const connection = require('../utils/database')
const { APP_HOST, APP_PORT } = require('../app/config')
const { momentSqlFragment } = require('./moment.service')

const sqlFragment = (sql) => {
  const fragment = `
    select 
      id, name, user_id uid,
      (
        select count(*) 
        from collect_detail cd 
        join moment m 
        on m.id = cd.moment_id and m.status = 1
        where cd.collect_id = c.id
      ) count,
      status, create_at createTime, update_at updateTime 
  `
  return fragment + sql
}

class Collect {
  async create(uid, name, status) {
    const statement = `insert into collect (user_id, name, status) value(?,?,?)`
    const [result] = await connection.execute(statement, [uid, name, status])
    return result
  }

  async update(collectId, name, status) {
    const statement = `update collect set name = ?, status = ? where id = ?`
    const [result] = await connection.execute(statement, [name, status, collectId])
    return result
  }

  async getCollectByUID(uid) {
    const statement = sqlFragment('from collect c where user_id = ? order by updateTime desc')
    const [result] = await connection.execute(statement, [uid])
    return result
  }

  async getCollectInfo(collectId) {
    const statement = sqlFragment(`from collect c where id = ?`)
    const [result] = await connection.execute(statement, [collectId])
    return result[0]
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

  async collectDetail(collectId) {
    const statement = `
      ${momentSqlFragment} 
      JOIN collect_detail cd 
      ON cd.moment_id = m.id
      WHERE cd.collect_id = ? and m.status = 1
    `
    const [result] = await connection.execute(statement, [collectId])
    return result
  }

  async getCollectStatus(collectId) {
    const statement = `select status from collect where id = ?`
    const [result] = await connection.execute(statement, [collectId])
    return result[0]
  }

  async findMomentInCollect(momentId, userId) {
    const statement = `
      select c.id
      from collect c 
      join collect_detail cd 
      on cd.collect_id = c.id
      where cd.moment_id = ? and c.user_id = ?
    `
    const [result] = await connection.execute(statement, [momentId, userId])
    return result
  }

  async delCollection(collectId) {
    const statement = 'delete from collect where id = ?'
    const [result] = await connection.execute(statement, [collectId])
    return result
  }
}

module.exports = new Collect()
