// 全局接口基础地址
// 仅使用 process.env，避免小程序端引入 import.meta 触发对 Node 模块 url 的依赖
let baseApi = 'http://localhost:8080';
if (typeof process !== 'undefined' && process.env) {
  baseApi = process.env.VITE_BASE_API || process.env.UNI_APP_BASE_API || baseApi;
}

export const BASE_API = baseApi;


