const { APP_HOST, APP_PORT } = require('../app/config')
const { getOffset } = require('../utils/common')
const connection = require('../utils/database')
const { momentSqlFragment } = require('./moment.service')

class User {
  async create({ email, password }) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result
    try {
      statement = `insert into users (email, password) values (?, ?)`
      result = await connection.execute(statement, [email, password])
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }
    const userId = result[0].insertId
    try {
      statement = `insert into user_detail (name, user_id, avatar_url) values(?, ?, ?)`
      result = await connection.execute(statement, [
        `用户${userId}`,
        userId,
        `${APP_HOST}:${APP_PORT}/users/0/avatar`,
      ])
      await conn.commit()
      return userId
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
  }

  async getUserByEmail(email) {
    const statement = `
      select 
        id, email, password
      from 
        users 
      where 
        email = ? and status = 0
    `
    const result = await connection.execute(statement, [email])
    return result[0]
  }

  async getUserInfo(id) {
    const statement = `
      select 
        u.id, u.email, ud.name, ud.birthday, ud.gender,
        if(ud.address_id=null, null, (
          select JSON_OBJECT(
            'children', JSON_OBJECT('id', a1.id, 'name', a1.name),
            'parent', JSON_OBJECT('id', a2.id, 'name', a2.name)
          ) from address a1 left join address a2 on a1.pid = a2.id where a1.id = ud.address_id)
        ) address,
        (select count(*) from moment where user_id = u.id) momentCount,
        (select count(*) from care_fans where to_uid = u.id) fansCount,
        (select count(*) from care_fans where from_uid = u.id) careCount,
        (select count(*) 
          from praise p 
          join moment m on p.moment_id = m.id and comment_id = 0 
          where m.user_id = u.id
        ) momentLike,
        (select count(*) 
          from praise p 
          join comment c on p.comment_id = c.id
          where c.user_id = u.id
        ) commentLike,
        (select count(*) 
          from collect_detail cd 
          join moment m on cd.moment_id = m.id
          where m.user_id = u.id
        ) collectCount,
        (select count(*) from notices n where n.user_id = u.id) noticeCount, 
        ud.introduction, ud.avatar_url, u.create_at createTime, u.update_at updateTime
      from 
        users u
      join 
        user_detail ud 
      on 
        ud.user_id = u.id
      where u.id = ?
    `
    try {
      const result = (await connection.execute(statement, [id]))[0]
      return result[0]
    } catch (e) {
      console.log(e)
    }
  }

  async getAvatarInfo(userId) {
    const statement = `select * from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async care(fromUid, toUid) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result, res
    try {
      statement = `insert into care_fans (from_uid, to_uid) values(?, ?)`
      res = await connection.execute(statement, [fromUid, toUid])
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    statement = `
      select *
        from notices 
      where 
        from_uid = ? and user_id = ? and type = ?
    `
    result = await connection.execute(statement, [fromUid, toUid, 2])
    if (result[0].length) return res[0]
    try {
      statement = `
        insert into notices 
          (from_uid, user_id, type) 
        values
          (?, ?, ?)
      `
      result = await connection.execute(statement, [fromUid, toUid, 2])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async cancelCare(fromUid, toUid) {
    const statement = `delete from care_fans where from_uid = ? and to_uid = ?`
    const [result] = await connection.execute(statement, [fromUid, toUid])
    return result
  }

  async getCareFansList(uid, pagenum, pagesize, isFans = true) {
    const statement = isFans
      ? `
      select 
        u.id from care_fans cf 
      join 
        users u 
      on 
        cf.to_uid = ? and cf.from_uid = u.id
      limit ?, ?
    `
      : `
      select 
        u.id from care_fans cf 
      join 
        users u 
      on 
        cf.from_uid = ? and cf.to_uid = u.id
      limit ?, ?
    `
    const [result] = await connection.execute(statement, [
      uid,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async updateDetailInfo(userId, addressId, name, birthday, gender, introduction) {
    const statement = `
      update 
        user_detail 
      set 
        name = ?, birthday = ?, gender = ?, 
        introduction = ?, address_id = ? 
      where 
        user_id = ?
    `
    const [result] = await connection.execute(statement, [
      name,
      birthday !== null ? birthday + ' 08:00:00' : null,
      gender,
      introduction,
      addressId,
      userId,
    ])
    return result
  }

  async changePassword(email, password) {
    const statement = `update users set password = ? where email = ?`
    const [result] = await connection.execute(statement, [password, email])
    return result
  }

  async getMomentsByUser(userId, pagenum, pagesize) {
    const sqlFragment = momentSqlFragment
    const statement = `${sqlFragment} where m.user_id = ? order by updateTime desc limit ?, ?`
    const [result] = await connection.execute(statement, [
      userId,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async getAddress() {
    const statement = `select * from address`
    const [result] = await connection.execute(statement)
    return result
  }

  async getRelation(myId, otherId) {
    const result = {}
    let statement = `select * from care_fans where from_uid = ? and to_uid = ?`
    const [care] = await connection.execute(statement, [myId, otherId])
    const [fan] = await connection.execute(statement, [otherId, myId])
    result.care = !!care[0]?.id
    result.fan = !!fan[0]?.id
    return result
  }
}

module.exports = new User()
