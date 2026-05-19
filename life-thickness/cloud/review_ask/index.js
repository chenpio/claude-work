const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const API_URL = 'https://api.deepseek.com'
const API_KEY = process.env.ANTHROPIC_AUTH_TOKEN || 'sk-74714e9ca3fa4ada9bf9867db8a93b86'

async function callAI(messages) {
  const https = require('https')
  const url = new URL(`${API_URL}/v1/chat/completions`)
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.8,
      max_tokens: 2048,
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
            const text = (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) || ''
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

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { reviewId, question } = event

  // 获取复盘报告
  const review = await db.collection('reviews').doc(reviewId).get()
  if (!review.data) return { ok: false, error: '复盘报告不存在' }

  // 获取本周日记
  const diaries = await db.collection('diaries')
    .where({
      userId: OPENID,
      isDeleted: false,
      date: db.command.gte(review.data.weekStart).and(db.command.lte(review.data.weekEnd)),
    })
    .get()

  const diarySummary = diaries.data.map((d) => ({
    date: d.date,
    content: d.content.slice(0, 300),
    mood: d.mood,
    oneLine: d.oneLine,
  }))

  const answer = await callAI([
    {
      role: 'system',
      content: '你是一个温柔有共情力的复盘助手。基于用户的日记数据和复盘报告，回答用户关于本周的问题。回答要温暖、有洞察力、具体（不要空泛）。200字以内。',
    },
    {
      role: 'user',
      content: `我的本周日记：${JSON.stringify(diarySummary)}\n复盘报告：${JSON.stringify(review.data)}\n\n我的问题：${question}`,
    },
  ])

  return { ok: true, answer }
}
