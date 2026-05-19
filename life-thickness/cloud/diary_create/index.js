const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { formData, diaryId } = event

  const diary = {
    userId: OPENID,
    date: formData.date,
    weather: formData.weather,
    location: {
      city: (formData.location && formData.location.city) || '',
      district: (formData.location && formData.location.district) || '',
      hidden: (formData.location && formData.location.hidden) || false,
    },
    content: formData.content || '',
    images: formData.images || [],
    tags: formData.tags || [],
    mood: formData.mood || 4,
    emotionTags: formData.emotionTags || [],
    oneLine: formData.oneLine || '',
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (diaryId) {
    // 更新
    await db.collection('diaries').doc(diaryId).update({ data: { ...diary, updatedAt: new Date().toISOString() } })
    return { ok: true, id: diaryId }
  } else {
    // 新建
    const res = await db.collection('diaries').add({ data: diary })
    return { ok: true, id: res._id }
  }
}
