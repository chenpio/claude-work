var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var API_URL = 'https://api.deepseek.com'
var API_KEY = process.env.ANTHROPIC_AUTH_TOKEN || 'sk-74714e9ca3fa4ada9bf9867db8a93b86'

function callAI(messages) {
  var https = require('https')
  var url = API_URL + '/v1/chat/completions'
  return new Promise(function (resolve, reject) {
    var data = JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.8,
      max_tokens: 2048
    })
    var req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      timeout: 60000
    }, function (res) {
      var body = ''
      res.on('data', function (chunk) { body += chunk })
      res.on('end', function () {
        try {
          var result = JSON.parse(body)
          if (result.error) { reject(new Error(result.error.message || JSON.stringify(result.error))); return }
          var text = ''
          if (result.choices && result.choices[0] && result.choices[0].message) {
            text = result.choices[0].message.content || ''
          }
          if (!text) { reject(new Error('API返回空: ' + body.slice(0, 200))); return }
          resolve(text)
        } catch (e) { reject(new Error('解析失败: ' + (e.message || '') + ' body:' + body.slice(0, 300))) }
      })
    })
    req.on('error', function (e) { reject(new Error('网络错误: ' + e.message)) })
    req.on('timeout', function () { req.destroy(); reject(new Error('请求超时60秒')) })
    req.write(data)
    req.end()
  })
}

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var reviewId = event.reviewId
  var question = event.question

  return db.collection('reviews').doc(reviewId).get().then(function (reviewRes) {
    if (!reviewRes.data) return Promise.reject(new Error('复盘报告不存在'))

    return db.collection('diaries').where({
      userId: OPENID,
      isDeleted: false,
      date: db.command.gte(reviewRes.data.weekStart).and(db.command.lte(reviewRes.data.weekEnd))
    }).get().then(function (diaryRes) {
      var diarySummary = diaryRes.data.map(function (d) {
        return {
          date: d.date,
          content: d.content.slice(0, 300),
          mood: d.mood,
          oneLine: d.oneLine
        }
      })

      return callAI([
        { role: 'system', content: '你是一个温柔有共情力的复盘助手。基于用户的日记数据和复盘报告，回答用户关于本周的问题。回答要温暖、有洞察力、具体（不要空泛）。200字以内。' },
        { role: 'user', content: '我的本周日记：' + JSON.stringify(diarySummary) + '\n复盘报告：' + JSON.stringify(reviewRes.data) + '\n\n我的问题：' + question }
      ]).then(function (answer) {
        return { ok: true, answer: answer }
      })
    })
  }).catch(function (err) {
    return { ok: false, error: err.message || '调用失败' }
  })
}
