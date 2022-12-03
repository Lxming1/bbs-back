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
        if(ud.address_id=null, null, (select JSON_OBJECT(
          'children', JSON_OBJECT('id', a1.id, 'name', a1.name),
          'parent', JSON_OBJECT('id', a2.id, 'name', a2.name)
        ) from address a1 left join address a2 on a1.pid = a2.id where a1.id = ud.address_id)) address,
        (select count(*) from moment where user_id = id) momentCount,
        (select count(*) from care_fans where to_uid = id) fansCount,
        (select count(*) from care_fans where from_uid = id) careCount,
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
    const statement = `insert into care_fans (from_uid, to_uid) values(?, ?)`
    const [result] = await connection.execute(statement, [fromUid, toUid])
    return result
  }

  async cancelCare(fromUid, toUid) {
    const statement = `delete from care_fans where from_uid = ? and to_uid = ?`
    const [result] = await connection.execute(statement, [fromUid, toUid])
    return result
  }

  async getCareFansList(uid, pagenum, pagesize, isFans = true) {
    const statement = `
      select 
        u.id from care_fans cf 
      join 
        users u 
      on 
        cf.${isFans ? 'to' : 'from'}_uid = ? 
      where 
        cf.${!isFans ? 'to' : 'from'}_uid = u.id 
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
      birthday + ' 08:00:00',
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
    const statement = `${sqlFragment} where m.user_id = ? limit ?, ?`
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
}

module.exports = new User()
