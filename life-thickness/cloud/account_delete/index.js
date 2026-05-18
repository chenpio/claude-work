const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  // 级联删除所有用户数据
  await db.collection('diaries').where({ userId: OPENID }).remove()
  await db.collection('reviews').where({ userId: OPENID }).remove()
  await db.collection('milestones').where({ userId: OPENID }).remove()
  await db.collection('tags').where({ userId: OPENID }).remove()
  await db.collection('users').where({ _openid: OPENID }).remove()

  return { ok: true }
}
