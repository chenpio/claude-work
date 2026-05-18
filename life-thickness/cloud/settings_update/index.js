const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { settings } = event

  await db.collection('users').where({ _openid: OPENID }).update({
    data: { settings },
  })

  return { ok: true }
}
