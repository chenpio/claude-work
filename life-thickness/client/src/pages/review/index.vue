<template>
  <view class="review-page">
    <text class="title">复盘报告</text>
    <view v-if="loading" class="status">加载中...</view>
    <view v-else-if="!review" class="empty">
      <text class="empty-text">还未生成本周复盘</text>
      <view class="gen-btn" @tap="generate">生成本周复盘</view>
    </view>
    <view v-else class="report">
      <view class="card">
        <text class="card-title">本周概览</text>
        <text class="stat">日记 {{ review.overview.diaryCount }} 篇 | 心情 {{ review.overview.avgMood }}</text>
      </view>
      <view class="card">
        <text class="card-title">给自己的话</text>
        <text class="msg">{{ review.message }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'

const review = ref(null)
const loading = ref(false)

async function generate() {
  loading.value = true
  try {
    const res = await Taro.cloud.callFunction({ name: 'review_generate' })
    if (res.result.ok) review.value = res.result.review
    else Taro.showToast({ title: res.result.error || '生成失败', icon: 'none' })
  } catch (e) {
    Taro.showToast({ title: '生成失败', icon: 'none' })
  }
  loading.value = false
}
</script>

<style lang="scss">
.review-page { padding: 24rpx; min-height: 100vh; background: #FAF7F2; }
.title { font-size: 40rpx; font-weight: 700; display: block; text-align: center; padding: 60rpx 0 40rpx; }
.status { text-align: center; padding: 80rpx; font-size: 28rpx; color: #9E9E9E; }
.empty { text-align: center; padding: 80rpx 0; }
.empty-text { font-size: 28rpx; color: #9E9E9E; display: block; margin-bottom: 32rpx; }
.gen-btn { display: inline-block; padding: 24rpx 48rpx; background: #8B7F6E; color: #fff; border-radius: 48rpx; font-size: 32rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 28rpx; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 12rpx; }
.stat { font-size: 28rpx; color: #3D3D3D; }
.msg { font-size: 28rpx; line-height: 1.8; color: #3D3D3D; }
</style>
