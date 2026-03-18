/**
 * APIの起点（ベースURL）
 * 環境変数 VITE_CACHEAPI_BASE_URL で指定可能。未設定時は開発時は /api（プロキシ）、それ以外は http://127.0.0.1:8000。
 */
export const API_BASE_URL =
  typeof import.meta.env.VITE_CACHEAPI_BASE_URL === 'string' &&
  import.meta.env.VITE_CACHEAPI_BASE_URL !== ''
    ? import.meta.env.VITE_CACHEAPI_BASE_URL
    : import.meta.env.DEV
      ? '/api'
      : 'http://127.0.0.1:8000'
