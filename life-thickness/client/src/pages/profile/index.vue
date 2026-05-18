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
      <view class="menu-item" @tap="Taro.navigateTo({ url: '/pages/timeline/timeline' })">
        <text>📅 时间轴</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="Taro.navigateTo({ url: '/pages/search/search' })">
        <text>🔍 搜索日记</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="Taro.navigateTo({ url: '/pages/settings/settings' })">
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

<style lang="scss" scoped>
.profile-page { padding: 24px; padding-top: 40px; min-height: 100vh; background: #FAF7F2; }
.user-card { text-align: center; padding: 48px 32px; }
.avatar { width: 120px; height: 120px; border-radius: 50%; display: block; margin: 0 auto 20px; }
.nickname { font-size: 36px; font-weight: 600; display: block; }
.bio { font-size: 26px; color: #9E9E9E; margin-top: 8px; display: block; }
.menu-list { margin-top: 32px; }
.menu-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 36px 32px; background: #FFFFFF; border-radius: 16px;
  margin-bottom: 12px; font-size: 30px;
  .arrow { color: #C4B5A5; font-size: 28px; }
}
.version-info { text-align: center; padding: 48px; font-size: 24px; color: #C4B5A5; }
</style>
