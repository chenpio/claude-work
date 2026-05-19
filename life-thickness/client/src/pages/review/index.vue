<template>
  <view class="review-page">
    <view class="page-title">复盘报告</view>

    <!-- 未生成时 -->
    <view v-if="!review" class="review-empty card">
      <text class="empty-icon">📊</text>
      <text class="empty-text">生成本周复盘，回顾过去的日子</text>
      <view class="generate-btn btn-primary" @tap="generateReview">生成本周复盘</view>
    </view>

    <!-- 报告内容 -->
    <view v-else class="review-content">
      <!-- 概览 -->
      <view class="card overview">
        <text class="section-title">本周概览</text>
        <view class="overview-grid">
          <view class="overview-item"><text class="num">{{ review.overview.diaryCount }}</text><text class="label">日记篇数</text></view>
          <view class="overview-item"><text class="num">{{ review.overview.totalWords }}</text><text class="label">总字数</text></view>
          <view class="overview-item"><text class="num">{{ review.overview.totalImages }}</text><text class="label">图片数</text></view>
          <view class="overview-item"><text class="num">{{ review.overview.avgMood }}</text><text class="label">平均心情</text></view>
        </view>
        <view class="top-tags">热门标签：<text v-for="t in review.overview.topTags" :key="t" class="tag">#{{ t }}</text></view>
      </view>

      <!-- 情绪曲线 -->
      <view class="card emotion-curve">
        <text class="section-title">情绪变化</text>
        <view class="curve-bar">
          <view v-for="e in review.emotionCurve" :key="e.date" class="bar-item">
            <text class="bar-label">{{ e.date.slice(5) }}</text>
            <view class="bar" :style="{ height: (e.mood * 40) + 'px', background: getMoodColor(e.mood) }" />
            <text class="bar-emoji">{{ getMoodEmoji(e.mood) }}</text>
          </view>
        </view>
      </view>

      <!-- 高光时刻 -->
      <view class="card highlights">
        <text class="section-title">✨ 高光时刻</text>
        <view v-for="(h, i) in review.highlights" :key="i" class="highlight-item">
          <text class="hl-date">{{ h.date }} · {{ getMoodEmoji(h.mood) }}</text>
          <text class="hl-title">{{ h.title }}</text>
          <text class="hl-summary">{{ h.summary }}</text>
        </view>
      </view>

      <!-- 词云 -->
      <view class="card wordcloud">
        <text class="section-title">生活重心</text>
        <view class="cloud-list">
          <text v-for="w in review.wordCloud.slice(0, 15)" :key="w.word" class="cloud-word" :style="{ fontSize: (24 + w.count * 8) + 'px' }">{{ w.word }}</text>
        </view>
      </view>

      <!-- AI 寄语 -->
      <view class="card ai-message">
        <text class="section-title">💌 给自己的话</text>
        <text class="message-text">{{ review.message }}</text>
      </view>

      <!-- 建议 -->
      <view class="card suggestions">
        <text class="section-title">下周建议</text>
        <view v-for="(s, i) in review.suggestions" :key="i" class="suggestion-item">
          <text class="sug-num">{{ i + 1 }}</text>
          <text class="sug-text">{{ s }}</text>
        </view>
      </view>

      <!-- 追问 -->
      <view class="ask-section card">
        <text class="section-title">追问 AI</text>
        <view class="preset-questions">
          <text v-for="q in presetQuestions" :key="q" class="preset-q" @tap="askAI(q)">{{ q }}</text>
        </view>
        <view class="custom-ask">
          <input v-model="customQuestion" class="ask-input" placeholder="自定义问题..." />
          <view class="ask-btn btn-primary" @tap="askAI(customQuestion)">提问</view>
        </view>
        <view v-if="answer" class="answer-box">
          <text>{{ answer }}</text>
        </view>
      </view>

      <!-- 历史复盘 -->
      <view class="history-link" @tap="Taro.navigateTo({ url: '/pages/review/history' })">查看历史复盘 →</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { Review, MOOD_OPTIONS } from '@/utils/types'
import { callCloud, getWeekRange } from '@/utils/cloud'

const review = ref<Review | null>(null)
const answer = ref('')
const customQuestion = ref('')
const presetQuestions = ['这周我有什么进步？', '为什么周三心情最低？', '下周可以怎么调整？', '这周的高光时刻有哪些共同点？']

function getMoodEmoji(m: number) { return MOOD_OPTIONS.find((o) => o.value === m)?.emoji || '' }
function getMoodColor(m: number) { return ['#FF8A80', '#FFB74D', '#BDBDBD', '#81C784', '#64B5F6'][m - 1] || '#BDBDBD' }

async function generateReview() {
  Taro.showLoading({ title: '生成中...' })
  try {
    const res = await callCloud('review_generate', { date: new Date().toISOString().split('T')[0] }) as { ok: boolean; review: Review }
    if (res.ok) review.value = res.review
    Taro.hideLoading()
  } catch { Taro.hideLoading(); Taro.showToast({ title: '生成失败', icon: 'error' }) }
}

async function askAI(q: string) {
  if (!q.trim()) return
  Taro.showLoading({ title: '思考中...' })
  const res = await callCloud('review_ask', { reviewId: review.value!._id, question: q.trim() }) as { ok: boolean; answer: string }
  if (res.ok) answer.value = res.answer
  Taro.hideLoading()
}
</script>

<style lang="scss">
.review-page { padding: 24rpx; padding-top: 40rpx; min-height: 100vh; background: #FAF7F2; }
.page-title { font-size: 40rpx; font-weight: 700; text-align: center; padding: 40rpx 0; }
.review-empty { text-align: center; padding: 60rpx 32rpx; }
.empty-icon { font-size: 80rpx; }
.empty-text { display: block; font-size: 28rpx; color: #9E9E9E; margin: 24rpx 0; }
.generate-btn { margin-top: 32rpx; display: inline-block; }

.section-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 20rpx; }

.overview-grid { display: flex; justify-content: space-around; margin-bottom: 20rpx; }
.overview-item { text-align: center; .num { font-size: 44rpx; font-weight: 700; color: #8B7F6E; display: block; } .label { font-size: 24rpx; color: #9E9E9E; } }
.top-tags { font-size: 26rpx; .tag { color: #8B7F6E; background: #F5F0E8; padding: 4rpx 16rpx; border-radius: 16rpx; margin-left: 8rpx; } }

.curve-bar { display: flex; align-items: flex-end; justify-content: space-around; height: 240rpx; padding: 20rpx 0; }
.bar-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.bar { width: 48rpx; border-radius: 8rpx 8rpx 0 0; min-height: 8rpx; }
.bar-label { font-size: 20rpx; color: #9E9E9E; }
.bar-emoji { font-size: 24rpx; }

.highlight-item { padding: 20rpx 0; border-bottom: 1rpx solid #ECECEC; &:last-child { border-bottom: none; } }
.hl-date { font-size: 24rpx; color: #9E9E9E; }
.hl-title { font-size: 32rpx; font-weight: 600; display: block; margin: 8rpx 0; }
.hl-summary { font-size: 26rpx; color: #3D3D3D; line-height: 1.6; }

.cloud-list { display: flex; flex-wrap: wrap; gap: 16rpx; align-items: center; }
.cloud-word { color: #8B7F6E; font-weight: 500; }

.message-text { font-size: 30rpx; line-height: 1.8; color: #3D3D3D; }

.suggestion-item { display: flex; gap: 16rpx; padding: 16rpx 0; align-items: flex-start; }
.sug-num { width: 48rpx; height: 48rpx; background: #F5F0E8; border-radius: 50%; text-align: center; line-height: 48rpx; font-size: 28rpx; color: #8B7F6E; flex-shrink: 0; }
.sug-text { font-size: 28rpx; line-height: 1.6; }

.preset-questions { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 20rpx; }
.preset-q { padding: 12rpx 24rpx; background: #F5F0E8; border-radius: 32rpx; font-size: 26rpx; color: #8B7F6E; }
.ask-input { width: 100%; height: 72rpx; font-size: 28rpx; border-bottom: 2rpx solid #ECECEC; margin-bottom: 16rpx; }
.ask-btn { display: inline-block; }
.answer-box { margin-top: 24rpx; padding: 24rpx; background: #FAF7F2; border-radius: 12rpx; font-size: 28rpx; line-height: 1.6; }

.history-link { text-align: center; padding: 32rpx; font-size: 28rpx; color: #8B7F6E; }

.card { margin-bottom: 20rpx; }
</style>
