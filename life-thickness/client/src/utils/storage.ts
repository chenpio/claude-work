import Taro from '@tarojs/taro'

const DRAFT_KEY = 'diary_draft'

export function saveDraft(data: Record<string, unknown>): void {
  Taro.setStorageSync(DRAFT_KEY, JSON.stringify(data))
}

export function loadDraft(): Record<string, unknown> | null {
  try {
    const raw = Taro.getStorageSync(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft(): void {
  Taro.removeStorageSync(DRAFT_KEY)
}
