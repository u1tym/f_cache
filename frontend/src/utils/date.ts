/** 日本（Asia/Tokyo）の暦日を YYYY-MM-DD で返す */
const TZ_JAPAN = 'Asia/Tokyo'

function formatCalendarDateInTZ(date: Date, timeZone: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(date)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  if (!y || !m || !d) {
    throw new Error('Failed to format date in time zone')
  }
  return `${y}-${m}-${d}`
}

/** 指定した瞬間の、日本の暦日（YYYY-MM-DD） */
export function toISODate(d: Date): string {
  return formatCalendarDateInTZ(d, TZ_JAPAN)
}

/** 日本での「今日」の日付（YYYY-MM-DD） */
export function todayISO(): string {
  return toISODate(new Date())
}

/** date から n 日前の日付 */
export function daysAgo(date: Date, n: number): Date {
  const r = new Date(date)
  r.setDate(r.getDate() - n)
  return r
}
