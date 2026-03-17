import { API_BASE_URL } from '../config'
import type { PaymentSource, Transaction, TransactionFormData } from '../types'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** 支出元一覧 */
export async function getPaymentSources(): Promise<{ items: PaymentSource[] }> {
  return request<{ items: PaymentSource[] }>('/payment-sources')
}

/** 利用日・支出元から支払日算出 */
export async function calcPaidDate(
  usedDate: string,
  paymentSourceId: number
): Promise<{ paid_date: string }> {
  return request<{ paid_date: string }>('/calc-paid-date', {
    method: 'POST',
    body: JSON.stringify({
      used_date: usedDate,
      payment_source_id: paymentSourceId,
    }),
  })
}

/** 収支登録 */
export async function createTransaction(
  data: TransactionFormData
): Promise<Transaction> {
  return request<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      used_date: data.used_date,
      purpose: data.purpose,
      memo: data.memo ?? '',
      amount: data.amount,
      payment_source_id: data.payment_source_id,
      paid_date: data.paid_date,
      budget_name: data.budget_name || '未分類',
    }),
  })
}

/** 収支1件取得 */
export async function getTransaction(id: number): Promise<Transaction> {
  return request<Transaction>(`/transactions/${id}`)
}

/** 収支更新 */
export async function updateTransaction(
  id: number,
  data: Partial<TransactionFormData>
): Promise<{ message: string }> {
  return request<{ message: string }>('/transactions', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  })
}

/** 利用日期間で収支一覧取得 */
export async function searchByUsedDate(
  dateFrom: string,
  dateTo: string
): Promise<{ items: Transaction[] }> {
  return request<{ items: Transaction[] }>(
    '/transactions/search-by-used-date',
    {
      method: 'POST',
      body: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
    }
  )
}

/** 支払日期間で収支一覧取得 */
export async function searchByPaidDate(
  dateFrom: string,
  dateTo: string
): Promise<{ items: Transaction[] }> {
  return request<{ items: Transaction[] }>(
    '/transactions/search-by-paid-date',
    {
      method: 'POST',
      body: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
    }
  )
}
