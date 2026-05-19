var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var now = new Date()
  var h = String(now.getHours())
  if (h.length < 2) h = '0' + h
  var m = String(now.getMinutes())
  if (m.length < 2) m = '0' + m
  var timeStr = h + ':' + m

  return db.collection('users').where({
    'settings.diaryRemind': true,
    'settings.diaryRemindTime': timeStr
  }).get().then(function (usersRes) {
    var users = usersRes.data
    var promises = users.map(function (user) {
      var today = new Date().toISOString().split('T')[0]
      return db.collection('diaries').where({ userId: user._openid, date: today, isDeleted: false }).count().then(function (diaryRes) {
        if (diaryRes.total === 0) {
          try {
            return cloud.openapi.subscribeMessage.send({
              touser: user._openid,
              templateId: 'YOUR_TEMPLATE_ID',
              data: {
                thing1: { value: '今天发生了什么值得记录的事？' },
                thing2: { value: '花5分钟，留住今日的小美好吧～' }
              }
            }).catch(function () {})
          } catch (e) {}
        }
        return Promise.resolve()
      })
    })
    return Promise.all(promises).then(function () {
      return { ok: true }
    })
  })
}
