<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PaymentSource, Transaction, TransactionFormData } from '../types'
import { calcPaidDate } from '../api/client'
import { todayISO } from '../utils/date'

const props = defineProps<{
  paymentSources: PaymentSource[]
  editItem: Transaction | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: TransactionFormData]
}>()

const usedDate = ref(todayISO())
const purpose = ref('')
const memo = ref('')
const amount = ref<number | ''>('')
const paymentSourceId = ref<number | ''>('')
const paidDate = ref(todayISO())
const budgetName = '未分類'

/** 支出元選択時に支払日をAPIで算出 */
async function updatePaidDateFromSource() {
  const pid = paymentSourceId.value
  const ud = usedDate.value
  if (pid === '' || !ud) return
  try {
    const { paid_date } = await calcPaidDate(ud, pid as number)
    paidDate.value = paid_date
  } catch {
    // 404などは無視（手動で支払日を変えられる）
  }
}

watch(
  () => [usedDate.value, paymentSourceId.value] as const,
  () => updatePaidDateFromSource(),
  { immediate: false }
)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      if (props.editItem) {
        usedDate.value = props.editItem.used_date
        purpose.value = props.editItem.purpose
        memo.value = props.editItem.memo ?? ''
        amount.value = props.editItem.amount
        paymentSourceId.value = props.editItem.payment_source_id
        paidDate.value = props.editItem.paid_date
      } else {
        usedDate.value = todayISO()
        purpose.value = ''
        memo.value = ''
        amount.value = ''
        paymentSourceId.value = props.paymentSources[0]?.id ?? ''
        paidDate.value = todayISO()
        const pid = paymentSourceId.value
        if (typeof pid === 'number') {
          updatePaidDateFromSource()
        }
      }
    }
  }
)

watch(
  () => props.editItem,
  (item) => {
    if (item) {
      usedDate.value = item.used_date
      purpose.value = item.purpose
      memo.value = item.memo ?? ''
      amount.value = item.amount
      paymentSourceId.value = item.payment_source_id
      paidDate.value = item.paid_date
    }
  },
  { immediate: true }
)

function handleSubmit() {
  const pid = paymentSourceId.value
  const amt = amount.value
  if (pid === '' || amt === '' || purpose.value.trim() === '') {
    alert('利用日・目的・金額・支出元を入力してください。')
    return
  }
  const numAmount = typeof amt === 'number' ? amt : Number(amt)
  if (Number.isNaN(numAmount) || numAmount < 0) {
    alert('金額は0以上の数値を入力してください。')
    return
  }
  emit('submit', {
    used_date: usedDate.value,
    purpose: purpose.value.trim(),
    amount: numAmount,
    payment_source_id: pid as number,
    paid_date: paidDate.value,
    budget_name: budgetName,
    memo: normalizeMemo(memo.value),
  })
}

/** 改行（\n / \r\n）を保持しつつ前後の空白だけ除去 */
function normalizeMemo(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="overlay" @click.self="handleClose">
    <div class="form-panel">
      <div class="form-header">
        <h2>{{ editItem ? '収支編集' : '収支入力' }}</h2>
        <button type="button" class="btn-close" aria-label="閉じる" @click="handleClose">×</button>
      </div>
      <form class="form-body" @submit.prevent="handleSubmit">
        <label>
          <span>利用日</span>
          <input v-model="usedDate" type="date" required />
        </label>
        <label>
          <span>目的</span>
          <input v-model="purpose" type="text" placeholder="例: 食費" required />
        </label>
        <label>
          <span>メモ</span>
          <textarea
            v-model="memo"
            rows="5"
            placeholder="任意（改行可）"
            enterkeyhint="enter"
            class="field-memo"
          />
        </label>
        <label>
          <span>金額</span>
          <input
            v-model="amount"
            type="number"
            min="0"
            step="1"
            inputmode="numeric"
            placeholder="0"
            required
          />
        </label>
        <label>
          <span>支出元</span>
          <select v-model="paymentSourceId" required>
            <option value="">選択してください</option>
            <option
              v-for="ps in paymentSources"
              :key="ps.id"
              :value="ps.id"
            >
              {{ ps.name }}
            </option>
          </select>
        </label>
        <label>
          <span>支払日</span>
          <input v-model="paidDate" type="date" required />
        </label>
        <p class="budget-note">予算名: 未分類（固定）</p>
        <div class="form-actions">
          <button type="button" class="btn btn-cancel" @click="handleClose">キャンセル</button>
          <button type="submit" class="btn btn-submit">入力確定</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(196, 181, 212, 0.35);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 0;
}

.form-panel {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fefcfe;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(122, 111, 133, 0.2);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e2ec;
}

.form-header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #3d3548;
}

.btn-close {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  color: #7a6f85;
  cursor: pointer;
  border-radius: 50%;
}

.btn-close:hover,
.btn-close:active {
  background: #efe9f2;
}

.form-body {
  padding: 20px;
}

.form-body label {
  display: block;
  margin-bottom: 16px;
}

.form-body label span {
  display: block;
  font-size: 0.85rem;
  color: #5a5466;
  margin-bottom: 4px;
}

.form-body input,
.form-body select,
.form-body textarea {
  width: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid #d4cce0;
  border-radius: 8px;
  box-sizing: border-box;
  background: #fff;
}

.form-body textarea.field-memo {
  resize: vertical;
  min-height: 6.5em;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.form-body input:focus,
.form-body select:focus,
.form-body textarea:focus {
  outline: none;
  border-color: #b8a8c8;
  box-shadow: 0 0 0 2px rgba(196, 181, 212, 0.35);
}

.budget-note {
  font-size: 0.8rem;
  color: #9a8fa8;
  margin: 8px 0 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel {
  background: #e8e2ec;
  color: #3d3548;
}

.btn-submit {
  background: #b8d4e3;
  color: #3d3548;
}

.btn-submit:hover,
.btn-submit:active {
  background: #a8c4d3;
}
</style>
