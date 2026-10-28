<template>
  <view class="settings-page">
    <view class="settings-group">
      <view class="setting-row" @click="openProfileEdit">
        <view>
          <text class="setting-title">个人资料</text>
          <text class="setting-desc">头像、昵称、性别和生日</text>
        </view>
        <view class="arrow"></view>
      </view>
      <view class="setting-row" @click="openNotifications">
        <view>
          <text class="setting-title">消息通知</text>
          <text class="setting-desc">订单、活动和客服提醒偏好</text>
        </view>
        <view class="arrow"></view>
      </view>
      <view class="setting-row" @click="openPrivacy">
        <view>
          <text class="setting-title">隐私设置</text>
          <text class="setting-desc">推荐与浏览足迹记录偏好</text>
        </view>
        <view class="arrow"></view>
      </view>
    </view>

    <view class="logout-area">
      <button class="logout-button" @click="confirmLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { clearAuthInfo, handleAuthFailure, isAuthenticated } from '../../utils/auth.js'

function openProfileEdit() {
  uni.navigateTo({ url: '/pages/profile/edit' })
}

function openNotifications() {
  uni.navigateTo({ url: '/pages/profile/notifications' })
}

function openPrivacy() {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

function confirmLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确认退出当前账号吗？',
    success: (result) => {
      if (!result.confirm) {
        return
      }
      clearAuthInfo()
      uni.reLaunch({ url: '/pages/login/index' })
    }
  })
}

onLoad(() => {
  if (!isAuthenticated()) {
    handleAuthFailure()
  }
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 24rpx;
  background: var(--ym-paper);
  box-sizing: border-box;
}

.settings-group {
  overflow: hidden;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.setting-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 116rpx;
  padding: 20rpx 28rpx;
}

.setting-row:not(:last-child)::after {
  position: absolute;
  right: 28rpx;
  bottom: 0;
  left: 28rpx;
  height: 1rpx;
  background: var(--ym-line);
  content: '';
}

.setting-title {
  display: block;
  color: var(--ym-ink);
  font-size: 30rpx;
  font-weight: 600;
}

.setting-desc {
  display: block;
  margin-top: 8rpx;
  color: var(--ym-muted);
  font-size: 24rpx;
}

.arrow {
  width: 14rpx;
  height: 14rpx;
  color: var(--ym-muted);
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}

.logout-area {
  margin-top: 48rpx;
}

.logout-button {
  width: 100%;
  height: 88rpx;
  color: var(--ym-price);
  font-size: 30rpx;
  line-height: 88rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-control);
  background: var(--ym-surface);
}

.logout-button::after {
  border: 0;
}
</style>
