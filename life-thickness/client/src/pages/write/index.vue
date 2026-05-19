<template>
  <view class="write-page">
    <view class="toolbar">
      <text class="toolbar-btn" @tap="goBack">取消</text>
      <text class="toolbar-title">写日记</text>
      <text class="toolbar-btn save" @tap="handleSave">保存</text>
    </view>
    <view class="field">
      <text class="label">日期</text>
      <picker mode="date" :value="diaryDate" @change="onDateChange">
        <text class="value">{{ diaryDate }}</text>
      </picker>
    </view>
    <view class="field">
      <text class="label">天气</text>
      <view class="options">
        <text v-for="w in weathers" :key="w" class="opt" :class="{ sel: weather===w }" @tap="weather=w">{{ w }}</text>
      </view>
    </view>
    <view class="field">
      <text class="label">心情</text>
      <view class="moods">
        <text v-for="m in moodList" :key="m.v" class="mood" :class="{ sel: mood===m.v }" @tap="mood=m.v">{{ m.e }}</text>
      </view>
    </view>
    <view class="content-box">
      <textarea v-model="content" placeholder="今天发生了什么？" class="content" auto-height />
    </view>
    <view class="field">
      <text class="label">标签</text>
      <view class="options">
        <text v-for="t in tags" :key="t" class="opt" :class="{ sel: selTags.includes(t) }" @tap="toggleTag(t)">#{{ t }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'

const diaryDate = ref(new Date().toISOString().split('T')[0])
const weather = ref('晴')
const mood = ref(4)
const content = ref('')
const selTags = ref([])
const weathers = ['☀️晴','🌧️雨','☁️阴','❄️雪','🌫️雾','⛅多云','⚡雷电']
const moodList = [{v:1,e:'😔'},{v:2,e:'🙁'},{v:3,e:'😐'},{v:4,e:'😊'},{v:5,e:'🥳'}]
const tags = ['工作','家庭','旅行','灵感','美食','运动','情绪','学习']

function onDateChange(e) { diaryDate.value = e.detail.value }
function toggleTag(t) {
  const i = selTags.value.indexOf(t)
  if (i > -1) selTags.value.splice(i, 1)
  else if (selTags.value.length < 5) selTags.value.push(t)
}
function goBack() { Taro.navigateBack() }
async function handleSave() {
  if (!content.value.trim()) { Taro.showToast({ title: '请写点东西', icon: 'none' }); return }
  Taro.showLoading({ title: '保存中...' })
  try {
    await Taro.cloud.callFunction({ name: 'diary_create', data: {
      formData: { date: diaryDate.value, weather: weather.value, mood: mood.value, content: content.value, tags: selTags.value, emotionTags: [], location: { city:'', district:'', hidden:false }, images: [], oneLine: '' }
    }})
    Taro.hideLoading()
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 800)
  } catch { Taro.hideLoading(); Taro.showToast({ title: '保存失败', icon: 'error' }) }
}
</script>

<style lang="scss">
.write-page { padding: 24rpx; padding-top: 100rpx; min-height: 100vh; background: #FAF7F2; }
.toolbar { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 24rpx 32rpx; background: rgba(250,247,242,0.95); z-index: 100; border-bottom: 1rpx solid #ECECEC; }
.toolbar-title { font-size: 34rpx; font-weight: 600; }
.toolbar-btn { font-size: 30rpx; color: #9E9E9E; padding: 8rpx 16rpx; }
.toolbar-btn.save { color: #8B7F6E; font-weight: 600; }
.field { margin-bottom: 36rpx; }
.label { font-size: 28rpx; font-weight: 500; color: #3D3D3D; display: block; margin-bottom: 16rpx; }
.value { font-size: 30rpx; color: #8B7F6E; border-bottom: 2rpx dashed #C4B5A5; padding: 8rpx 0; }
.options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.opt { padding: 12rpx 24rpx; border-radius: 32rpx; font-size: 26rpx; background: #F5F0E8; color: #8B7F6E; }
.opt.sel { background: #8B7F6E; color: #fff; }
.moods { display: flex; justify-content: space-between; }
.mood { font-size: 44rpx; padding: 16rpx 24rpx; border-radius: 16rpx; border: 2rpx solid transparent; }
.mood.sel { border-color: #8B7F6E; background: #F5F0E8; }
.content-box { margin-bottom: 36rpx; }
.content { width: 100%; min-height: 300rpx; font-size: 32rpx; line-height: 1.8; color: #3D3D3D; }
</style>
