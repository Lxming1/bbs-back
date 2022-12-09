const connection = require('../utils/database')
class Comment {
  async create(content, momentId, uid) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result, res
    try {
      statement = `
        insert into comment 
          (content, moment_id, user_id) 
        values (?,?,?)
      `
      res = await connection.execute(statement, [content, momentId, uid])
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
      if (toUid === uid) return res[0]
      const statement = `
        insert into notices 
          (moment_id, from_uid, user_id, content, type) 
        values
          (?, ?, ?, ?, ?)
      `
      res = await connection.execute(statement, [momentId, uid, toUid, content, 1])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async reply(content, momentId, uid, commentId) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result, res
    try {
      statement = `
      insert into comment 
        (content, moment_id, user_id, comment_id) 
      values (?,?,?,?)
    `
      res = await connection.execute(statement, [content, momentId, uid, commentId])
    } catch (e) {
      console.log(e)
      conn.rollback()
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
      if (toUid === uid) return res[0]
      const statement = `
        insert into notices 
          (moment_id, comment_id, from_uid, user_id, content, type) 
        values
          (?, ?, ?, ?, ?, ?)
      `
      res = await connection.execute(statement, [momentId, commentId, uid, toUid, content, 1])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async verify(momentId, commentId) {
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
        c.id id, c.content content, c.comment_id commentId, c.user_id author,
        (select count(*) from praise p where p.comment_id = c.id) praiseCount,
        c.create_at createTime, c.update_at updateTime 
      FROM comment c 
      where c.moment_id = ?
    `
    const [result] = await connection.execute(statement, [momentId])
    return result
  }

  async praise(userId, momentId, commentId) {
    const conn = await connection.getConnection()
    await conn.beginTransaction()
    let statement, result, res
    try {
      statement = `insert into praise (moment_id, user_id, comment_id) values(?, ?, ?)`
      res = await connection.execute(statement, [momentId, userId, commentId])
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
      if (toUid === userId) return res[0]
      let statement = `
        select *
          from notices 
        where 
          moment_id = ? and comment_id = ? and from_uid = ? and user_id = ? and type = ?
      `
      result = await connection.execute(statement, [momentId, commentId, userId, toUid, 0])
      if (result[0].length) return res[0]
      statement = `
        insert into notices 
          (moment_id, comment_id, from_uid, user_id, type) 
        values
          (?, ?, ?, ?, ?)
      `
      res = await connection.execute(statement, [momentId, commentId, userId, toUid, 0])
      await conn.commit()
    } catch (e) {
      console.log(e)
      await conn.rollback()
    }
    return res[0]
  }

  async cancelPraise(userId, momentId, commentId) {
    const statement = `
      delete from 
        praise 
      where 
        moment_id = ? and user_id = ? and comment_id = ?`
    const [result] = await connection.execute(statement, [momentId, userId, commentId])
    return result
  }

  async getCommentCount(momentId) {
    const statement = `select count(*) count from comment where moment_id = ?`
    const [result] = await connection.execute(statement, [momentId])
    return result
  }

  async getPraiseList(userId) {
    const statement = `
     select 
        comment_id commentId 
      from 
        praise 
      where user_id = ?
    `
    const [result] = await connection.execute(statement, [userId])
    return result
  }
}

module.exports = new Comment()
