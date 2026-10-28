<template>
  <view class="profile-container">
    <!-- 个人信息区域 -->
    <view class="profile-header" @click="editProfile">
      <view class="user-info">
        <image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
        <view class="user-details">
          <text class="user-name">{{ userInfo.nickname }}</text>
          <text class="user-meta">普通会员 · ID {{ userInfo.id || '-' }}</text>
        </view>
      </view>
      <view class="edit-arrow"></view>
    </view>
    
    <!-- 订单管理 -->
    <view class="section">
      <view class="section-header" @click="viewAllOrders">
        <text class="section-title">我的订单</text>
        <view class="section-more">查看全部订单</view>
      </view>
      <view class="order-stats">
        <view class="stat-item" v-for="(stat, index) in orderStats" :key="index" @click="viewOrdersByStatus(index)">
          <view class="stat-icon-box">
            <text class="stat-symbol">{{ stat.icon }}</text>
            <text v-if="stat.count > 0" class="stat-count">{{ stat.count }}</text>
          </view>
          <text class="stat-label">{{ stat.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能入口 -->
    <view class="section">
      <view class="function-grid">
        <view class="function-item" v-for="(func, index) in functions" :key="index" @click="useFunction(index)">
          <text class="function-icon">{{ func.short }}</text>
          <text class="function-text">{{ func.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 其他功能 -->
    <view class="section">
      <view class="list-item" v-for="(setting, index) in settings" :key="index" @click="openSetting(index)">
        <text class="list-item-text">{{ setting.name }}</text>
        <view class="list-item-arrow"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchOrderCounts, fetchUserDetail } from '../../utils/api.js'
import { handleAuthFailure, isAuthenticated } from '../../utils/auth.js'
import { getStoragePreviewUrl } from '../../utils/config.js'

const userInfo = reactive({
  id: '',
  nickname: '用户名',
  avatarUrl: '../../static/logo.png',
  mobile: '',
  account: '',
  gender: 0,
  birthday: ''
})

const orderStats = reactive([
  { name: '待付款', icon: '单', key: 'waitPayCount', count: 0 },
  { name: '待发货', icon: '箱', key: 'waitShipCount', count: 0 },
  { name: '待收货', icon: '运', key: 'waitReceiveCount', count: 0 },
  { name: '待评价', icon: '评', key: 'waitCommentCount', count: 0 },
  { name: '退款/售后', icon: '售', key: 'refundAndAfterSaleCount', count: 0 }
])

const functions = [
  { name: '优惠券', short: '券' },
  { name: '积分', short: '分' },
  { name: '收藏', short: '藏' },
  { name: '地址', short: '址' }
]

const settings = [
  { name: '消息中心' },
  { name: '客服中心' },
  { name: '浏览足迹' },
  { name: '意见反馈' },
  { name: '关于我们' },
  { name: '设置' }
]

function loadUserInfo() {
  fetchUserDetail()
    .then((data) => {
      Object.assign(userInfo, {
        id: data.id || '',
        nickname: data.nickname || data.mobile || '用户名',
        avatarUrl: getStoragePreviewUrl(data.avatar) || '../../static/logo.png',
        mobile: data.mobile || '',
        account: data.account || '',
        gender: data.gender || 0,
        birthday: data.birthday || ''
      })
    })
    .catch((error) => {
      if (error && error.message === 'AUTH_401') {
        return
      }
      console.error('获取用户信息失败', error)
    })
}

function viewAllOrders() {
  uni.navigateTo({
    url: '/pages/order/list'
  })
}

function viewOrdersByStatus(index) {
  let status = 0
  if (index === 0) status = 1
  else if (index === 1) status = 2
  else if (index === 2) status = 3
  else if (index === 3) status = 5
  else if (index === 4) status = 4

  uni.navigateTo({
    url: `/pages/order/list?status=${status}`
  })
}

function loadOrderCounts() {
  fetchOrderCounts()
    .then((data) => {
      orderStats.forEach((stat) => {
        stat.count = data && data[stat.key] != null ? data[stat.key] : 0
      })
    })
    .catch((error) => {
      if (error && error.message === 'AUTH_401') {
        return
      }
      console.error('获取订单数量失败', error)
      uni.showToast({
        title: '获取订单数量失败',
        icon: 'none'
      })
    })
}

function useFunction(index) {
  if (index === 0) {
    uni.navigateTo({
      url: '/pages/coupons/list'
    })
  } else if (index === 1) {
    uni.navigateTo({ url: '/pages/profile/points' })
  } else if (index === 2) {
    uni.navigateTo({ url: '/pages/profile/favorites' })
  } else if (index === 3) {
    uni.navigateTo({
      url: '/pages/address/list'
    })
  }
}

function openSetting(index) {
  if (settings[index].name === '客服中心') {
    uni.navigateTo({
      url: '/pages/customer-service/index'
    })
    return
  }

  if (settings[index].name === '浏览足迹') {
    uni.navigateTo({ url: '/pages/profile/browse-history' })
    return
  }

  if (settings[index].name === '设置') {
    uni.navigateTo({
      url: '/pages/profile/settings'
    })
    return
  }

  if (settings[index].name === '意见反馈') {
    uni.navigateTo({ url: '/pages/profile/feedback' })
    return
  }

  if (settings[index].name === '关于我们') {
    uni.navigateTo({ url: '/pages/profile/about' })
    return
  }

  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

function editProfile() {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}

onShow(() => {
  if (!isAuthenticated()) {
    handleAuthFailure()
    return
  }

  loadUserInfo()
  loadOrderCounts()
})
</script>

<style scoped>
.profile-container {
  height: 100vh;
  background-color: #f5f5f5;
  padding-top: var(--status-bar-height);
}

.profile-header {
  background-color: white;
  padding: 40rpx 30rpx;
  margin: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-arrow {
  width: 14rpx;
  height: 14rpx;
  color: #999;
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.section {
  background-color: white;
  margin: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.section-more::after {
  width: 10rpx;
  height: 10rpx;
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  content: '';
  transform: rotate(45deg);
}

.order-stats {
  display: flex;
  padding: 30rpx 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.stat-count {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b35;
}

.function-grid {
  display: flex;
  padding: 30rpx 0;
}

.function-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.function-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #ffeee6;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  color: #ff6b35;
  margin-bottom: 15rpx;
}

.function-text {
  font-size: 24rpx;
  color: #666;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-text {
  font-size: 28rpx;
  color: #333;
}

.list-item-arrow {
  width: 12rpx;
  height: 12rpx;
  color: #999;
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}
</style>

<style scoped>
.profile-container {
  min-height: 100%;
  height: auto;
  padding-top: 0;
  padding-bottom: calc(var(--window-bottom) + 24rpx);
  background: var(--ym-paper);
}

.profile-header {
  margin: 0;
  padding: 40rpx 28rpx 68rpx;
  border-radius: 0;
  background: var(--ym-ink);
  box-shadow: none;
}

.user-avatar {
  width: 104rpx;
  height: 104rpx;
  margin-right: 24rpx;
  border: 0;
  border-radius: 20rpx;
  background: var(--ym-brand-soft);
}

.user-name {
  margin-bottom: 6rpx;
  color: #fff;
  font-size: 36rpx;
}

.user-meta {
  color: rgba(255, 255, 255, 0.64);
  font-size: 22rpx;
}

.edit-arrow {
  color: rgba(255, 255, 255, 0.78);
}

.section {
  margin: 18rpx 24rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
  box-shadow: none;
}

.profile-header + .section {
  margin-top: -34rpx;
}

.section-header {
  padding: 24rpx;
  border-bottom-color: #edf0ed;
}

.section-title {
  color: var(--ym-ink);
  font-size: 30rpx;
}

.section-more {
  color: var(--ym-muted);
  font-size: 23rpx;
}

.order-stats {
  padding: 26rpx 8rpx 28rpx;
}

.stat-item {
  gap: 10rpx;
}

.stat-icon-box {
  position: relative;
  display: flex;
  width: 56rpx;
  height: 56rpx;
  align-items: center;
  justify-content: center;
  color: var(--ym-brand);
  border: 1rpx solid var(--ym-line);
  border-radius: 16rpx;
  background: var(--ym-brand-soft);
}

.stat-symbol {
  font-size: 23rpx;
  font-weight: 700;
}

.stat-count {
  position: absolute;
  top: -10rpx;
  right: -12rpx;
  display: flex;
  min-width: 28rpx;
  height: 28rpx;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 7rpx;
  color: #fff;
  border: 3rpx solid var(--ym-surface);
  border-radius: 16rpx;
  background: var(--ym-price);
  font-size: 18rpx;
  font-weight: 700;
}

.stat-label {
  color: var(--ym-ink-secondary);
  font-size: 22rpx;
  white-space: nowrap;
}

.function-grid {
  padding: 24rpx 8rpx 28rpx;
}

.function-item {
  gap: 10rpx;
}

.function-icon {
  width: 68rpx;
  height: 68rpx;
  margin-bottom: 0;
  color: var(--ym-brand);
  border-radius: 20rpx;
  background: var(--ym-brand-soft);
  font-size: 24rpx;
  font-weight: 700;
}

.function-text {
  color: var(--ym-ink-secondary);
  font-size: 23rpx;
}

.list-item {
  min-height: 92rpx;
  box-sizing: border-box;
  padding: 0 26rpx;
  border-bottom-color: #edf0ed;
}

.list-item-text {
  color: var(--ym-ink);
  font-size: 27rpx;
}

.list-item-arrow {
  color: var(--ym-muted);
}
</style>
