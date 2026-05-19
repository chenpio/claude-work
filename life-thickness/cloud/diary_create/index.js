var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var formData = event.formData || {}
  var diaryId = event.diaryId

  var diary = {
    userId: OPENID,
    date: formData.date,
    weather: formData.weather,
    location: {
      city: (formData.location && formData.location.city) || '',
      district: (formData.location && formData.location.district) || '',
      hidden: (formData.location && formData.location.hidden) || false
    },
    content: formData.content || '',
    images: formData.images || [],
    tags: formData.tags || [],
    mood: formData.mood || 4,
    emotionTags: formData.emotionTags || [],
    oneLine: formData.oneLine || '',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  if (diaryId) {
    diary.updatedAt = new Date().toISOString()
    return db.collection('diaries').doc(diaryId).update({ data: diary }).then(function () {
      return { ok: true, id: diaryId }
    })
  } else {
    return db.collection('diaries').add({ data: diary }).then(function (res) {
      return { ok: true, id: res._id }
    })
  }
}
