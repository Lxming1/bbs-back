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
    (select count(*) from praise p where p.moment_id = m.id) praiseCount,
    m.visible visible, m.user_id author, 
    m.create_at createTime, m.update_at updateTime
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
      ${sqlFragment} where status = 1 GROUP BY m.id ORDER BY updateTime desc LIMIT ?, ?
    `
    try {
      const [result] = await connection.execute(statement, [getOffset(pagenum, pagesize), pagesize])
      return result
    } catch (e) {
      console.log(e)
    }
  }

  async update(momentId, title, content, plateId, visible) {
    const statement = `
      update moment 
      set title = ?, content = ?, plate_id = ?, visible = ?, status = 0 where id = ?
    `
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
          m.user_id uid
        from 
          moment m 
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
      if (!res) return
      if (toUid === uid) return res[0]
      let statement = `
        select *
          from notices 
        where 
          moment_id = ? and from_uid = ? and user_id = ? and type = ?
      `
      result = await connection.execute(statement, [momentId, uid, toUid, 0])
      if (result[0].length) return res[0]
      statement = `
        insert into notices 
          (moment_id, from_uid, user_id, type) 
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

  async getMomentTotal() {
    const statement = `select count(*) count from moment where status = 1`
    const [result] = await connection.execute(statement)
    return result[0]
  }

  async getPraisedList(userId) {
    const statement = `
      select 
        moment_id momentId 
      from 
        praise 
      where user_id = ? and comment_id = 0
    `
    let result = await connection.execute(statement, [userId])
    return result[0]
  }

  async getPraiseCount(momentId) {
    const statement = `
      select count(*) count from praise p join moment m 
      on m.id = p.moment_id and m.status = 1 where p.moment_id = ?
    `
    const [result] = await connection.execute(statement, [momentId])
    return result[0]
  }

  async search(content, pagenum, pagesize) {
    const statement = `
      ${sqlFragment} 
      where title like ? or content like ? and status = 1 
      order by updateTime desc 
      limit ?, ?
    `
    const [result] = await connection.execute(statement, [
      `%${content}%`,
      `%${content}%`,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async getSearchTotal(content) {
    const statement = `
      select count(*) count from moment where title like ? or content like ? and status = 1
    `
    const [result] = await connection.execute(statement, [`%${content}%`, `%${content}%`])
    return result
  }

  async careMoments(uid, pagenum, pagesize) {
    const statement = `
      ${sqlFragment} 
      join care_fans cf 
      on cf.from_uid = ? and cf.to_uid = m.user_id
      where m.visible = 0
      order by updateTime desc 
      limit ?, ?
    `
    const [result] = await connection.execute(statement, [
      uid,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async careMomentsCount(uid) {
    const statement = `
      select count(*) count from moment m
      join care_fans cf 
      on cf.from_uid = ? and cf.to_uid = m.user_id
      where m.visible = 0
    `
    const [result] = await connection.execute(statement, [uid])
    return result
  }
}

module.exports = new Moment()
module.exports.momentSqlFragment = sqlFragment
