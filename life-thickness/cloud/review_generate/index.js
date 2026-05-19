const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// DeepSeek API (OpenAI 兼容格式)
const API_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.deepseek.com'
const API_KEY = process.env.ANTHROPIC_AUTH_TOKEN || 'sk-74714e9ca3fa4ada9bf9867db8a93b86'
const API_MODEL = 'deepseek-chat'

async function callAI(prompt) {
  const https = require('https')
  const url = new URL(`${API_URL}/v1/chat/completions`)
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: API_MODEL,
      messages: [
        { role: 'system', content: '你是一个温柔有共情力的生活复盘助手。请只返回要求的JSON格式，不要markdown代码块，不要多余文字。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4096,
    })
    const req = https.request(
      url.href,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        timeout: 60000,
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          try {
            const result = JSON.parse(body)
            if (result.error) { reject(new Error(result.error.message || JSON.stringify(result.error))); return }
            const text = result.choices?.[0]?.message?.content || ''
            if (!text) { reject(new Error('API返回空: ' + body.slice(0, 200))); return }
            resolve(text)
          } catch (e) { reject(new Error('解析失败: ' + (e.message || '') + ' body:' + body.slice(0, 300))) }
        })
      },
    )
    req.on('error', (e) => reject(new Error('网络错误: ' + e.message)))
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时60秒')) })
    req.write(data)
    req.end()
  })
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr || Date.now())
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (dt) => dt.toISOString().split('T')[0]
  return { start: fmt(mon), end: fmt(sun) }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const dateStr = event.date || new Date().toISOString().split('T')[0]
  const { start, end } = getWeekRange(dateStr)

  // 查询本周日记
  const res = await db.collection('diaries')
    .where({
      userId: OPENID,
      isDeleted: false,
      date: db.command.gte(start).and(db.command.lte(end)),
    })
    .orderBy('date', 'asc')
    .get()

  const diaries = res.data
  if (!diaries.length) {
    return { ok: false, error: '本周没有日记', diaryCount: 0 }
  }

  // 构建 Prompt
  const diaryListText = diaries.map((d) => ({
    date: d.date,
    weather: d.weather,
    content: d.content.slice(0, 500),
    mood: d.mood,
    emotionTags: d.emotionTags,
    tags: d.tags,
    oneLine: d.oneLine,
  }))

  const prompt = `你是一个温柔有共情力的生活复盘助手「人生厚度」。根据以下本周日记，生成周复盘报告。
返回纯JSON，不要markdown代码块，不要多余文字。

本周日记：
${JSON.stringify(diaryListText, null, 2)}

请按以下JSON结构输出：
{
  "overview": {
    "diaryCount": 数字,
    "totalWords": 数字,
    "totalImages": 数字,
    "topTags": ["标签1", "标签2"],
    "avgMood": 数字(1-5一位小数)
  },
  "emotionCurve": [
    { "date": "日期", "mood": 1-5, "keyword": "当日关键词" }
  ],
  "highlights": [
    { "date": "日期", "title": "高光标题", "summary": "150字内摘要", "mood": 数字, "tags": ["标签"] }
  ],
  "wordCloud": [
    { "word": "关键词", "count": 出现次数 }
  ],
  "lowPoints": {
    "hasLowMood": true/false,
    "message": "若有2天以上低心情，温柔关怀；否则空字符串",
    "lowMoodDates": ["日期"]
  },
  "message": "温柔的鼓励寄语，150字内，不生硬不鸡汤，贴合本周内容",
  "suggestions": ["1-2条具体可执行的小建议"]
}`

  try {
    const aiText = await callAI(prompt)
    const review = JSON.parse(aiText)

    // 保存复盘报告
    const saveResult = await db.collection('reviews').add({
      data: {
        userId: OPENID,
        weekStart: start,
        weekEnd: end,
        ...review,
        createdAt: new Date().toISOString(),
      },
    })

    return {
      ok: true,
      review: { _id: saveResult._id, weekStart: start, weekEnd: end, ...review },
    }
  } catch (err) {
    console.error('AI生成失败:', err)
    return { ok: false, error: 'AI生成失败: ' + (err.message || JSON.stringify(err).slice(0, 200)) }
  }
}
