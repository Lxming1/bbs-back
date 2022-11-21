const { getOffset } = require('../utils/common')
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

  async getNotices(uid, type, pagenum, pagesize) {
    const statement = `
      select 
        n.id, n.moment_id moment, 
        (
          select JSON_OBJECT(
            "id", m.id,
            "title", m.title,
            "content", m.content,
            "plateId", m.plate_id,
            "createTime", m.create_at,
            "updateTime", m.update_at
          ) from moment m 
          where m.id = n.moment_id
        ) moment,
        if(
          comment_id=null, null, (
            select JSON_OBJECT(
              "id", id, 
              "content", content, 
              "createTime", create_at,
              "updateTime", update_at
            ) from comment where id = n.comment_id
          )
        ) comment, 
        (
          select JSON_OBJECT(
            "id", u.id, 
            "name", ud.name, 
            "avatarUrl", ud.avatar_url
          ) from users u 
          join user_detail ud 
          on u.id = ud.user_id and u.id = n.from_uid
        ) author, 
        n.status, n.update_at updateTime, n.create_at createTime 
      from 
        notices n
      where 
        to_uid = ? and type = ?
      order by id desc
      limit ?, ?
    `
    const [result] = await connection.execute(statement, [
      uid,
      type,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result
  }
}

module.exports = new Notices()
