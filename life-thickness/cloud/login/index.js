var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var action = (event && event.action) || 'login'

  if (action === 'updateProfile') {
    // 更新用户资料
    var updateData = {}
    if (event.nickName) updateData.nickName = event.nickName
    if (event.avatarUrl) updateData.avatarUrl = event.avatarUrl
    return db.collection('users').where({ _openid: OPENID }).get().then(function (exist) {
      if (!exist.data.length) {
        // 用户不存在，先创建
        return db.collection('users').add({
          data: {
            nickName: event.nickName || '',
            avatarUrl: event.avatarUrl || '',
            createdAt: new Date().toISOString(),
            settings: {
              diaryRemind: true,
              diaryRemindTime: '21:00',
              reviewRemind: true,
              reviewRemindTime: '19:30',
              doNotDisturb: { start: '23:00', end: '07:00' },
              locationEnabled: true,
              locationHidden: false
            }
          }
        }).then(function () { return { ok: true } })
      }
      return db.collection('users').where({ _openid: OPENID }).update({ data: updateData }).then(function () {
        return { ok: true }
      })
    })
  }

  // 默认: 返回用户信息
  return db.collection('users').where({ _openid: OPENID }).get().then(function (exist) {
    if (!exist.data.length) {
      return { ok: true, user: null }
    }
    return { ok: true, user: exist.data[0] }
  })
}
