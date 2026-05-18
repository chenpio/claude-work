const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const list = await db.collection('reviews')
    .where({ userId: OPENID })
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()

  return { ok: true, list: list.data }
}
