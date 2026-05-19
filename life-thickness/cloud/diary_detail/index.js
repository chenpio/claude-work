var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var id = event.id
  return db.collection('diaries').doc(id).get().then(function (res) {
    if (!res.data || res.data.userId !== OPENID) {
      return { ok: false, error: '日记不存在' }
    }
    return { ok: true, diary: res.data }
  })
}
