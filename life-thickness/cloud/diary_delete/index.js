const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  // 软删除，存入删除时间
  await db.collection('diaries').doc(id).update({
    data: { isDeleted: true, deletedAt: new Date().toISOString() },
  })

  return { ok: true }
}
