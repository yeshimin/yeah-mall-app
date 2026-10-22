<template>
  <view class="settings-page">
    <view class="settings-group">
      <view class="setting-row" @click="openProfileEdit">
        <view>
          <text class="setting-title">个人资料</text>
          <text class="setting-desc">头像、昵称、性别和生日</text>
        </view>
        <text class="arrow">&gt;</text>
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
  background: #f7f8fa;
  box-sizing: border-box;
}

.settings-group {
  overflow: hidden;
  background: #fff;
  border-radius: 16rpx;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 116rpx;
  padding: 20rpx 28rpx;
}

.setting-title {
  display: block;
  color: #1f2937;
  font-size: 30rpx;
}

.setting-desc {
  display: block;
  margin-top: 8rpx;
  color: #9ca3af;
  font-size: 24rpx;
}

.arrow {
  color: #b0b6c1;
  font-size: 32rpx;
}

.logout-area {
  margin-top: 48rpx;
}

.logout-button {
  width: 100%;
  height: 88rpx;
  color: #df3d3d;
  font-size: 30rpx;
  line-height: 88rpx;
  background: #fff;
  border: 0;
  border-radius: 16rpx;
}
</style>
