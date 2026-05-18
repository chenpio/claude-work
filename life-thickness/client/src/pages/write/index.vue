<template>
  <view class="write-page">
    <!-- 顶部栏 -->
    <view class="toolbar flex-between">
      <view class="toolbar-btn" @tap="handleCancel">取消</view>
      <text class="toolbar-title">写日记</text>
      <view class="toolbar-btn primary" @tap="handleSave">保存</view>
    </view>

    <!-- 日期 -->
    <view class="field-row">
      <text class="field-label">📅 日期</text>
      <picker mode="date" :value="form.date" @change="onDateChange">
        <text class="field-value">{{ displayDate }}</text>
      </picker>
    </view>

    <!-- 天气 -->
    <view class="field-row">
      <text class="field-label">天气</text>
      <view class="weather-options">
        <view
          v-for="w in weatherOptions"
          :key="w.value"
          :class="['weather-item', { selected: form.weather === w.value }]"
          @tap="form.weather = w.value"
        >
          <text>{{ w.icon }}</text>
        </view>
      </view>
    </view>

    <!-- 地点 -->
    <view class="field-row">
      <text class="field-label">📍 地点</text>
      <input
        class="field-input"
        v-model="form.location.district"
        placeholder="自动获取或手动输入"
        placeholder-style="color:#C4B5A5"
      />
    </view>

    <!-- 正文 -->
    <view class="content-area">
      <textarea
        class="content-input"
        v-model="form.content"
        placeholder="今天发生了什么？"
        placeholder-style="color:#C4B5A5;font-size:32px"
        auto-height
        maxlength="-1"
      />
    </view>

    <!-- 图片 -->
    <view class="field-row image-row">
      <text class="field-label">🖼️ 图片</text>
      <view class="image-list">
        <view v-for="(img, idx) in form.images" :key="idx" class="image-item" @tap="previewImage(idx)">
          <image :src="img.url" mode="aspectFill" class="thumbnail" />
          <view class="image-delete" @tap.stop="removeImage(idx)">✕</view>
        </view>
        <view v-if="form.images.length < 9" class="add-image" @tap="chooseImage">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 标签 -->
    <view class="field-row">
      <text class="field-label">🏷️ 标签</text>
      <view class="tag-options">
        <view
          v-for="t in presetTags"
          :key="t"
          :class="['tag-item', { selected: form.tags.includes(t) }]"
          @tap="toggleTag(t)"
        >
          #{{ t }}
        </view>
        <input
          class="tag-input"
          v-model="customTag"
          placeholder="自定义标签"
          @confirm="addCustomTag"
        />
      </view>
    </view>

    <!-- 心情 -->
    <view class="field-row">
      <text class="field-label">💭 心情</text>
      <view class="mood-options">
        <view
          v-for="m in moodOptions"
          :key="m.value"
          :class="['mood-item', { selected: form.mood === m.value }]"
          @tap="form.mood = m.value"
        >
          <text class="mood-emoji">{{ m.emoji }}</text>
          <text class="mood-label">{{ m.label }}</text>
        </view>
      </view>
    </view>

    <!-- 情绪标签 -->
    <view class="field-row">
      <text class="field-label">情绪</text>
      <view class="emotion-options">
        <view
          v-for="e in presetEmotionTags"
          :key="e"
          :class="['emotion-item', { selected: form.emotionTags.includes(e) }]"
          @tap="toggleEmotion(e)"
        >
          {{ e }}
        </view>
      </view>
    </view>

    <!-- 一句话 -->
    <view class="field-row">
      <text class="field-label">✍️ 一句话</text>
      <input
        class="field-input"
        v-model="form.oneLine"
        placeholder="用一句话概括今天"
        placeholder-style="color:#C4B5A5"
        maxlength="50"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { WEATHER_OPTIONS, MOOD_OPTIONS, DEFAULT_TAGS, DEFAULT_EMOTION_TAGS, ImageItem } from '@/utils/types'
import { callCloud, formatDate } from '@/utils/cloud'
import { saveDraft, loadDraft, clearDraft } from '@/utils/storage'

const weatherOptions = WEATHER_OPTIONS
const moodOptions = MOOD_OPTIONS
const presetTags = DEFAULT_TAGS
const presetEmotionTags = DEFAULT_EMOTION_TAGS
const customTag = ref('')

const form = reactive({
  date: '',
  weather: '晴',
  location: { city: '', district: '', hidden: false },
  content: '',
  images: [] as ImageItem[],
  tags: [] as string[],
  mood: 4,
  emotionTags: [] as string[],
  oneLine: '',
})

const displayDate = computed(() => formatDate(form.date))

onMounted(async () => {
  // 设置默认日期为今天
  const today = new Date().toISOString().split('T')[0]
  form.date = today

  // 获取地理位置
  try {
    const loc = await Taro.getFuzzyLocation({ type: 'wgs84' })
    form.location.city = loc.city || ''
  } catch { /* 用户拒绝定位 */ }

  // 恢复草稿
  const draft = loadDraft()
  if (draft) {
    const confirmed = await Taro.showModal({ title: '恢复草稿', content: '检测到未保存的草稿，是否恢复？' })
    if (confirmed.confirm) {
      Object.assign(form, draft)
    }
  }
})

function onDateChange(e: { detail: { value: string } }) {
  form.date = e.detail.value
}

function toggleTag(tag: string) {
  const idx = form.tags.indexOf(tag)
  if (idx > -1) form.tags.splice(idx, 1)
  else if (form.tags.length < 5) form.tags.push(tag)
}

function addCustomTag() {
  const name = customTag.value.trim()
  if (name && !form.tags.includes(name) && form.tags.length < 5) {
    form.tags.push(name)
    customTag.value = ''
  }
}

function toggleEmotion(e: string) {
  const idx = form.emotionTags.indexOf(e)
  if (idx > -1) form.emotionTags.splice(idx, 1)
  else form.emotionTags.push(e)
}

async function chooseImage() {
  const res = await Taro.chooseImage({ count: 9 - form.images.length, sizeType: ['compressed'] })
  // 上传到云存储
  for (const path of res.tempFilePaths) {
    const cloudPath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const upload = await Taro.cloud.uploadFile({ cloudPath, filePath: path })
    form.images.push({ fileId: upload.fileID, url: upload.fileID, order: form.images.length })
  }
}

function previewImage(idx: number) {
  Taro.previewImage({
    current: form.images[idx].url,
    urls: form.images.map((i) => i.url),
  })
}

function removeImage(idx: number) {
  form.images.splice(idx, 1)
}

function handleCancel() {
  // 自动保存草稿
  if (form.content || form.images.length || form.tags.length) {
    saveDraft({ ...form })
  }
  Taro.navigateBack()
}

async function handleSave() {
  if (!form.content.trim() && !form.images.length) {
    Taro.showToast({ title: '请写下一点东西', icon: 'none' })
    return
  }
  Taro.showLoading({ title: '保存中...' })
  try {
    await callCloud('diary/create', { formData: { ...form } })
    clearDraft()
    Taro.hideLoading()
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 800)
  } catch {
    Taro.hideLoading()
    Taro.showToast({ title: '保存失败', icon: 'error' })
  }
}
</script>

<style lang="scss" scoped>
.write-page {
  padding: 24px;
  padding-top: 100px;
  min-height: 100vh;
  background: #FAF7F2;
}

.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px 32px;
  background: rgba(250, 247, 242, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid #ECECEC;

  &-title { font-size: 34px; font-weight: 600; }
  &-btn { font-size: 30px; color: #9E9E9E; }
  &-btn.primary { color: #8B7F6E; font-weight: 600; }
}

.field-row {
  margin-bottom: 36px;
}

.field-label {
  display: block;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #3D3D3D;
}

.field-value {
  font-size: 30px;
  color: #8B7F6E;
  border-bottom: 2px dashed #C4B5A5;
  padding: 8px 0;
}

.field-input {
  width: 100%;
  height: 72px;
  font-size: 30px;
  border-bottom: 2px solid #ECECEC;
  padding: 8px 0;
}

.weather-options {
  display: flex; gap: 20px;
  .weather-item {
    width: 64px; height: 64px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    &.selected { border-color: #8B7F6E; background: #F5F0E8; }
  }
}

.content-area { margin-bottom: 36px; }
.content-input {
  width: 100%;
  min-height: 300px;
  font-size: 32px;
  line-height: 1.8;
  color: #3D3D3D;
}

.image-row { .field-label { margin-bottom: 16px; } }
.image-list {
  display: flex; flex-wrap: wrap; gap: 16px;
  .image-item { position: relative; }
  .thumbnail { width: 160px; height: 160px; border-radius: 12px; }
  .image-delete {
    position: absolute; top: -8px; right: -8px;
    width: 40px; height: 40px;
    background: rgba(0,0,0,0.5); color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .add-image {
    width: 160px; height: 160px;
    border: 2px dashed #C4B5A5; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    .add-icon { font-size: 48px; color: #C4B5A5; }
  }
}

.tag-options {
  display: flex; flex-wrap: wrap; gap: 16px;
  .tag-item {
    padding: 12px 24px;
    border-radius: 32px;
    font-size: 26px;
    background: #F5F0E8; color: #8B7F6E;
    &.selected { background: #8B7F6E; color: #fff; }
  }
  .tag-input {
    width: 180px; height: 56px;
    font-size: 26px;
    padding: 0 16px;
    border: 1px solid #C4B5A5; border-radius: 32px;
  }
}

.mood-options {
  display: flex; justify-content: space-between;
  .mood-item {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 16px 20px; border-radius: 16px;
    border: 2px solid transparent;
    &.selected { border-color: #8B7F6E; background: #F5F0E8; }
    .mood-emoji { font-size: 40px; }
    .mood-label { font-size: 22px; color: #9E9E9E; }
  }
}

.emotion-options {
  display: flex; flex-wrap: wrap; gap: 16px;
  .emotion-item {
    padding: 12px 24px;
    border-radius: 32px;
    font-size: 26px;
    background: #F5F0E8; color: #8B7F6E;
    &.selected { background: #8B7F6E; color: #fff; }
  }
}
</style>
