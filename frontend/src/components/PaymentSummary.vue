<script setup lang="ts">
defineProps<{
  visible: boolean
  loading: boolean
  error: string
  items: { paid_date: string; total_amount: number }[]
}>()

const emit = defineEmits<{
  close: []
}>()

function formatDate(s: string): string {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${y}/${m}/${d}`
}
</script>

<template>
  <div v-if="visible" class="overlay" @click.self="emit('close')">
    <div class="panel">
      <header class="panel-header">
        <h2>支払日ごとの合計</h2>
        <button type="button" class="btn-close" @click="emit('close')">×</button>
      </header>
      <div class="panel-body">
        <p class="note">
          支払日が今日以降の取引のうち、締日が0ではない支払元に紐づくものだけを支払日ごとに合計しています。
        </p>
        <p v-if="loading" class="status">読み込み中...</p>
        <p v-else-if="error" class="status error">{{ error }}</p>
        <ul v-else class="list">
          <li v-for="item in items" :key="item.paid_date" class="row">
            <span class="date">{{ formatDate(item.paid_date) }}</span>
            <span class="amount">{{ item.total_amount.toLocaleString() }} 円</span>
          </li>
          <li v-if="items.length === 0" class="empty">対象となる支払日はありません</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.panel {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
}

.panel-body {
  padding: 12px 16px 16px;
  overflow-y: auto;
}

.note {
  font-size: 0.75rem;
  color: #666;
  margin: 0 0 10px 0;
}

.status {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #666;
}

.status.error {
  color: #c0392b;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.date {
  color: #333;
}

.amount {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.empty {
  padding: 16px 0;
  text-align: center;
  color: #888;
  font-size: 0.85rem;
}
</style>

