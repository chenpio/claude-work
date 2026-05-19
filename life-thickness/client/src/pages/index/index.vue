<template>
  <view class="home-page">
    <view class="header">
      <text class="title">人生厚度</text>
      <text class="subtitle">记录人生的长度，沉淀生活的厚度</text>
    </view>
    <view class="actions">
      <view class="btn write-btn" @tap="goWrite">
        <text>写日记</text>
      </view>
      <view class="btn review-btn" @tap="goReview">
        <text>复盘</text>
      </view>
      <view class="btn profile-btn" @tap="goProfile">
        <text>我的</text>
      </view>
    </view>
    <view class="diary-list">
      <text class="list-title">最近日记</text>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="diaries.length===0" class="empty">还没有日记，开始写第一篇吧</view>
      <view v-for="d in diaries" :key="d._id" class="diary-item" @tap="goDetail(d._id)">
        <text class="diary-date">{{ d.date }}</text>
        <text class="diary-text">{{ d.content.slice(0, 100) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

const diaries = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await Taro.cloud.callFunction({ name: 'diary_list' })
    diaries.value = res.result.list || []
  } catch (e) {
    console.error(e)
  }
  loading.value = false
})

function goWrite() { Taro.navigateTo({ url: '/pages/write/index' }) }
function goReview() { Taro.switchTab({ url: '/pages/review/index' }) }
function goProfile() { Taro.switchTab({ url: '/pages/profile/index' }) }
function goDetail(id) { Taro.navigateTo({ url: `/pages/detail/index?id=${id}` }) }
</script>

<style lang="scss">
.home-page { padding: 24rpx; min-height: 100vh; background: #FAF7F2; }
.header { text-align: center; padding: 60rpx 0 40rpx; }
.title { font-size: 44rpx; font-weight: 700; color: #3D3D3D; display: block; }
.subtitle { font-size: 26rpx; color: #9E9E9E; margin-top: 12rpx; display: block; }
.actions { display: flex; gap: 24rpx; margin-bottom: 40rpx; }
.btn { flex: 1; text-align: center; padding: 36rpx; border-radius: 24rpx; font-size: 32rpx; font-weight: 500; }
.write-btn { background: #F5F0E8; color: #8B7F6E; }
.review-btn { background: #F0F0FF; color: #5B6ABF; }
.profile-btn { background: #FFF0F0; color: #E8B4B8; }
.list-title { font-size: 32rpx; font-weight: 600; color: #3D3D3D; margin-bottom: 24rpx; display: block; }
.loading, .empty { text-align: center; padding: 80rpx 0; font-size: 28rpx; color: #9E9E9E; }
.diary-item { background: #fff; border-radius: 16rpx; padding: 28rpx; margin-bottom: 16rpx; }
.diary-date { font-size: 26rpx; color: #8B7F6E; font-weight: 600; display: block; }
.diary-text { font-size: 28rpx; color: #3D3D3D; margin-top: 12rpx; display: block; }
</style>
