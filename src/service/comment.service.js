const { getOffset } = require('../utils/common')
const connection = require('../utils/database')
class Comment {
  /**
   * @Author: Lxming
   * @Date: 2022-11-21 00:11:16
   * @Description: 回复评论、收藏的notice
   */
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
          ud.user_id uid
        from 
          user_detail ud 
        join 
          moment m 
        on 
          m.user_id = ud.user_id 
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
          (moment_id, from_uid, to_uid, type) 
        values
          (?, ?, ?, ?)
      `
      res = await connection.execute(statement, [momentId, uid, toUid, 1])
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
          ud.user_id uid
        from 
          user_detail ud 
        join 
          moment m 
        on 
          m.user_id = ud.user_id 
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
          (moment_id, comment_id, from_uid, to_uid, type) 
        values
          (?, ?, ?, ?, ?)
      `
      res = await connection.execute(statement, [momentId, commentId, uid, toUid, 1])
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

  async list(momentId, pagenum, pagesize) {
    const statement = `
      SELECT 
        c.id id, c.content content, c.comment_id commentId, c.user_id author,
        c.create_at createTime, c.update_at updateTime 
      FROM comment c 
      where c.moment_id = ?
      limit ?, ?
    `
    const [result] = await connection.execute(statement, [
      momentId,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
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
          ud.user_id uid
        from 
          user_detail ud 
        join 
          moment m 
        on 
          m.user_id = ud.user_id 
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
      const statement = `
        insert into notices 
          (moment_id, comment_id, from_uid, to_uid, type) 
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
}

module.exports = new Comment()
