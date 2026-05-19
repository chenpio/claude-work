var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var OPENID = cloud.getWXContext().OPENID
  return db.collection('diaries').where({ userId: OPENID }).remove().then(function () {
    return db.collection('reviews').where({ userId: OPENID }).remove()
  }).then(function () {
    return db.collection('milestones').where({ userId: OPENID }).remove()
  }).then(function () {
    return db.collection('tags').where({ userId: OPENID }).remove()
  }).then(function () {
    return db.collection('users').where({ _openid: OPENID }).remove()
  }).then(function () {
    return { ok: true }
  })
}
