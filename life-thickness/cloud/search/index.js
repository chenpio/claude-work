const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { keyword, dateStart, dateEnd, tagFilter, emotionFilter, page = 1, pageSize = 20 } = event

  const where = { userId: OPENID, isDeleted: false }

  if (dateStart && dateEnd) {
    where.date = db.command.gte(dateStart).and(db.command.lte(dateEnd))
  }
  if (keyword) {
    where.content = db.RegExp({ regexp: keyword, options: 'i' })
  }
  if (tagFilter) {
    where.tags = db.command.in([tagFilter])
  }
  if (emotionFilter) {
    where.emotionTags = db.command.in([emotionFilter])
  }

  const list = await db.collection('diaries')
    .where(where)
    .orderBy('date', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  return { ok: true, list: list.data }
}
