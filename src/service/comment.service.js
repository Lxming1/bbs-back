const connection = require('../utils/database')
class Comment {
  async create(content, momentId, fromUid, toUid) {
    const statement = `
      insert into comment 
        (content, moment_id, from_uid, to_uids) 
      values (?,?,?)
    `
    const [result] = await connection.execute(statement, [content, momentId, fromUid, toUid])
    return result
  }

  async reply(content, momentId, fromUid, toUid, commentId) {
    const statement = `
      insert into comment 
        (content, moment_id, user_id, comment_id) 
      values (?,?,?,?)
    `
    const [result] = await connection.execute(statement, [
      content,
      momentId,
      fromUid,
      toUid,
      commentId,
    ])
    return result
  }

  async verifyReply(momentId, commentId) {
    // 传入的动态存在对应的评论
    const statement = `
      select * from comment where moment_id = ? and id = ?
    `
    const [result] = await connection.execute(statement, [momentId, commentId])
    return result
  }

  async del(commentId) {
    const statement = `delete from comment where id = ?`
    const [result] = await connection.execute(statement, [commentId])
    return result
  }

  async list(momentId) {
    const statement = `
      SELECT 
        c.id id, c.content content, c.comment_id commentId,
        JSON_OBJECT('id', u.id, 'name', u.name, 'avatarUrl', u.avatar_url) author,
        JSON_OBJECT('id', u1.id, 'name', u1.name, 'avatarUrl', u1.avatar_url) object,
        c.create_at createTime, c.update_at updateTime 
      FROM comment c 
      LEFT JOIN users u
      ON c.from_uid = u.id
      LEFT JOIN users u1
      ON c.to_uid = u1.id
      where c.moment_id = ?
    `
    const [result] = await connection.execute(statement, [momentId])
    return result
  }
}

module.exports = new Comment()
