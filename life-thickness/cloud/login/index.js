const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()

  // 检查用户是否已存在
  const exist = await db.collection('users').where({ _openid: OPENID }).get()
  if (!exist.data.length) {
    await db.collection('users').add({
      data: {
        nickName: '',
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        settings: {
          diaryRemind: true,
          diaryRemindTime: '21:00',
          reviewRemind: true,
          reviewRemindTime: '19:30',
          doNotDisturb: { start: '23:00', end: '07:00' },
          locationEnabled: true,
          locationHidden: false,
        },
      },
    })
  }

  return { ok: true, user: exist.data[0] }
}
