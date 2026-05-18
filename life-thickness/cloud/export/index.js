const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  const diaries = await db.collection('diaries')
    .where({ userId: OPENID, isDeleted: false })
    .orderBy('date', 'asc')
    .get()

  let markdown = '# 人生厚度 - 日记导出\n\n'
  markdown += `导出时间：${new Date().toISOString()}\n`
  markdown += `日记总数：${diaries.data.length} 篇\n\n---\n\n`

  for (const d of diaries.data) {
    markdown += `## ${d.date}\n\n`
    markdown += `- 天气：${d.weather}\n`
    if (d.location.district) markdown += `- 地点：${d.location.district}\n`
    markdown += `- 心情：${'😔🙁😐😊🥳'[d.mood - 1] || '😐'}（${d.mood}/5）\n`
    markdown += `- 情绪：${d.emotionTags.join('、')}\n`
    markdown += `- 标签：${d.tags.map((t: string) => '#' + t).join(' ')}\n\n`
    markdown += `${d.content}\n\n`
    if (d.oneLine) markdown += `> ${d.oneLine}\n\n`
    markdown += `---\n\n`
  }

  // 上传到云存储
  const fileName = `exports/${OPENID}_${Date.now()}.md`
  const uploadRes = await cloud.uploadFile({
    cloudPath: fileName,
    fileContent: Buffer.from(markdown, 'utf-8'),
  })

  // 生成临时下载链接
  const urlRes = await cloud.getTempFileURL({ fileList: [uploadRes.fileID] })
  const url = urlRes.fileList[0]?.tempFileURL || ''

  return { ok: true, url }
}
