const connection = require('../utils/database')

class Notices {
  async read(noticeId) {
    const statement = 'update notices set status = 1 where id = ?'
    const [result] = await connection.execute(statement, [noticeId])
    return result
  }

  async del(noticeId) {
    const statement = 'delete from notices where id = ?'
    const [result] = await connection.execute(statement, [noticeId])
    return result
  }
}

module.exports = new Notices()
