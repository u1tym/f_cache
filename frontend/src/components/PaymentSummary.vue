<script setup lang="ts">
defineProps<{
  visible: boolean
  loading: boolean
  error: string
  items: { payment_source_name: string; paid_date: string; total_amount: number }[]
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
        <h2>支払予定集計</h2>
        <button type="button" class="btn-close" @click="emit('close')">×</button>
      </header>
      <div class="panel-body">
        <p v-if="loading" class="status">読み込み中...</p>
        <p v-else-if="error" class="status error">{{ error }}</p>
        <ul v-else class="list">
          <li v-for="(item, i) in items" :key="`${item.payment_source_name}-${item.paid_date}-${i}`" class="row">
            <span class="label">{{ item.payment_source_name }}　{{ formatDate(item.paid_date) }}</span>
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
  background: rgba(196, 181, 212, 0.4);
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
  background: #fefcfe;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(122, 111, 133, 0.2);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e8e2ec;
  background: #f5f0f8;
  border-radius: 12px 12px 0 0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  color: #3d3548;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  color: #7a6f85;
  cursor: pointer;
}

.btn-close:hover,
.btn-close:active {
  background: #efe9f2;
}

.panel-body {
  padding: 12px 16px 16px;
  overflow-y: auto;
}

.status {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #7a6f85;
}

.status.error {
  color: #b85c6c;
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
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #e8e2ec;
  font-size: 0.9rem;
}

.label {
  color: #3d3548;
  flex: 1;
  min-width: 0;
}

.amount {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #5a5466;
}

.empty {
  padding: 16px 0;
  text-align: center;
  color: #9a8fa8;
  font-size: 0.85rem;
}
</style>

