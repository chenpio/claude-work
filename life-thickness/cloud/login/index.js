var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var OPENID = cloud.getWXContext().OPENID
  return db.collection('users').where({ _openid: OPENID }).get().then(function (exist) {
    if (!exist.data.length) {
      return db.collection('users').add({
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
            locationHidden: false
          }
        }
      }).then(function () { return { ok: true } })
    }
    return { ok: true, user: exist.data[0] }
  })
}
