var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var id = event.id
  return db.collection('diaries').doc(id).update({
    data: { isDeleted: true, deletedAt: new Date().toISOString() }
  }).then(function () {
    return { ok: true }
  })
}
