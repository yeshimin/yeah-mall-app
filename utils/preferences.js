const NOTIFICATION_PREFERENCES_KEY = 'yeah_mall_notification_preferences'
const PRIVACY_PREFERENCES_KEY = 'yeah_mall_privacy_preferences'

const defaultNotificationPreferences = {
  order: true,
  promotion: true,
  service: true
}

const defaultPrivacyPreferences = {
  personalizedRecommendation: true,
  browseHistory: true
}

function readPreferences(key, defaults) {
  const stored = uni.getStorageSync(key)
  return stored && typeof stored === 'object' ? { ...defaults, ...stored } : { ...defaults }
}

function writePreferences(key, value) {
  uni.setStorageSync(key, { ...value })
}

export function getNotificationPreferences() {
  return readPreferences(NOTIFICATION_PREFERENCES_KEY, defaultNotificationPreferences)
}

export function saveNotificationPreferences(value) {
  writePreferences(NOTIFICATION_PREFERENCES_KEY, value)
}

export function getPrivacyPreferences() {
  return readPreferences(PRIVACY_PREFERENCES_KEY, defaultPrivacyPreferences)
}

export function savePrivacyPreferences(value) {
  writePreferences(PRIVACY_PREFERENCES_KEY, value)
}
