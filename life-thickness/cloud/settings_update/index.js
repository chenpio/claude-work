var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var settings = event.settings
  return db.collection('users').where({ _openid: OPENID }).update({ data: { settings: settings } }).then(function () {
    return { ok: true }
  })
}
