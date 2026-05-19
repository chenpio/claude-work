var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var keyword = event.keyword || ''
  var dateStart = event.dateStart || ''
  var dateEnd = event.dateEnd || ''
  var tagFilter = event.tagFilter || ''
  var emotionFilter = event.emotionFilter || ''
  var page = event.page || 1
  var pageSize = event.pageSize || 20

  var where = { userId: OPENID, isDeleted: false }

  if (dateStart && dateEnd) {
    where.date = db.command.gte(dateStart).and(db.command.lte(dateEnd))
  }
  if (keyword) {
    where.content = db.RegExp({ regexp: keyword, options: 'i' })
  }
  if (tagFilter) {
    where.tags = db.command.in([tagFilter])
  }
  if (emotionFilter) {
    where.emotionTags = db.command.in([emotionFilter])
  }

  return db.collection('diaries')
    .where(where)
    .orderBy('date', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
    .then(function (res) {
      return { ok: true, list: res.data }
    })
}
