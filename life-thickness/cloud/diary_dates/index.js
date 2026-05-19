var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var OPENID = cloud.getWXContext().OPENID
  return db.collection('diaries').where({ userId: OPENID, isDeleted: false }).field({ date: true }).get().then(function (res) {
    var dates = res.data.map(function (d) { return d.date })
    return { ok: true, dates: dates }
  })
}
