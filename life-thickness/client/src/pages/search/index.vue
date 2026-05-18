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

function goDetail(id: string) { Taro.navigateTo({ url: `/pages/detail/detail?id=${id}` }) }
</script>

<style lang="scss" scoped>
.search-page { padding: 24px; padding-top: 40px; min-height: 100vh; background: #FAF7F2; }
.search-bar { display: flex; gap: 16px; align-items: center; }
.search-input { flex: 1; height: 80px; padding: 0 24px; background: #fff; border-radius: 48px; font-size: 30px; }
.search-btn { padding: 16px 32px; background: #8B7F6E; color: #fff; border-radius: 48px; font-size: 28px; }
.filter-row { display: flex; gap: 16px; padding: 24px 0; font-size: 26px; color: #9E9E9E; }
.result-card { margin-bottom: 16px; }
.result-date { font-size: 26px; color: #8B7F6E; }
.result-content { font-size: 28px; line-height: 1.6; display: block; margin: 12px 0; }
.tag { font-size: 24px; color: #8B7F6E; background: #F5F0E8; padding: 4px 12px; border-radius: 12px; margin-right: 8px; }
.empty { text-align: center; padding: 80px; font-size: 28px; color: #9E9E9E; }
</style>
