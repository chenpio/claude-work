// 日记数据类型定义
export interface Diary {
  _id?: string
  userId: string
  date: string
  weather: string
  location: {
    city: string
    district: string
    hidden: boolean
  }
  content: string
  images: ImageItem[]
  tags: string[]
  mood: number
  emotionTags: string[]
  oneLine: string
  isDeleted: boolean
  deletedAt?: string
  milestone?: string
  createdAt: string
  updatedAt: string
}

export interface ImageItem {
  fileId: string
  url: string
  order: number
}

export interface User {
  _id?: string
  nickName: string
  avatarUrl: string
  createdAt: string
  settings: UserSettings
}

export interface UserSettings {
  diaryRemind: boolean
  diaryRemindTime: string
  reviewRemind: boolean
  reviewRemindTime: string
  doNotDisturb: { start: string; end: string }
  locationEnabled: boolean
  locationHidden: boolean
}

export interface Review {
  _id?: string
  userId: string
  weekStart: string
  weekEnd: string
  overview: ReviewOverview
  emotionCurve: EmotionPoint[]
  highlights: Highlight[]
  wordCloud: WordItem[]
  lowPoints: { hasLowMood: boolean; message: string; lowMoodDates: string[] }
  message: string
  suggestions: string[]
  createdAt: string
}

export interface ReviewOverview {
  diaryCount: number
  totalWords: number
  totalImages: number
  topTags: string[]
  avgMood: number
}

export interface EmotionPoint {
  date: string
  mood: number
  keyword: string
}

export interface Highlight {
  date: string
  title: string
  summary: string
  images: ImageItem[]
  mood: number
  tags: string[]
}

export interface WordItem {
  word: string
  count: number
}

export interface Milestone {
  _id?: string
  userId: string
  title: string
  description: string
  date: string
  images: ImageItem[]
  createdAt: string
}

// 天气选项
export const WEATHER_OPTIONS = [
  { label: '晴', icon: '☀️', value: '晴' },
  { label: '雨', icon: '🌧️', value: '雨' },
  { label: '阴', icon: '☁️', value: '阴' },
  { label: '雪', icon: '❄️', value: '雪' },
  { label: '雾', icon: '🌫️', value: '雾' },
  { label: '多云', icon: '⛅', value: '多云' },
  { label: '雷电', icon: '⚡', value: '雷电' },
]

// 心情选项
export const MOOD_OPTIONS = [
  { label: '很差', emoji: '😔', value: 1 },
  { label: '不好', emoji: '🙁', value: 2 },
  { label: '一般', emoji: '😐', value: 3 },
  { label: '还好', emoji: '😊', value: 4 },
  { label: '很棒', emoji: '🥳', value: 5 },
]

// 预设标签
export const DEFAULT_TAGS = ['工作', '家庭', '旅行', '灵感', '美食', '运动', '情绪', '学习']

// 预设情绪标签
export const DEFAULT_EMOTION_TAGS = [
  '平静', '焦虑', '喜悦', '疲惫', '充实', '孤独', '兴奋', '迷茫', '感恩', '烦躁', '期待',
]
