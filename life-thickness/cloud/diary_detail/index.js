const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  const res = await db.collection('diaries').doc(id).get()
  if (!res.data || res.data.userId !== OPENID) {
    return { ok: false, error: '日记不存在' }
  }

  return { ok: true, diary: res.data }
}
