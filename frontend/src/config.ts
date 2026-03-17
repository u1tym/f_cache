/**
 * APIの起点（ベースURL）
 * 環境に応じて変更可能。
 * 開発時はプロキシ（/api → バックエンド）を使うとCORSを回避できます。
 */
export const API_BASE_URL =
  import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000'
