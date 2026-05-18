import Taro from '@tarojs/taro'

// 云函数调用封装
export async function callCloud(name: string, data: Record<string, unknown> = {}): Promise<unknown> {
  try {
    const res = await Taro.cloud.callFunction({ name, data })
    return res.result
  } catch (err) {
    console.error(`[Cloud] ${name} error:`, err)
    throw err
  }
}

// 日期格式化
export function formatDate(date: Date | string, fmt = 'YYYY年M月D日'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const map: Record<string, number> = {
    YYYY: d.getFullYear(),
    M: d.getMonth() + 1,
    D: d.getDate(),
    H: d.getHours(),
    m: d.getMinutes(),
    s: d.getSeconds(),
  }
  return fmt.replace(/YYYY|M|D|H|m|s/g, (k) => String(map[k]).padStart(k === 'YYYY' ? 4 : 2, '0'))
}

// 获取本周日期范围
export function getWeekRange(date = new Date()): { start: string; end: string } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (dt: Date) => dt.toISOString().split('T')[0]
  return { start: fmt(monday), end: fmt(sunday) }
}
