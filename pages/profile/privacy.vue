<template>
  <view class="preference-page">
    <view class="preference-card">
      <view class="preference-row">
        <view class="preference-copy">
          <text class="preference-title">个性化商品推荐</text>
          <text class="preference-desc">关闭后首页继续展示平台通用热门商品</text>
        </view>
        <switch :checked="preferences.personalizedRecommendation" color="#24634f" @change="changePreference('personalizedRecommendation', $event.detail.value)" />
      </view>
      <view class="preference-row">
        <view class="preference-copy">
          <text class="preference-title">记录浏览足迹</text>
          <text class="preference-desc">关闭后新查看的普通商品不再写入浏览足迹</text>
        </view>
        <switch :checked="preferences.browseHistory" color="#24634f" @change="changePreference('browseHistory', $event.detail.value)" />
      </view>
    </view>
    <view class="info-card">
      <text class="info-title">数据使用说明</text>
      <text>订单、支付、退款、收货地址和客服会话等信息仍会按照完成交易与提供服务的必要范围处理。</text>
      <text>当前设置保存在本机，清理应用数据或更换设备后需要重新设置。</text>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPrivacyPreferences, savePrivacyPreferences } from '@/utils/preferences.js'

const preferences = reactive(getPrivacyPreferences())

function changePreference(key, value) {
  preferences[key] = value
  savePrivacyPreferences(preferences)
}

onLoad(() => Object.assign(preferences, getPrivacyPreferences()))
</script>

<style scoped>
.preference-page { min-height: 100vh; box-sizing: border-box; padding: 24rpx; background: var(--ym-paper); }
.preference-card, .info-card { overflow: hidden; border: 1rpx solid var(--ym-line); border-radius: var(--ym-radius-card); background: var(--ym-surface); }
.preference-row { position: relative; display: flex; min-height: 116rpx; align-items: center; justify-content: space-between; gap: 24rpx; padding: 20rpx 28rpx; }
.preference-row:not(:last-child)::after { position: absolute; right: 28rpx; bottom: 0; left: 28rpx; height: 1rpx; background: var(--ym-line); content: ''; }
.preference-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 8rpx; }.preference-title { color: var(--ym-ink); font-size: 29rpx; font-weight: 600; }.preference-desc { color: var(--ym-muted); font-size: 23rpx; line-height: 1.45; }
.info-card { display: flex; flex-direction: column; gap: 12rpx; margin-top: 20rpx; padding: 24rpx 28rpx; color: var(--ym-muted); font-size: 24rpx; line-height: 1.65; }.info-title { color: var(--ym-ink); font-size: 27rpx; font-weight: 700; }
</style>
