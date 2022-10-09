const connection = require('../utils/database')

class User {
  async create({ name, email, password }) {
    const statement = `insert into users (name, email, password) values (?, ?, ?)`
    const result = await connection.execute(statement, [name, email, password])
    return result[0]
  }

  async getUserByEmail(email) {
    const statement = `
    select 
      u.id, u.name, u.email, u.password, u.avatar_url, u.createAt, u.updateAt, 
      (select count(*) from care_fans where to_uid = u.id) fansCount,
      (select count(*) from care_fans where from_uid = u.id) careCount,
      IF(ISNULL(u.school_id)=0, JSON_OBJECT(
        'id', s.id,
        'name', s.name,
        'type', s.type,
        'class', s.class,
        'intoTime', s.into_time,
        'leaveTime', s.leave_time
      ), null) school
    from 
      users u 
    join 
      school s 
    on 
      u.school_id = s.id or u.school_id is null 
    where 
      email = ?
    `
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
