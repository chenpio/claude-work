<template>
  <view class="profile-page">
    <!-- 用户信息 -->
    <view class="user-card card">
      <image class="avatar" :src="user.avatarUrl || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'" mode="aspectFill" />
      <text class="nickname">{{ user.nickName || '人生厚度' }}</text>
      <text class="bio">记录人生的长度，沉淀生活的厚度</text>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @tap="Taro.navigateTo({ url: '/pages/timeline/index' })">
        <text>📅 时间轴</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="Taro.navigateTo({ url: '/pages/search/index' })">
        <text>🔍 搜索日记</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="Taro.navigateTo({ url: '/pages/settings/index' })">
        <text>⚙️ 设置</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="handleExport">
        <text>📥 导出数据</text>
        <text class="arrow">→</text>
      </view>
    </view>

    <view class="version-info">
      <text>人生厚度 v1.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { callCloud } from '@/utils/cloud'

const user = ref({ nickName: '', avatarUrl: '' })

onMounted(async () => {
  try {
    const res = await callCloud('login')
    const userInfo = await Taro.getUserInfo()
    user.value = { nickName: userInfo.userInfo.nickName, avatarUrl: userInfo.userInfo.avatarUrl }
  } catch { /* 未授权 */ }
})

async function handleExport() {
  Taro.showLoading({ title: '导出中...' })
  try {
    const res = await callCloud('export') as { ok: boolean; url?: string }
    if (res.url) {
      // 复制导出链接
      Taro.setClipboardData({ data: res.url })
      Taro.hideLoading()
      Taro.showToast({ title: '导出链接已复制', icon: 'success' })
    }
  } catch { Taro.hideLoading(); Taro.showToast({ title: '导出失败', icon: 'error' }) }
}
</script>

<style lang="scss">
.profile-page { padding: 24rpx; padding-top: 40rpx; min-height: 100vh; background: #FAF7F2; }
.user-card { text-align: center; padding: 48rpx 32rpx; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; display: block; margin: 0 auto 20rpx; }
.nickname { font-size: 36rpx; font-weight: 600; display: block; }
.bio { font-size: 26rpx; color: #9E9E9E; margin-top: 8rpx; display: block; }
.menu-list { margin-top: 32rpx; }
.menu-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 36rpx 32rpx; background: #FFFFFF; border-radius: 16rpx;
  margin-bottom: 12rpx; font-size: 30rpx;
  .arrow { color: #C4B5A5; font-size: 28rpx; }
}
.version-info { text-align: center; padding: 48rpx; font-size: 24rpx; color: #C4B5A5; }
</style>
