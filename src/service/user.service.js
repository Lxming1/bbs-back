const connection = require('../utils/database')

class User {
  async create({ email, password }) {
    let statement = `insert into users (email, password) values (?, ?)`
    const result = await connection.execute(statement, [email, password])
    return result[0]
  }

  async getDetailInfo(detailId) {
    const statement = `select * from detail where id = ?`
    const result = await connection.execute(statement, [detailId])
    return result[0]
  }

  async getAddressInfo(addressId) {
    const statement = `select * from address where id = ?`
    const result = await connection.execute(statement, [addressId])
    return result[0]
  }

  async getUserByEmail(email) {
    const statement = `
      select 
        id, email, password, create_at, update_at, 
        (select count(*) from care_fans where to_uid = id) fansCount,
        (select count(*) from care_fans where from_uid = id) careCount
      from users where email = ?
    `
    const result = await connection.execute(statement, [email])
    return result[0]
  }

  async getAvatarInfo(userId) {
    const statement = `select * from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  // async getUserAvatar(userId) {
  //   const statement = `select avatar_url from users join detail where id = ?`
  //   const [result] = await connection.execute(statement, [userId])
  //   return result[0]
  // }

  async care(fromUid, toUid) {
    const statement = `insert into care_fans values(?, ?)`
    const [result] = await connection.execute(statement, [fromUid, toUid])
    return result[0]
  }

  async cancelCare(fromUid, toUid) {
    const statement = `delete from care_fans where from_uid = ? and to_uid = ?`
    const [result] = await connection.execute(statement, [fromUid, toUid])
    return result[0]
  }
}

module.exports = new User()
