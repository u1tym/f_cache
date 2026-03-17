export interface PaymentSource {
  id: number
  name: string
  closing_day: number
  pay_month_diff: number
  pay_day: number
}

export interface Transaction {
  id: number
  used_date: string
  purpose: string
  memo?: string
  amount: number
  payment_source_id: number
  paid_date: string
  budget_name: string
  payment_source_name?: string
}

export interface TransactionFormData {
  used_date: string
  purpose: string
  amount: number
  payment_source_id: number
  paid_date: string
  budget_name: string
  memo?: string
}
