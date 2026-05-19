var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var page = event.page || 1
  var pageSize = event.pageSize || 20
  var dateFilter = event.dateFilter
  var tagFilter = event.tagFilter

  var where = { userId: OPENID, isDeleted: false }
  if (dateFilter) {
    where.date = db.command.gte(dateFilter.start).and(db.command.lte(dateFilter.end))
  }
  if (tagFilter) {
    where.tags = db.command.in([tagFilter])
  }

  var query = db.collection('diaries').where(where)
  return query.count().then(function (countRes) {
    var total = countRes.total
    return query.orderBy('date', 'desc').skip((page - 1) * pageSize).limit(pageSize).get().then(function (listRes) {
      return { ok: true, list: listRes.data, total: total, page: page, pageSize: pageSize }
    })
  })
}
