<template>
  <view class="preference-page">
    <view class="preference-card">
      <view v-for="item in items" :key="item.key" class="preference-row">
        <view class="preference-copy">
          <text class="preference-title">{{ item.title }}</text>
          <text class="preference-desc">{{ item.description }}</text>
        </view>
        <switch :checked="preferences[item.key]" color="#24634f" @change="changePreference(item.key, $event.detail.value)" />
      </view>
    </view>
    <view class="info-card">
      <text class="info-title">提醒说明</text>
      <text>此处保存当前设备的应用内提醒偏好。微信订阅消息仍需在微信授权弹窗中单独确认。</text>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNotificationPreferences, saveNotificationPreferences } from '@/utils/preferences.js'

const preferences = reactive(getNotificationPreferences())
const items = [
  { key: 'order', title: '订单状态通知', description: '支付、发货、退款和订单状态变化' },
  { key: 'promotion', title: '营销活动通知', description: '优惠券、秒杀和拼团活动提醒' },
  { key: 'service', title: '客服消息通知', description: '客服回复和会话消息提醒' }
]

function changePreference(key, value) {
  preferences[key] = value
  saveNotificationPreferences(preferences)
}

onLoad(() => Object.assign(preferences, getNotificationPreferences()))
</script>

<style scoped>
.preference-page { min-height: 100vh; box-sizing: border-box; padding: 24rpx; background: var(--ym-paper); }
.preference-card, .info-card { overflow: hidden; border: 1rpx solid var(--ym-line); border-radius: var(--ym-radius-card); background: var(--ym-surface); }
.preference-row { position: relative; display: flex; min-height: 116rpx; align-items: center; justify-content: space-between; gap: 24rpx; padding: 20rpx 28rpx; }
.preference-row:not(:last-child)::after { position: absolute; right: 28rpx; bottom: 0; left: 28rpx; height: 1rpx; background: var(--ym-line); content: ''; }
.preference-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 8rpx; }.preference-title { color: var(--ym-ink); font-size: 29rpx; font-weight: 600; }.preference-desc { color: var(--ym-muted); font-size: 23rpx; line-height: 1.45; }
.info-card { display: flex; flex-direction: column; gap: 12rpx; margin-top: 20rpx; padding: 24rpx 28rpx; color: var(--ym-muted); font-size: 24rpx; line-height: 1.6; }.info-title { color: var(--ym-ink); font-size: 27rpx; font-weight: 700; }
</style>
