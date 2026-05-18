<template>
  <view class="timeline-page">
    <view class="page-title">时间轴</view>

    <!-- 日历简版 -->
    <view class="calendar card">
      <view class="cal-header flex-between">
        <text @tap="prevMonth">←</text>
        <text class="cal-month">{{ year }}年{{ month }}月</text>
        <text @tap="nextMonth">→</text>
      </view>
      <view class="cal-weekdays">
        <text v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="weekday">{{ d }}</text>
      </view>
      <view class="cal-days">
        <text
          v-for="(day, i) in calendarDays"
          :key="i"
          :class="['cal-day', { hasDiary: day.hasDiary, today: day.isToday }]"
          @tap="day.hasDiary && goDay(day.date)"
        >{{ day.day }}</text>
      </view>
    </view>

    <!-- 时光机 -->
    <view class="time-machine card" @tap="randomDiary">
      <text class="tm-icon">⏳</text>
      <text class="tm-title">时光机</text>
      <text class="tm-desc">随机回到某一天</text>
    </view>

    <!-- 里程碑 -->
    <view class="milestones card" v-if="milestones.length">
      <text class="section-title">🏆 里程碑</text>
      <view v-for="m in milestones" :key="m._id" class="milestone-item">
        <text class="ms-date">{{ m.date }}</text>
        <text class="ms-title">{{ m.title }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { callCloud } from '@/utils/cloud'

const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const diaryDates = ref<Set<string>>(new Set())
const milestones = ref<{ _id: string; date: string; title: string }[]>([])

interface CalendarDay { day: number; date: string; hasDiary: boolean; isToday: boolean }

const calendarDays = computed<CalendarDay[]>(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(year.value, month.value - 1, 1)
  const lastDay = new Date(year.value, month.value, 0)
  const startDow = firstDay.getDay()
  const padding = startDow === 0 ? 6 : startDow - 1
  const fmt = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  for (let i = 0; i < padding; i++) days.push({ day: 0, date: '', hasDiary: false, isToday: false })
  const today = new Date().toISOString().split('T')[0]
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = fmt(year.value, month.value, d)
    days.push({ day: d, date, hasDiary: diaryDates.value.has(date), isToday: date === today })
  }
  return days
})

onMounted(async () => {
  // 获取有日记的日期
  const res = await callCloud('diary/dates') as { dates: string[] }
  if (res.dates) diaryDates.value = new Set(res.dates)
})

function prevMonth() { if (month.value === 1) { year.value--; month.value = 12 } else { month.value-- } }
function nextMonth() { if (month.value === 12) { year.value++; month.value = 1 } else { month.value++ } }

function goDay(date: string) {
  Taro.navigateTo({ url: `/pages/search/search?date=${date}` })
}

async function randomDiary() {
  const res = await callCloud('diary/random') as { diary?: { _id: string } }
  if (res.diary) {
    Taro.navigateTo({ url: `/pages/detail/detail?id=${res.diary._id}` })
  }
}
</script>

<style lang="scss" scoped>
.timeline-page { padding: 24px; padding-top: 40px; min-height: 100vh; background: #FAF7F2; }
.page-title { font-size: 40px; font-weight: 700; text-align: center; padding: 40px 0; }
.cal-header { padding: 20px 0; .cal-month { font-size: 32px; font-weight: 600; } }
.cal-weekdays { display: flex; padding: 12px 0; .weekday { flex: 1; text-align: center; font-size: 24px; color: #9E9E9E; } }
.cal-days { display: flex; flex-wrap: wrap; }
.cal-day { width: calc(100% / 7); height: 64px; text-align: center; line-height: 64px; font-size: 28px; border-radius: 50%; }
.cal-day.hasDiary { background: #F5F0E8; color: #8B7F6E; font-weight: 600; }
.cal-day.today { border: 2px solid #8B7F6E; }

.time-machine { text-align: center; padding: 40px; margin-top: 24px; }
.tm-icon { font-size: 60px; }
.tm-title { font-size: 32px; font-weight: 600; display: block; margin: 12px 0; }
.tm-desc { font-size: 26px; color: #9E9E9E; }

.milestones { margin-top: 24px; }
.section-title { font-size: 30px; font-weight: 600; display: block; margin-bottom: 16px; }
.milestone-item { padding: 20px 0; border-bottom: 1px solid #ECECEC; }
.ms-date { font-size: 24px; color: #9E9E9E; }
.ms-title { font-size: 30px; font-weight: 500; display: block; margin-top: 4px; }
</style>
