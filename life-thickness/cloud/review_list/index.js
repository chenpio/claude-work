var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var OPENID = cloud.getWXContext().OPENID
  return db.collection('reviews').where({ userId: OPENID }).orderBy('createdAt', 'desc').limit(20).get().then(function (res) {
    return { ok: true, list: res.data }
  })
}
