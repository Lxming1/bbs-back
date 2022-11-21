const connection = require('../utils/database')
const { APP_HOST, APP_PORT } = require('../app/config')
const { getOffset } = require('../utils/common')

const sqlFragment = `
  SELECT 
    m.id id, content, title,
    (select 
      JSON_ARRAYAGG(CONCAT('${APP_HOST}:${APP_PORT}/moment/image/', file.filename)) 
      from file where m.id = file.moment_id
    ) images,
    JSON_OBJECT(
      'id', p.id,
      'name', p.name
    ) plate,
    (select count(*) from comment ml where ml.moment_id = m.id) commentCount,
    m.user_id author, 
    m.create_at createTime, m.update_at updataTime
  FROM moment m
  LEFT JOIN plate p ON m.plate_id = p.id 
`

class Moment {
  async create(title, content, userId, plateId, visible) {
    const statement = `
      insert into moment 
        (title, content, user_id, plate_id, visible) 
      values 
        (?, ?, ?, ?, ?)
    `
    const [result] = await connection.execute(statement, [title, content, userId, plateId, visible])
    return result
  }

  async detail(momentId) {
    const statement = `
      ${sqlFragment} WHERE m.id = ? GROUP BY m.id
    `
    let [result] = await connection.execute(statement, [momentId])
    return result
  }

  async list(pagesize, pagenum) {
    const statement = `
      ${sqlFragment} GROUP BY m.id ORDER BY m.id desc LIMIT ?, ?
    `
    try {
      const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
      return result
    } catch (e) {
      console.log(e)
    }
  }

  async update(momentId, title, content, plateId, visible) {
    const statement = `update moment set title = ?, content = ?, plate_id = ?, visible = ? where id = ?`
    const [result] = await connection.execute(statement, [
      title,
      content,
      plateId,
      visible,
      momentId,
    ])
    return result
  }

  async del(momentId) {
    const statement = `delete from moment where id = ?`
    const [result] = await connection.execute(statement, [momentId])
    return result
  }

  async getPicInfo(filename) {
    const statement = `select * from file where filename = ?`
    const [result] = await connection.execute(statement, [filename])
    return result
  }

  async search(content, pagenum, pagesize) {
    const statement = `${sqlFragment} where content like ? limit ?, ?`
    const [result] = await connection.execute(statement, [
      `%${content}%`,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async praise(uid, momentId) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result, res
    try {
      statement = `insert into praise (moment_id, user_id) values(?, ?)`
      res = await connection.execute(statement, [momentId, uid])
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    try {
      statement = `
        select 
          ud.user_id uid
        from 
          user_detail ud 
        join 
          moment m 
        on 
          m.user_id = ud.user_id 
        where 
          m.id = ?
      `
      result = await connection.execute(statement, [momentId])
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    try {
      const { uid: toUid } = result[0][0]
      if (toUid === uid) return res[0]
      const statement = `
        insert into notices 
          (moment_id, from_uid, to_uid, type) 
        values
          (?, ?, ?, ?)
      `
      res = await connection.execute(statement, [momentId, uid, toUid, 0])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async cancelPraise(uid, momentId) {
    const statement = `delete from praise where moment_id = ? and user_id = ?`
    const [result] = await connection.execute(statement, [momentId, uid])
    return result
  }
}

module.exports = new Moment()
