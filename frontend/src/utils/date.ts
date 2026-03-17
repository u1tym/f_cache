/** ISO日付文字列 (YYYY-MM-DD) を返す */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** 今日の日付文字列 */
export function todayISO(): string {
  return toISODate(new Date())
}

/** date から n 日前の日付 */
export function daysAgo(date: Date, n: number): Date {
  const r = new Date(date)
  r.setDate(r.getDate() - n)
  return r
}
