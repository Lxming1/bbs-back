const connection = require('../utils/database')
const { getOffset } = require('../utils/common')
const { momentSqlFragment } = require('./moment.service')

class Plate {
  async getPlate() {
    const statement = `select * from plate`
    let result = await connection.execute(statement)
    return result[0]
  }

  async getMomentListByPlate(plateId, pagenum, pagesize) {
    const statement = `${momentSqlFragment} where m.plate_id = ? order by updateTime desc limit ?, ?`
    let result = await connection.execute(statement, [
      plateId,
      getOffset(pagenum, pagesize),
      pagesize,
    ])
    return result[0]
  }

  async getMomentByPlateCount(plateId) {
    const statement = `select count(*) count from plate where id = ?`
    let result = await connection.execute(statement, [plateId])
    return result[0]
  }
}

module.exports = new Plate()

// 如果在请求动态时就将评论一起获取
// const statement = `
//   SELECT
//     m.id id, m.content content, JSON_OBJECT('id', u.id, 'name', u.name) author,
// JSON_ARRAYAGG(
//   JSON_OBJECT(
//     'id', c.id, 'content', c.content,
//     'user', JSON_OBJECT('id', cu.id, 'name', cu.name),
//     'commentId', c.comment_id, 'createTime', c.create_at,
//     'updateTime', c.update_at
//   )
// ) comments,
//     m.create_at createTime, m.update_at updataTime
//   FROM moment m
//   LEFT JOIN users u
//   ON m.user_id = u.id
//   LEFT JOIN comment c
//   ON c.moment_id = m.id
//   LEFT JOIN users cu
//   ON c.user_id = cu.id
//   WHERE m.id = ?
// `

// (select JSON_ARRAYAGG(JSON_OBJECT(
// 	'id', cc.id, 'author', JSON_OBJECT(
//     'id', uu.id, 'name', uu.name
//   ), 'content', cc.content,
//   "momentId", cc.moment_id, "commentId", cc.comment_id
// )) from comment cc join moment mm on cc.moment_id = mm.id and mm.id = m.id join users uu on uu.id = cc.user_id) comments,
