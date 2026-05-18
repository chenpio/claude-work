const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const diaries = await db.collection('diaries')
    .where({ userId: OPENID, isDeleted: false })
    .field({ date: true })
    .get()

  const dates = diaries.data.map((d) => d.date)
  return { ok: true, dates }
}
