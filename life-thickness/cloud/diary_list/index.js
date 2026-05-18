const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { page = 1, pageSize = 20, dateFilter, tagFilter } = event

  let query = db.collection('diaries')
    .where({ userId: OPENID, isDeleted: false })

  if (dateFilter) {
    query = query.where({ date: db.command.gte(dateFilter.start).and(db.command.lte(dateFilter.end)) })
  }
  if (tagFilter) {
    query = query.where({ tags: db.command.in([tagFilter]) })
  }

  const total = await query.count()
  const list = await query
    .orderBy('date', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  return { ok: true, list: list.data, total: total.total, page, pageSize }
}
