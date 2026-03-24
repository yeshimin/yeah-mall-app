const DEFAULT_BASE_API = 'http://192.168.31.65:8080'
const DEFAULT_WS_PATH = '/ws/ns/default'
const DEFAULT_UPLOAD_PATH = '/app/storage/upload'
const DEFAULT_PREVIEW_PATH = '/public/storage/preview'

function getEnv(name) {
  if (typeof process === 'undefined' || !process.env) {
    return ''
  }

  return process.env[name] || ''
}

function trimTrailingSlash(value = '') {
  return value.replace(/\/+$/, '')
}

function ensureLeadingSlash(value = '') {
  return value.startsWith('/') ? value : `/${value}`
}

function resolveWsBaseUrl(apiBaseUrl) {
  const configuredWsUrl = trimTrailingSlash(
    getEnv('VITE_WS_BASE_URL') || getEnv('UNI_APP_WS_BASE_URL')
  )

  if (!configuredWsUrl) {
    return `${apiBaseUrl.replace(/^http/i, 'ws')}${DEFAULT_WS_PATH}`
  }

  if (configuredWsUrl.includes('/ws/')) {
    return configuredWsUrl
  }

  return `${configuredWsUrl}${DEFAULT_WS_PATH}`
}

function resolvePath(envName, fallback) {
  const configuredPath = trimTrailingSlash(getEnv(envName))
  if (!configuredPath) {
    return fallback
  }

  return ensureLeadingSlash(configuredPath)
}

export const BASE_API = trimTrailingSlash(
  getEnv('VITE_BASE_API') || getEnv('UNI_APP_BASE_API') || DEFAULT_BASE_API
)

export const BASE_WS = resolveWsBaseUrl(BASE_API)
export const STORAGE_UPLOAD_PATH = resolvePath('VITE_STORAGE_UPLOAD_PATH', DEFAULT_UPLOAD_PATH)
export const STORAGE_PREVIEW_PATH = resolvePath('VITE_STORAGE_PREVIEW_PATH', DEFAULT_PREVIEW_PATH)
export const STORAGE_UPLOAD_URL = `${BASE_API}${STORAGE_UPLOAD_PATH}`

export function buildApiUrl(path) {
  return `${BASE_API}${ensureLeadingSlash(path)}`
}

export function getStoragePreviewUrl(fileKey) {
  if (!fileKey) {
    return ''
  }

  return `${BASE_API}${STORAGE_PREVIEW_PATH}?fileKey=${encodeURIComponent(fileKey)}`
}

