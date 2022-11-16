const { getOffset } = require('../utils/common')
const connection = require('../utils/database')

class User {
  async create({ email, password }) {
    let statement = `insert into users (email, password) values (?, ?)`
    const result = await connection.execute(statement, [email, password])
    return result[0]
  }

  async getUserByEmail(email) {
    const statement = `
      select 
        id, email, password
      from users where email = ?
    `
    const result = await connection.execute(statement, [email])
    return result[0]
  }

  async getUserInfo(id) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement = `
      select 
        u.id, u.email, ud.name, ud.birthday, ud.gender, 
        (select count(*) from care_fans where to_uid = id) fansCount,
        (select count(*) from care_fans where from_uid = id) careCount,
        ud.address_id address, ud.introduction, ud.avatar_url, u.create_at createTime, u.update_at updateTime
      from 
        users u 
      join 
        user_detail ud 
      on 
        u.detail_id = ud.id 
      join 
        address ad 
      on 
        ad.id = ud.address_id
      where 
        u.id = ?
    `
    let result
    try {
      result = (await connection.execute(statement, [id]))[0]
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    const addressId = result[0].address
    if (addressId < 100) {
      statement = `select id, name province from address where id = ?`
    } else {
      statement = `
        select a2.id id, a1.name province, a2.name city from address a1 join address a2 on a2.id = ? and a1.id = a2.pid 
      `
    }
    try {
      const [address] = await connection.execute(statement, [addressId])
      await conn.commit()
      result[0].address = address[0]
      return result[0]
    } catch (e) {
      console.log(e)
      await conn.rollback()
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
    limit ?, ?`
    const [result] = await connection.execute(statement, [
      uid,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }

  async getDetailIdByUser(uid) {
    const statement = `select detail_id detailId from users where id = ?`
    const [result] = await connection.execute(statement, [uid])
    return result[0]
  }

  async createDeatilForUser(uid, addressId, name, birthday, gender, introduction) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement
    let result
    try {
      statement = `insert into user_detail (name, birthday, gender, introduction, address_id) values(?,?,?,?,?)`
      result = await connection.execute(statement, [
        name,
        birthday,
        gender,
        introduction,
        addressId,
      ])
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }

    const detailId = result[0].insertId
    try {
      statement = `update users set detail_id = ? where id = ?`
      result = await connection.execute(statement, [detailId, uid])
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }
    try {
      await conn.commit()
    } catch (e) {
      console.log(e)
      return await conn.rollback()
    }
    return [result]
  }

  async updateDetailInfo(detailId, addressId, name, birthday, gender, introduction) {
    const statement = `
      update 
        user_detail 
      set 
        name = ?, birthday = ?, gender = ?, 
        introduction = ?, address_id = ? 
      where 
        id = ?
    `

    const [result] = await connection.execute(statement, [
      name,
      birthday,
      gender,
      introduction,
      addressId,
      detailId,
    ])
    return result
  }
}

module.exports = new User()
