const connection = require('../utils/database')
class FileService {
  async saveFileInfo(filename, mimetype, size, userId) {
    const statement = `
      insert into avatar (filename, mimetype, size, user_id) values(?,?,?,?)
    `
    const [result] = await connection.execute(statement, [filename, mimetype, size, userId])
    return result
  }

  async currentAvatar(userId) {
    const statement = `select * from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async rmAvatar(userId) {
    const statement = `delete from avatar where user_id = ?`
    const [result] = await connection.execute(statement, [userId])
    return result
  }

  async savaAvatar(avatarUrl, id) {
    const statement = `
      update user_detail set avatar_url = ? where user_id = ?
    `
    const [result] = await connection.execute(statement, [avatarUrl, id])
    return result
  }

  async savePicInfo(filename, mimetype, size, momentId, userId) {
    const statement = `
      insert into file 
      (filename, mimetype, size, moment_id, user_id) 
      values (?,?,?,?,?)
    `
    const [result] = await connection.execute(statement, [
      filename,
      mimetype,
      size,
      momentId,
      userId,
    ])
    return result
  }

  async getPicByMoment(momentId, uid) {
    const statement = `select * from file where moment_id = ? and user_id = ?`
    const [result] = await connection.execute(statement, [momentId, uid])
    return result
  }

  async delMomentPic(momentId, uid, filename) {
    const statement = `delete from file where moment_id = ? and user_id = ? and filename = ?`
    const [result] = await connection.execute(statement, [momentId, uid, filename])
    return result
  }
}

module.exports = new FileService()
