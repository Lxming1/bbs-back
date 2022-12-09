const { getOffset } = require('../utils/common')
const connection = require('../utils/database')
const { APP_HOST, APP_PORT } = require('../app/config')

class Notices {
  async read(noticeId, uid) {
    const statement = 'update notices set status = 1 where id = ? and user_id = ?'
    const [result] = await connection.execute(statement, [noticeId, uid])
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
        n.id, if(moment_id=null, null, (
          select JSON_OBJECT(
            "id", m.id,
            "title", m.title,
            "content", m.content,
            "plateId", m.plate_id,
            "images", (select 
              JSON_ARRAYAGG(CONCAT('${APP_HOST}:${APP_PORT}/moment/image/', file.filename)) 
              from file where m.id = file.moment_id limit 0, 1
            ),
            "createTime", m.create_at,
            "updateTime", m.update_at
          ) from moment m 
          where m.id = n.moment_id
        )) moment,
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
            "gender", ud.gender,
            "avatarUrl", ud.avatar_url
          ) from users u 
          join user_detail ud 
          on u.id = ud.user_id and u.id = n.from_uid
        ) author, n.type, n.content,
        n.status, n.update_at updateTime, n.create_at createTime 
      from 
        notices n
      where 
        user_id = ? and type = ?
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

  async getNoticeTotal(uid, type) {
    const statement = 'select count(*) count from notices where type = ? and user_id = ?'
    const [result] = await connection.execute(statement, [type, uid])
    return result
  }

  async getNoticeCount(uid) {
    const statement = `select count(*) count from notices n where n.user_id = ? and n.status = 0`
    const [result] = await connection.execute(statement, [uid])
    return result[0].count
  }

  async allNoticesCount(uid) {
    const statement = `
      select type, count(*) count 
      from notices where user_id = ? and status = 0 
      group by type
    `
    const [result] = await connection.execute(statement, [uid])
    return result
  }
}

module.exports = new Notices()
