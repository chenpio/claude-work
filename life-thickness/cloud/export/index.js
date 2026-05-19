var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

exports.main = function () {
  var OPENID = cloud.getWXContext().OPENID
  return db.collection('diaries').where({ userId: OPENID, isDeleted: false }).orderBy('date', 'asc').get().then(function (res) {
    var markdown = '# 人生厚度 - 日记导出\n\n'
    markdown += '导出时间：' + new Date().toISOString() + '\n'
    markdown += '日记总数：' + res.data.length + ' 篇\n\n---\n\n'
    res.data.forEach(function (d) {
      markdown += '## ' + d.date + '\n\n'
      markdown += '- 天气：' + d.weather + '\n'
      if (d.location && d.location.district) markdown += '- 地点：' + d.location.district + '\n'
      markdown += '- 心情：' + d.mood + '/5\n'
      if (d.emotionTags && d.emotionTags.length) markdown += '- 情绪：' + d.emotionTags.join('、') + '\n'
      if (d.tags && d.tags.length) markdown += '- 标签：' + d.tags.map(function (t) { return '#' + t }).join(' ') + '\n'
      markdown += '\n' + (d.content || '') + '\n\n'
      if (d.oneLine) markdown += '> ' + d.oneLine + '\n\n'
      markdown += '---\n\n'
    })
    var fileName = 'exports/' + OPENID + '_' + Date.now() + '.md'
    return cloud.uploadFile({ cloudPath: fileName, fileContent: Buffer.from(markdown, 'utf-8') }).then(function (uploadRes) {
      return cloud.getTempFileURL({ fileList: [uploadRes.fileID] }).then(function (urlRes) {
        var url = ''
        if (urlRes.fileList && urlRes.fileList[0] && urlRes.fileList[0].tempFileURL) {
          url = urlRes.fileList[0].tempFileURL
        }
        return { ok: true, url: url }
      })
    })
  })
}
