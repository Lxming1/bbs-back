const connection = require('../utils/database')

class User {
  async create({ email, password }) {
    const statement = `insert into users (email, password) values (?, ?)`
    const result = await connection.execute(statement, [email, password])
    return result[0]
  }

  async getUserByEmail(email) {
    const statement = `select * from users where email = ?`
    const result = await connection.execute(statement, [email])
    return result[0]
  }

  async getAvatarInfo(userId) {
    const statement = `select * from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async getUserAvatar(userId) {
    const statement = `select avatar_url from users where id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result[0]
  }

  async getSchool(id) {
    const statement = `select * from school where id = ?`
    const [result] = await connection.execute(statement, [id])
    return result[0]
  }

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
