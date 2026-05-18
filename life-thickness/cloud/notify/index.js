const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  // 查询所有开启提醒的用户
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const users = await db.collection('users')
    .where({
      'settings.diaryRemind': true,
      'settings.diaryRemindTime': timeStr,
    })
    .get()

  for (const user of users.data) {
    // 检查今天是否已写日记
    const today = new Date().toISOString().split('T')[0]
    const diary = await db.collection('diaries')
      .where({ userId: user._openid, date: today, isDeleted: false })
      .count()

    if (diary.total === 0) {
      // 发送订阅消息提醒
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: user._openid,
          templateId: 'YOUR_TEMPLATE_ID',
          data: {
            thing1: { value: '今天发生了什么值得记录的事？' },
            thing2: { value: '花5分钟，留住今日的小美好吧～' },
          },
        })
      } catch { /* 用户未订阅或模板不存在 */ }
    }
  }

  return { ok: true }
}
