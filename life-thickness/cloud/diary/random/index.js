const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const count = await db.collection('diaries').where({ userId: OPENID, isDeleted: false }).count()

  if (!count.total) return { ok: false }

  const randomSkip = Math.floor(Math.random() * count.total)
  const list = await db.collection('diaries')
    .where({ userId: OPENID, isDeleted: false })
    .skip(randomSkip)
    .limit(1)
    .get()

  return { ok: true, diary: list.data[0] }
}
