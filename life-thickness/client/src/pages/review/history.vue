<template>
  <view class="history-page">
    <view class="page-title">历史复盘</view>
    <view v-if="list.length === 0" class="empty">暂无历史复盘报告</view>
    <view v-for="r in list" :key="r._id" class="review-item card" @tap="openReview(r._id)">
      <text class="review-range">{{ r.weekStart }} ~ {{ r.weekEnd }}</text>
      <text class="review-stats">{{ r.overview?.diaryCount || 0 }}篇日记 · 平均心情 {{ r.overview?.avgMood || 0 }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { callCloud } from '@/utils/cloud'

const list = ref<Record<string, unknown>[]>([])

onMounted(async () => {
  const res = await callCloud('review_list') as { list: Record<string, unknown>[] }
  list.value = res.list || []
})

function openReview(id: string) {
  Taro.navigateTo({ url: `/pages/review/index?id=${id}` })
}
</script>

<style lang="scss" scoped>
.history-page { padding: 24px; padding-top: 40px; min-height: 100vh; background: #FAF7F2; }
.page-title { font-size: 40px; font-weight: 700; text-align: center; padding: 40px 0; }
.review-item { margin-bottom: 16px; }
.review-range { font-size: 30px; font-weight: 600; display: block; }
.review-stats { font-size: 26px; color: #9E9E9E; margin-top: 8px; }
.empty { text-align: center; padding: 80px; font-size: 28px; color: #9E9E9E; }
</style>
