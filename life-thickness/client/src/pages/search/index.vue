<template>
  <view class="search-page">
    <view class="search-bar">
      <input v-model="keyword" class="search-input" placeholder="搜索日记关键词..." @confirm="doSearch" />
      <view class="search-btn" @tap="doSearch">搜索</view>
    </view>

    <view class="filter-row">
      <picker mode="date" @change="onDateStart">起始日期</picker>
      <text>至</text>
      <picker mode="date" @change="onDateEnd">结束日期</picker>
    </view>

    <view class="results" v-if="results.length">
      <view v-for="r in results" :key="r._id" class="result-card card" @tap="goDetail(r._id)">
        <text class="result-date">{{ r.date }}</text>
        <text class="result-content">{{ r.content.slice(0, 100) }}</text>
        <view class="result-tags"><text v-for="t in r.tags" :key="t" class="tag">#{{ t }}</text></view>
      </view>
    </view>
    <view v-else-if="searched" class="empty">未找到相关日记</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { callCloud } from '@/utils/cloud'

const keyword = ref('')
const dateStart = ref('')
const dateEnd = ref('')
const results = ref<Record<string, unknown>[]>([])
const searched = ref(false)

function onDateStart(e: { detail: { value: string } }) { dateStart.value = e.detail.value }
function onDateEnd(e: { detail: { value: string } }) { dateEnd.value = e.detail.value }

async function doSearch() {
  Taro.showLoading({ title: '搜索中...' })
  const res = await callCloud('search', { keyword: keyword.value, dateStart: dateStart.value, dateEnd: dateEnd.value }) as { list: Record<string, unknown>[] }
  results.value = res.list || []
  searched.value = true
  Taro.hideLoading()
}

function goDetail(id: string) { Taro.navigateTo({ url: `/pages/detail/index?id=${id}` }) }
</script>

<style lang="scss">
.search-page { padding: 24rpx; padding-top: 40rpx; min-height: 100vh; background: #FAF7F2; }
.search-bar { display: flex; gap: 16rpx; align-items: center; }
.search-input { flex: 1; height: 80rpx; padding: 0 24rpx; background: #fff; border-radius: 48rpx; font-size: 30rpx; }
.search-btn { padding: 16rpx 32rpx; background: #8B7F6E; color: #fff; border-radius: 48rpx; font-size: 28rpx; }
.filter-row { display: flex; gap: 16rpx; padding: 24rpx 0; font-size: 26rpx; color: #9E9E9E; }
.result-card { margin-bottom: 16rpx; }
.result-date { font-size: 26rpx; color: #8B7F6E; }
.result-content { font-size: 28rpx; line-height: 1.6; display: block; margin: 12rpx 0; }
.tag { font-size: 24rpx; color: #8B7F6E; background: #F5F0E8; padding: 4rpx 12rpx; border-radius: 12rpx; margin-right: 8rpx; }
.empty { text-align: center; padding: 80rpx; font-size: 28rpx; color: #9E9E9E; }
</style>
