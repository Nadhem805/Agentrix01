// Axios HTTP client with JWT interceptors — wired up in Phase 2
// Handles: auth header injection, 401 → token refresh → retry

// TODO: install axios and electron-store in Phase 2, then implement:
//
// import axios from 'axios'
// import type { AxiosInstance } from 'axios'
//
// export function createHttpClient(baseURL: string): AxiosInstance {
//   const client = axios.create({ baseURL, timeout: 30_000 })
//
//   client.interceptors.request.use((config) => {
//     const token = electronStore.get('accessToken')
//     if (token) config.headers.Authorization = `Bearer ${token}`
//     return config
//   })
//
//   client.interceptors.response.use(
//     (res) => res,
//     async (error) => {
//       if (error.response?.status === 401 && !error.config._retry) {
//         error.config._retry = true
//         // refresh token logic here
//       }
//       return Promise.reject(error)
//     }
//   )
//
//   return client
// }

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
