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
      <text class="field-label">日期</text>
      <picker mode="date" :value="formDate" @change="onDateChange">
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
          :class="['weather-item', formWeather === w.value ? 'selected' : '']"
          @tap="selectWeather(w.value)"
        >
          <text>{{ w.icon }}</text>
        </view>
      </view>
    </view>

    <!-- 地点 -->
    <view class="field-row">
      <text class="field-label">地点</text>
      <input
        class="field-input"
        :value="formLocation"
        placeholder="自动获取或手动输入"
        @input="onLocationInput"
      />
    </view>

    <!-- 正文 -->
    <view class="content-area">
      <textarea
        class="content-input"
        :value="formContent"
        placeholder="今天发生了什么？"
        auto-height
        @input="onContentInput"
      />
    </view>

    <!-- 图片 -->
    <view class="field-row">
      <text class="field-label">图片 ({{ formImages.length }}/9)</text>
      <view class="image-list">
        <view v-for="(img, idx) in formImages" :key="idx" class="image-item">
          <image :src="img.url" mode="aspectFill" class="thumbnail" @tap="previewImage(idx)" />
          <view class="image-delete" @tap="removeImage(idx)">X</view>
        </view>
        <view v-if="formImages.length < 9" class="add-image" @tap="chooseImage">
          <text class="add-icon">+</text>
        </view>
      </view>
    </view>

    <!-- 标签 -->
    <view class="field-row">
      <text class="field-label">标签</text>
      <view class="tag-options">
        <view
          v-for="t in presetTags"
          :key="t"
          :class="['tag-item', formTags.includes(t) ? 'selected' : '']"
          @tap="toggleTag(t)"
        >#{{ t }}</view>
        <input
          class="tag-input"
          :value="customTag"
          placeholder="自定义"
          @input="onCustomTagInput"
          @confirm="addCustomTag"
        />
      </view>
    </view>

    <!-- 心情 -->
    <view class="field-row">
      <text class="field-label">心情</text>
      <view class="mood-options">
        <view
          v-for="m in moodOptions"
          :key="m.value"
          :class="['mood-item', formMood === m.value ? 'selected' : '']"
          @tap="selectMood(m.value)"
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
          :class="['emotion-item', formEmotionTags.includes(e) ? 'selected' : '']"
          @tap="toggleEmotion(e)"
        >{{ e }}</view>
      </view>
    </view>

    <!-- 一句话 -->
    <view class="field-row">
      <text class="field-label">一句话</text>
      <input
        class="field-input"
        :value="formOneLine"
        placeholder="用一句话概括今天"
        @input="onOneLineInput"
        maxlength="50"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { WEATHER_OPTIONS, MOOD_OPTIONS, DEFAULT_TAGS, DEFAULT_EMOTION_TAGS } from '@/utils/types'
import { callCloud, formatDate } from '@/utils/cloud'
import { saveDraft, loadDraft, clearDraft } from '@/utils/storage'

const weatherOptions = WEATHER_OPTIONS
const moodOptions = MOOD_OPTIONS
const presetTags = DEFAULT_TAGS
const presetEmotionTags = DEFAULT_EMOTION_TAGS

// 使用 ref 代替 reactive，更兼容小程序
const formDate = ref('')
const formWeather = ref('晴')
const formCity = ref('')
const formDistrict = ref('')
const formLocationHidden = ref(false)
const formContent = ref('')
const formImages = ref<{fileId: string; url: string; order: number}[]>([])
const formTags = ref<string[]>([])
const formMood = ref(4)
const formEmotionTags = ref<string[]>([])
const formOneLine = ref('')
const customTag = ref('')

const displayDate = computed(() => formatDate(formDate.value))

onMounted(async () => {
  const today = new Date().toISOString().split('T')[0]
  formDate.value = today
  try {
    const loc = await Taro.getFuzzyLocation({ type: 'wgs84' })
    formCity.value = loc.city || ''
  } catch { /* 用户拒绝 */ }
  const draft = loadDraft()
  if (draft) {
    const confirmed = await Taro.showModal({ title: '恢复草稿', content: '检测到未保存的草稿，是否恢复？' })
    if (confirmed.confirm) {
      const d = draft as Record<string, unknown>
      formDate.value = (d.date as string) || formDate.value
      formWeather.value = (d.weather as string) || '晴'
      formDistrict.value = (d.location as Record<string,string>)?.district || ''
      formContent.value = (d.content as string) || ''
      formImages.value = (d.images as typeof formImages.value) || []
      formTags.value = (d.tags as string[]) || []
      formMood.value = (d.mood as number) || 4
      formEmotionTags.value = (d.emotionTags as string[]) || []
      formOneLine.value = (d.oneLine as string) || ''
    }
  }
})

function getFormData() {
  return {
    date: formDate.value,
    weather: formWeather.value,
    location: { city: formCity.value, district: formDistrict.value, hidden: formLocationHidden.value },
    content: formContent.value,
    images: formImages.value,
    tags: formTags.value,
    mood: formMood.value,
    emotionTags: formEmotionTags.value,
    oneLine: formOneLine.value,
  }
}

function onDateChange(e: { detail: { value: string } }) { formDate.value = e.detail.value }
function selectWeather(v: string) { formWeather.value = v }
function selectMood(v: number) { formMood.value = v }
function onLocationInput(e: { detail: { value: string } }) { formDistrict.value = e.detail.value }
function onContentInput(e: { detail: { value: string } }) { formContent.value = e.detail.value }
function onOneLineInput(e: { detail: { value: string } }) { formOneLine.value = e.detail.value }
function onCustomTagInput(e: { detail: { value: string } }) { customTag.value = e.detail.value }

function toggleTag(tag: string) {
  const idx = formTags.value.indexOf(tag)
  if (idx > -1) formTags.value.splice(idx, 1)
  else if (formTags.value.length < 5) formTags.value.push(tag)
}

function addCustomTag() {
  const name = customTag.value.trim()
  if (name && !formTags.value.includes(name) && formTags.value.length < 5) {
    formTags.value.push(name)
    customTag.value = ''
  }
}

function toggleEmotion(e: string) {
  const idx = formEmotionTags.value.indexOf(e)
  if (idx > -1) formEmotionTags.value.splice(idx, 1)
  else formEmotionTags.value.push(e)
}

async function chooseImage() {
  const res = await Taro.chooseImage({ count: 9 - formImages.value.length, sizeType: ['compressed'] })
  for (const path of res.tempFilePaths) {
    const cloudPath = `images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    const upload = await Taro.cloud.uploadFile({ cloudPath, filePath: path })
    formImages.value.push({ fileId: upload.fileID, url: upload.fileID, order: formImages.value.length })
  }
}

function previewImage(idx: number) {
  Taro.previewImage({ current: formImages.value[idx].url, urls: formImages.value.map((i) => i.url) })
}

function removeImage(idx: number) { formImages.value.splice(idx, 1) }

function handleCancel() {
  if (formContent.value || formImages.value.length || formTags.value.length) {
    saveDraft(getFormData())
  }
  Taro.navigateBack()
}

async function handleSave() {
  if (!formContent.value.trim() && !formImages.value.length) {
    Taro.showToast({ title: '请写下一点东西', icon: 'none' })
    return
  }
  Taro.showLoading({ title: '保存中...' })
  try {
    await callCloud('diary_create', { formData: getFormData() })
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

<style lang="scss">
.write-page { padding: 24rpx; padding-top: 100rpx; min-height: 100vh; background: #FAF7F2; }
.toolbar {
  position: fixed; top: 0; left: 0; right: 0; padding: 24rpx 32rpx;
  background: rgba(250,247,242,0.95); z-index: 100; border-bottom: 1rpx solid #ECECEC;
  display: flex; align-items: center; justify-content: space-between;
  &-title { font-size: 34rpx; font-weight: 600; }
  &-btn { font-size: 30rpx; color: #9E9E9E; padding: 8rpx 16rpx; }
  &-btn.primary { color: #8B7F6E; font-weight: 600; }
}
.field-row { margin-bottom: 36rpx; }
.field-label { display: block; font-size: 28rpx; font-weight: 500; margin-bottom: 16rpx; color: #3D3D3D; }
.field-value { font-size: 30rpx; color: #8B7F6E; border-bottom: 2rpx dashed #C4B5A5; padding: 8rpx 0; display: inline-block; }
.field-input { width: 100%; height: 72rpx; font-size: 30rpx; border-bottom: 2rpx solid #ECECEC; padding: 8rpx 0; }
.weather-options { display: flex; gap: 20rpx; }
.weather-item {
  width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center;
  font-size: 36rpx; border-radius: 50%; border: 2rpx solid transparent;
  &.selected { border-color: #8B7F6E; background: #F5F0E8; }
}
.content-area { margin-bottom: 36rpx; }
.content-input { width: 100%; min-height: 300rpx; font-size: 32rpx; line-height: 1.8; color: #3D3D3D; }
.image-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { position: relative; }
.thumbnail { width: 160rpx; height: 160rpx; border-radius: 12rpx; }
.image-delete {
  position: absolute; top: -8rpx; right: -8rpx; width: 40rpx; height: 40rpx;
  background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 20rpx;
}
.add-image {
  width: 160rpx; height: 160rpx; border: 2rpx dashed #C4B5A5; border-radius: 12rpx;
  display: flex; align-items: center; justify-content: center;
  .add-icon { font-size: 48rpx; color: #C4B5A5; }
}
.tag-options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag-item {
  padding: 12rpx 24rpx; border-radius: 32rpx; font-size: 26rpx; background: #F5F0E8; color: #8B7F6E;
  &.selected { background: #8B7F6E; color: #fff; }
}
.tag-input { width: 180rpx; height: 56rpx; font-size: 26rpx; padding: 0 16rpx; border: 1rpx solid #C4B5A5; border-radius: 32rpx; }
.mood-options { display: flex; justify-content: space-between; }
.mood-item {
  display: flex; flex-direction: column; align-items: center; gap: 8rpx;
  padding: 16rpx 20rpx; border-radius: 16rpx; border: 2rpx solid transparent;
  &.selected { border-color: #8B7F6E; background: #F5F0E8; }
  .mood-emoji { font-size: 40rpx; }
  .mood-label { font-size: 22rpx; color: #9E9E9E; }
}
.emotion-options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.emotion-item {
  padding: 12rpx 24rpx; border-radius: 32rpx; font-size: 26rpx; background: #F5F0E8; color: #8B7F6E;
  &.selected { background: #8B7F6E; color: #fff; }
}
</style>
