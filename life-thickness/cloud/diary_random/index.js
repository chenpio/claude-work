var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var OPENID = cloud.getWXContext().OPENID
  return db.collection('diaries').where({ userId: OPENID, isDeleted: false }).count().then(function (countRes) {
    if (!countRes.total) return { ok: false }
    var randomSkip = Math.floor(Math.random() * countRes.total)
    return db.collection('diaries').where({ userId: OPENID, isDeleted: false }).skip(randomSkip).limit(1).get().then(function (listRes) {
      return { ok: true, diary: listRes.data[0] }
    })
  })
}
