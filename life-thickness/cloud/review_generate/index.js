var cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
var db = cloud.database()

var API_URL = 'https://api.deepseek.com'
var API_KEY = process.env.ANTHROPIC_AUTH_TOKEN || 'sk-74714e9ca3fa4ada9bf9867db8a93b86'

function callAI(prompt) {
  var https = require('https')
  return new Promise(function (resolve, reject) {
    var data = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个温柔有共情力的生活复盘助手。请只返回要求的JSON格式，不要markdown代码块，不要多余文字。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4096
    })
    var url = API_URL + '/v1/chat/completions'
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

function getWeekRange(dateStr) {
  var d = new Date(dateStr || Date.now())
  var day = d.getDay()
  var diff = d.getDate() - day + (day === 0 ? -6 : 1)
  var mon = new Date(d.setDate(diff))
  var sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  function fmt(dt) { return dt.toISOString().split('T')[0] }
  return { start: fmt(mon), end: fmt(sun) }
}

exports.main = function (event) {
  var OPENID = cloud.getWXContext().OPENID
  var dateStr = event.date || new Date().toISOString().split('T')[0]
  var range = getWeekRange(dateStr)
  var start = range.start
  var end = range.end

  return db.collection('diaries')
    .where({
      userId: OPENID,
      isDeleted: false,
      date: db.command.gte(start).and(db.command.lte(end))
    })
    .orderBy('date', 'asc')
    .get()
    .then(function (res) {
      var diaries = res.data
      if (!diaries.length) {
        return { ok: false, error: '本周没有日记', diaryCount: 0 }
      }

      var diaryListText = diaries.map(function (d) {
        return {
          date: d.date,
          weather: d.weather,
          content: d.content.slice(0, 500),
          mood: d.mood,
          emotionTags: d.emotionTags,
          tags: d.tags,
          oneLine: d.oneLine
        }
      })

      var prompt = '你是一个温柔有共情力的生活复盘助手「人生厚度」。根据以下本周日记，生成周复盘报告。\n返回纯JSON，不要markdown代码块，不要多余文字。\n\n本周日记：\n' +
        JSON.stringify(diaryListText, null, 2) +
        '\n\n请按以下JSON结构输出：\n{\n  "overview": {\n    "diaryCount": 数字,\n    "totalWords": 数字,\n    "totalImages": 数字,\n    "topTags": ["标签1", "标签2"],\n    "avgMood": 数字(1-5一位小数)\n  },\n  "emotionCurve": [\n    { "date": "日期", "mood": 1-5, "keyword": "当日关键词" }\n  ],\n  "highlights": [\n    { "date": "日期", "title": "高光标题", "summary": "150字内摘要", "mood": 数字, "tags": ["标签"] }\n  ],\n  "wordCloud": [\n    { "word": "关键词", "count": 出现次数 }\n  ],\n  "lowPoints": {\n    "hasLowMood": true或false,\n    "message": "若有2天以上低心情，温柔关怀；否则空字符串",\n    "lowMoodDates": ["日期"]\n  },\n  "message": "温柔的鼓励寄语，150字内，不生硬不鸡汤，贴合本周内容",\n  "suggestions": ["1-2条具体可执行的小建议"]\n}'

      return callAI(prompt).then(function (aiText) {
        var review = JSON.parse(aiText)
        review.userId = OPENID
        review.weekStart = start
        review.weekEnd = end
        review.createdAt = new Date().toISOString()
        review.updatedAt = new Date().toISOString()

        // 查本周是否已有复盘，有则覆盖
        return db.collection('reviews').where({
          userId: OPENID,
          weekStart: start,
          weekEnd: end
        }).get().then(function (existRes) {
          if (existRes.data.length) {
            // 覆盖更新
            var existId = existRes.data[0]._id
            return db.collection('reviews').doc(existId).update({ data: review }).then(function () {
              review._id = existId
              return { ok: true, review: review, updated: true }
            })
          } else {
            // 新建
            return db.collection('reviews').add({ data: review }).then(function (addRes) {
              review._id = addRes._id
              return { ok: true, review: review, updated: false }
            })
          }
        })
      })
    })
    .catch(function (err) {
      console.error('AI生成失败:', err)
      return { ok: false, error: 'AI生成失败: ' + (err.message || JSON.stringify(err).slice(0, 200)) }
    })
}
