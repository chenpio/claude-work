<template>
  <view class="home-page">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">人生厚度</text>
      <text class="header-sub">记录人生的长度，沉淀生活的厚度</text>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions flex-between">
      <view class="action-btn write-btn" @tap="goWrite">
        <text class="action-icon">✏️</text>
        <text class="action-text">写日记</text>
      </view>
      <view class="action-btn time-machine-btn" @tap="openTimeMachine">
        <text class="action-icon">⏳</text>
        <text class="action-text">时光机</text>
      </view>
    </view>

    <!-- 日记列表 -->
    <view class="diary-list">
      <view class="section-title">最近日记</view>
      <view v-if="diaries.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">还没有日记，开始写第一篇吧</text>
      </view>
      <view v-for="diary in diaries" :key="diary._id" class="diary-card card" @tap="goDetail(diary._id)">
        <view class="card-header flex-between">
          <text class="card-date">{{ formatDate(diary.date) }}</text>
          <text class="card-mood">{{ getMoodEmoji(diary.mood) }}</text>
        </view>
        <text class="card-content">{{ diary.content.slice(0, 120) }}{{ diary.content.length > 120 ? '...' : '' }}</text>
        <view v-if="diary.images.length" class="card-images">
          <image v-for="(img, i) in diary.images.slice(0, 3)" :key="i" :src="img.url" mode="aspectFill" class="card-thumb" />
        </view>
        <view class="card-footer flex-between">
          <view class="card-tags">
            <text v-for="t in diary.tags.slice(0, 3)" :key="t" class="tag">#{{ t }}</text>
          </view>
          <text class="card-weather">{{ diary.weather }}</text>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore" class="load-more" @tap="loadMore">
      <text class="load-text">查看更多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { Diary, MOOD_OPTIONS } from '@/utils/types'
import { callCloud, formatDate } from '@/utils/cloud'

const diaries = ref<Diary[]>([])
const page = ref(1)
const hasMore = ref(true)

onMounted(() => {
  loadDiaries()
})

async function loadDiaries() {
  const res = await callCloud('diary_list', { page: page.value }) as { list: Diary[]; total: number }
  if (res.list) {
    diaries.value = page.value === 1 ? res.list : [...diaries.value, ...res.list]
    hasMore.value = diaries.value.length < res.total
  }
}

function loadMore() {
  page.value++
  loadDiaries()
}

function getMoodEmoji(mood: number): string {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.emoji || '😐'
}

function goWrite() {
  Taro.navigateTo({ url: '/pages/write/index' })
}

function goDetail(id: string) {
  Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

function openTimeMachine() {
  Taro.navigateTo({ url: '/pages/timeline/index?mode=random' })
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 24px;
  padding-top: 60px;
  min-height: 100vh;
  background: #FAF7F2;
}

.header {
  text-align: center;
  padding: 48px 0 36px;
  &-title { font-size: 44px; font-weight: 700; color: #3D3D3D; display: block; }
  &-sub { font-size: 26px; color: #9E9E9E; margin-top: 12px; }
}

.quick-actions {
  margin-bottom: 40px;
  .action-btn {
    flex: 1;
    display: flex; flex-direction: column; align-items: center;
    padding: 36px;
    border-radius: 24px;
    margin: 0 12px;
    background: #FFFFFF;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    .action-icon { font-size: 48px; margin-bottom: 12px; }
    .action-text { font-size: 28px; color: #3D3D3D; font-weight: 500; }
  }
  .write-btn { background: linear-gradient(135deg, #F5F0E8, #FFFFFF); }
  .time-machine-btn { background: linear-gradient(135deg, #FFF0F0, #FFFFFF); }
}

.section-title {
  font-size: 32px; font-weight: 600;
  margin-bottom: 24px; color: #3D3D3D;
}

.diary-card {
  margin-bottom: 20px;
  .card-header { margin-bottom: 16px; }
  .card-date { font-size: 28px; font-weight: 600; }
  .card-mood { font-size: 36px; }
  .card-content {
    font-size: 28px; line-height: 1.6;
    color: #3D3D3D;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-images {
    display: flex; gap: 8px; margin-top: 16px;
    .card-thumb { width: 100px; height: 100px; border-radius: 8px; }
  }
  .card-footer { margin-top: 16px; }
  .card-tags { display: flex; gap: 8px; }
  .tag { font-size: 24px; color: #8B7F6E; background: #F5F0E8; padding: 4px 16px; border-radius: 16px; }
  .card-weather { font-size: 26px; }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 0;
  .empty-icon { font-size: 80px; margin-bottom: 24px; }
  .empty-text { font-size: 28px; color: #9E9E9E; }
}

.load-more {
  text-align: center; padding: 32px;
  .load-text { font-size: 28px; color: #8B7F6E; }
}
</style>
