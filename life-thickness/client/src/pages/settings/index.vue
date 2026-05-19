<template>
  <view class="settings-page">
    <view class="page-title">设置</view>

    <view class="setting-group">
      <text class="group-title">提醒设置</text>
      <view class="setting-item">
        <text>写日记提醒</text>
        <switch :checked="settings.diaryRemind" @change="settings.diaryRemind = $event.detail.value" color="#8B7F6E" />
      </view>
      <view v-if="settings.diaryRemind" class="setting-item">
        <text>提醒时间</text>
        <picker mode="time" :value="settings.diaryRemindTime" @change="onTimeChange('diaryRemindTime', $event)">
          <text class="setting-value">{{ settings.diaryRemindTime }}</text>
        </picker>
      </view>
      <view class="setting-item">
        <text>复盘提醒</text>
        <switch :checked="settings.reviewRemind" @change="settings.reviewRemind = $event.detail.value" color="#8B7F6E" />
      </view>
      <view v-if="settings.reviewRemind" class="setting-item">
        <text>复盘提醒时间</text>
        <picker mode="time" :value="settings.reviewRemindTime" @change="onTimeChange('reviewRemindTime', $event)">
          <text class="setting-value">{{ settings.reviewRemindTime }}</text>
        </picker>
      </view>
    </view>

    <view class="setting-group">
      <text class="group-title">隐私设置</text>
      <view class="setting-item">
        <text>自动获取位置</text>
        <switch :checked="settings.locationEnabled" @change="settings.locationEnabled = $event.detail.value" color="#8B7F6E" />
      </view>
      <view class="setting-item">
        <text>隐藏具体地点</text>
        <switch :checked="settings.locationHidden" @change="settings.locationHidden = $event.detail.value" color="#8B7F6E" />
      </view>
    </view>

    <view class="setting-group">
      <text class="group-title">数据管理</text>
      <view class="setting-item" @tap="handleExport"><text>导出全部日记</text><text class="arrow">→</text></view>
      <view class="setting-item danger" @tap="handleDeleteAccount"><text>删除账号及全部数据</text><text class="arrow">→</text></view>
    </view>

    <view class="save-bar">
      <view class="btn-primary" @tap="saveSettings">保存设置</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { callCloud } from '@/utils/cloud'

const settings = ref({
  diaryRemind: true,
  diaryRemindTime: '21:00',
  reviewRemind: true,
  reviewRemindTime: '19:30',
  locationEnabled: true,
  locationHidden: false,
})

function onTimeChange(key: string, e: { detail: { value: string } }) {
  (settings.value as Record<string, unknown>)[key] = e.detail.value
}

async function saveSettings() {
  Taro.showLoading({ title: '保存中...' })
  await callCloud('settings_update', { settings: settings.value })
  Taro.hideLoading()
  Taro.showToast({ title: '已保存', icon: 'success' })
}

async function handleExport() {
  Taro.showLoading({ title: '导出中...' })
  const res = await callCloud('export') as { ok: boolean; url?: string }
  Taro.hideLoading()
  if (res.url) {
    Taro.setClipboardData({ data: res.url })
    Taro.showToast({ title: '导出链接已复制', icon: 'success' })
  }
}

async function handleDeleteAccount() {
  const r1 = await Taro.showModal({ title: '确认删除', content: '此操作将删除所有日记和复盘数据，不可恢复。确定继续？' })
  if (!r1.confirm) return
  const r2 = await Taro.showModal({ title: '再次确认', content: '删除后所有数据将被永久清除，确定？' })
  if (!r2.confirm) return
  await callCloud('account_delete')
  Taro.showToast({ title: '账号已删除', icon: 'success' })
}
</script>

<style lang="scss">
.settings-page { padding: 24rpx; padding-top: 40rpx; min-height: 100vh; background: #FAF7F2; }
.page-title { font-size: 40rpx; font-weight: 700; text-align: center; padding: 40rpx 0; }
.setting-group { margin-bottom: 32rpx; }
.group-title { font-size: 28rpx; color: #9E9E9E; padding: 0 12rpx 16rpx; display: block; }
.setting-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 32rpx; background: #fff; border-bottom: 1rpx solid #F5F0E8; font-size: 30rpx;
  &:first-of-type { border-radius: 16rpx 16rpx 0 0; }
  &:last-of-type { border-radius: 0 0 16rpx 16rpx; border-bottom: none; }
  .setting-value { color: #8B7F6E; }
  .arrow { color: #C4B5A5; }
  &.danger text { color: #FF8A80; }
}
.save-bar { padding: 40rpx 0; }
.btn-primary { width: 100%; text-align: center; display: block; }
</style>
