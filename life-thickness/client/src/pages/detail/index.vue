<template>
  <view class="detail-page" v-if="diary">
    <view class="detail-header">
      <text class="detail-date">{{ formatDate(diary.date) }}</text>
      <view class="detail-meta">
        <text>{{ getWeatherIcon(diary.weather) }} {{ diary.weather }}</text>
        <text>·</text>
        <text>{{ getMoodEmoji(diary.mood) }} {{ getMoodLabel(diary.mood) }}</text>
      </view>
    </view>

    <view v-if="diary.location.district || diary.location.city" class="detail-location">
      📍 {{ diary.location.district || diary.location.city }}
    </view>

    <view class="detail-content card">
      <text>{{ diary.content }}</text>
    </view>

    <view v-if="diary.images.length" class="detail-images">
      <image
        v-for="(img, i) in diary.images"
        :key="i"
        :src="img.url"
        mode="widthFix"
        class="detail-image"
        @tap="preview(i)"
      />
    </view>

    <view class="detail-tags card" v-if="diary.tags.length || diary.emotionTags.length">
      <view class="tag-group">
        <text v-for="t in diary.tags" :key="t" class="tag">#{{ t }}</text>
      </view>
      <view class="emotion-group">
        <text v-for="e in diary.emotionTags" :key="e" class="emotion">{{ e }}</text>
      </view>
    </view>

    <view v-if="diary.oneLine" class="detail-oneline card">
      <text>💬 {{ diary.oneLine }}</text>
    </view>

    <view class="detail-actions">
      <view class="action-btn" @tap="handleEdit">编辑</view>
      <view class="action-btn danger" @tap="handleDelete">删除</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { Diary, WEATHER_OPTIONS, MOOD_OPTIONS } from '@/utils/types'
import { callCloud, formatDate } from '@/utils/cloud'

const diary = ref<Diary | null>(null)
let diaryId = ''

onMounted(() => {
  const params = Taro.getCurrentInstance().router?.params
  diaryId = (params as { id?: string })?.id || ''
  if (diaryId) loadDetail()
})

async function loadDetail() {
  const res = await callCloud('diary_detail', { id: diaryId }) as { diary: Diary }
  diary.value = res.diary
}

function getWeatherIcon(w: string) {
  return WEATHER_OPTIONS.find((o) => o.value === w)?.icon || ''
}

function getMoodEmoji(m: number) {
  return MOOD_OPTIONS.find((o) => o.value === m)?.emoji || ''
}

function getMoodLabel(m: number) {
  return MOOD_OPTIONS.find((o) => o.value === m)?.label || ''
}

function preview(idx: number) {
  Taro.previewImage({ current: diary.value!.images[idx].url, urls: diary.value!.images.map((i) => i.url) })
}

function handleEdit() {
  Taro.navigateTo({ url: `/pages/write/index?id=${diaryId}` })
}

async function handleDelete() {
  const res = await Taro.showModal({ title: '确认删除', content: '删除后可保留7天，确定删除？' })
  if (res.confirm) {
    await callCloud('diary_delete', { id: diaryId })
    Taro.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
  }
}
</script>

<style lang="scss" scoped>
.detail-page { padding: 24px; padding-top: 40px; min-height: 100vh; background: #FAF7F2; }
.detail-header { text-align: center; padding: 40px 0 24px; }
.detail-date { font-size: 36px; font-weight: 600; display: block; }
.detail-meta { font-size: 26px; color: #9E9E9E; margin-top: 12px; }
.detail-location { font-size: 26px; color: #8B7F6E; margin-bottom: 20px; }
.detail-content { font-size: 32px; line-height: 1.8; white-space: pre-wrap; }
.detail-images { display: flex; flex-direction: column; gap: 12px; margin: 24px 0; }
.detail-image { width: 100%; border-radius: 12px; }
.detail-tags { margin-top: 24px; }
.tag-group, .emotion-group { display: flex; flex-wrap: wrap; gap: 12px; }
.tag { font-size: 26px; color: #8B7F6E; background: #F5F0E8; padding: 8px 20px; border-radius: 20px; }
.emotion { font-size: 26px; color: #E8B4B8; background: #FFF0F0; padding: 8px 20px; border-radius: 20px; }
.detail-oneline { margin-top: 24px; font-size: 30px; color: #8B7F6E; }
.detail-actions { display: flex; gap: 24px; justify-content: center; margin-top: 48px; padding-bottom: 48px; }
.action-btn {
  padding: 20px 48px; border-radius: 48px;
  font-size: 30px; border: 2px solid #8B7F6E; color: #8B7F6E;
  &.danger { border-color: #FF8A80; color: #FF8A80; }
}
</style>
