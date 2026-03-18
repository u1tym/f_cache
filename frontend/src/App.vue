<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TransactionList from './components/TransactionList.vue'
import TransactionForm from './components/TransactionForm.vue'
import PaymentSummary from './components/PaymentSummary.vue'
import type { PaymentSource, Transaction, TransactionFormData } from './types'
import {
  getPaymentSources,
  searchByUsedDate,
  searchByPaidDate,
  createTransaction,
  updateTransaction,
} from './api/client'
import { todayISO, toISODate, daysAgo } from './utils/date'

const title = '収支管理'
const todayLabel = ref('')
const transactions = ref<Transaction[]>([])
const paymentSources = ref<PaymentSource[]>([])
const formVisible = ref(false)
const editItem = ref<Transaction | null>(null)
const loading = ref(false)
const error = ref('')

type PaidSummaryItem = {
  payment_source_name: string
  paid_date: string
  total_amount: number
}

const summaryVisible = ref(false)
const summaryLoading = ref(false)
const summaryError = ref('')
const summaryItems = ref<PaidSummaryItem[]>([])

function setTodayLabel() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const week = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  todayLabel.value = `${y}年${m}月${day}日（${week}）`
}

async function loadList() {
  const end = new Date()
  const start = daysAgo(end, 60)
  const dateFrom = toISODate(start)
  const dateTo = todayISO()
  loading.value = true
  error.value = ''
  try {
    const res = await searchByUsedDate(dateFrom, dateTo)
    transactions.value = [...res.items].sort((a, b) => {
      if (a.used_date === b.used_date) {
        return b.id - a.id
      }
      return a.used_date < b.used_date ? 1 : -1
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : '一覧の取得に失敗しました'
    transactions.value = []
  } finally {
    loading.value = false
  }
}

async function loadPaymentSources() {
  try {
    const res = await getPaymentSources()
    paymentSources.value = res.items
  } catch {
    paymentSources.value = []
  }
}

async function loadSummary() {
  summaryLoading.value = true
  summaryError.value = ''
  summaryItems.value = []
  const from = todayISO()
  const to = '9999-12-31'
  try {
    if (!paymentSources.value.length) {
      await loadPaymentSources()
    }
    const targetSourceIds = new Set(
      paymentSources.value
        .filter((ps) => ps.closing_day !== 0)
        .map((ps) => ps.id)
    )
    const res = await searchByPaidDate(from, to)
    const map = new Map<string, { payment_source_name: string; paid_date: string; total_amount: number }>()
    for (const t of res.items) {
      if (!targetSourceIds.has(t.payment_source_id)) {
        continue
      }
      const key = `${t.payment_source_id}:${t.paid_date}`
      const cur = map.get(key)
      const name = t.payment_source_name ?? ''
      if (cur) {
        map.set(key, { ...cur, total_amount: cur.total_amount + t.amount })
      } else {
        map.set(key, { payment_source_name: name, paid_date: t.paid_date, total_amount: t.amount })
      }
    }
    summaryItems.value = Array.from(map.values()).sort(
      (a, b) => (a.paid_date < b.paid_date ? -1 : a.paid_date > b.paid_date ? 1 : 0)
    )
  } catch (e) {
    summaryError.value =
      e instanceof Error ? e.message : '支払日ごとの合計の取得に失敗しました'
  } finally {
    summaryLoading.value = false
  }
}

onMounted(() => {
  setTodayLabel()
  loadPaymentSources()
  loadList()
})

function openNewForm() {
  editItem.value = null
  formVisible.value = true
}

function openEditForm(item: Transaction) {
  editItem.value = item
  formVisible.value = true
}

function closeForm() {
  formVisible.value = false
  editItem.value = null
}

function openSummary() {
  summaryVisible.value = true
  loadSummary()
}

function closeSummary() {
  summaryVisible.value = false
}

async function handleSubmit(data: TransactionFormData) {
  error.value = ''
  try {
    if (editItem.value) {
      await updateTransaction(editItem.value.id, data)
    } else {
      await createTransaction(data)
    }
    closeForm()
    await loadList()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存に失敗しました'
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-main">
        <div>
          <h1 class="title">{{ title }}</h1>
          <p class="today">{{ todayLabel }}</p>
        </div>
        <button type="button" class="btn-summary" @click="openSummary">
          支払日ごとの合計
        </button>
      </div>
    </header>

    <main class="main">
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="loading">読み込み中...</p>
      <TransactionList
        v-else
        :items="transactions"
        @select="openEditForm"
      />
    </main>

    <button
      type="button"
      class="fab"
      aria-label="収支を入力"
      @click="openNewForm"
    >
      <span class="fab-icon">+</span>
    </button>

    <TransactionForm
      :payment-sources="paymentSources"
      :edit-item="editItem"
      :visible="formVisible"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <PaymentSummary
      :visible="summaryVisible"
      :loading="summaryLoading"
      :error="summaryError"
      :items="summaryItems"
      @close="closeSummary"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f4f8;
  --color-header-bg: #c4b5d4;
  --color-header-text: #3d3548;
}

.header {
  background: var(--color-header-bg);
  color: var(--color-header-text);
  padding: 16px 20px;
  flex-shrink: 0;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title {
  margin: 0 0 4px 0;
  font-size: 1.35rem;
  font-weight: 600;
}

.today {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.95;
}

.btn-summary {
  flex-shrink: 0;
  padding: 8px 12px;
  font-size: 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(61, 53, 72, 0.35);
  background: rgba(255, 255, 255, 0.6);
  color: #3d3548;
  cursor: pointer;
}

.main {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.error {
  color: #b85c6c;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
}

.loading {
  color: #7a6f85;
  margin: 12px 0;
}

.fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #b8d4e3;
  color: #3d3548;
  box-shadow: 0 4px 12px rgba(147, 181, 198, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.fab:active {
  transform: scale(0.96);
}

.fab-icon {
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 300;
}
</style>
