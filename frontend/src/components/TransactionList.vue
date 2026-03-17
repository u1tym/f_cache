<script setup lang="ts">
import type { Transaction } from '../types'

defineProps<{
  items: Transaction[]
}>()

const emit = defineEmits<{
  select: [transaction: Transaction]
}>()

function formatDate(s: string): string {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${y}/${m}/${d}`
}
</script>

<template>
  <div class="table-wrap">
    <table class="transaction-table">
      <thead>
        <tr>
          <th>利用日</th>
          <th>目的</th>
          <th>金額</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
          class="row-click"
          @click="emit('select', item)"
        >
          <td>{{ formatDate(item.used_date) }}</td>
          <td>{{ item.purpose }}</td>
          <td class="amount">{{ item.amount.toLocaleString() }}</td>
        </tr>
        <tr v-if="items.length === 0">
          <td colspan="3" class="empty">データがありません</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow: auto;
  max-height: calc(100vh - 220px);
  -webkit-overflow-scrolling: touch;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.transaction-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-header-bg, #2c3e50);
  color: var(--color-header-text, #fff);
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.1);
}

.transaction-table th {
  padding: 12px 10px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.transaction-table th:nth-child(1) {
  width: 100px;
}
.transaction-table th:nth-child(2) {
  min-width: 120px;
}
.transaction-table th:nth-child(3) {
  width: 90px;
  text-align: right;
}

.transaction-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #e0e0e0;
}

.transaction-table td.amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.row-click {
  cursor: pointer;
  transition: background 0.15s;
}
.row-click:hover,
.row-click:active {
  background: #f0f4f8;
}

.empty {
  text-align: center;
  color: #888;
  padding: 24px !important;
}
</style>
