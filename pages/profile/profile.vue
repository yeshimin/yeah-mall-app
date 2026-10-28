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
            <image class="stat-symbol" :src="stat.icon" mode="aspectFit" />
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
          <view class="function-icon">
            <image :src="func.icon" mode="aspectFit" />
          </view>
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
  { name: '待付款', icon: '/static/icons/order.png', key: 'waitPayCount', count: 0 },
  { name: '待发货', icon: '/static/icons/box.png', key: 'waitShipCount', count: 0 },
  { name: '待收货', icon: '/static/icons/truck.png', key: 'waitReceiveCount', count: 0 },
  { name: '待评价', icon: '/static/icons/review.png', key: 'waitCommentCount', count: 0 },
  { name: '退款/售后', icon: '/static/icons/aftersale.png', key: 'refundAndAfterSaleCount', count: 0 }
])

const functions = [
  { name: '优惠券', icon: '/static/quick/coupon.png' },
  { name: '积分', icon: '/static/quick/points.png' },
  { name: '收藏', icon: '/static/icons/heart.png' },
  { name: '地址', icon: '/static/icons/location.png' }
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
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: calc(var(--window-bottom, 0px) + 24rpx);
  background: var(--ym-paper);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  margin: 0;
  padding: 40rpx 28rpx 68rpx;
  border-radius: 0;
  background: var(--ym-ink);
  box-shadow: none;
}

.user-info {
  display: flex;
  min-width: 0;
  align-items: center;
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
  display: block;
  overflow: hidden;
  margin-bottom: 6rpx;
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-meta {
  display: block;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.64);
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-details {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.edit-arrow {
  width: 14rpx;
  height: 14rpx;
  flex: 0 0 auto;
  margin-left: 20rpx;
  color: rgba(255, 255, 255, 0.78);
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}

.section {
  overflow: hidden;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
}

.section-header::after {
  position: absolute;
  right: 24rpx;
  bottom: 0;
  left: 24rpx;
  height: 1rpx;
  background: var(--ym-line);
  content: '';
}

.section-title {
  color: var(--ym-ink);
  font-size: 30rpx;
  font-weight: 700;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
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
  padding: 26rpx 8rpx 28rpx;
}

.stat-item {
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
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
  width: 32rpx;
  height: 32rpx;
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
  display: flex;
  padding: 24rpx 8rpx 28rpx;
}

.function-item {
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  gap: 10rpx;
}

.function-icon {
  display: flex;
  width: 68rpx;
  height: 68rpx;
  margin-bottom: 0;
  align-items: center;
  justify-content: center;
  color: var(--ym-brand);
  border-radius: 20rpx;
  background: var(--ym-brand-soft);
  font-size: 24rpx;
  font-weight: 700;
}

.function-icon image {
  width: 38rpx;
  height: 38rpx;
}

.function-text {
  color: var(--ym-ink-secondary);
  font-size: 23rpx;
}

.list-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 92rpx;
  box-sizing: border-box;
  padding: 0 26rpx;
  border-bottom: 0;
}

.list-item:not(:last-child)::after {
  position: absolute;
  right: 26rpx;
  bottom: 0;
  left: 26rpx;
  height: 1rpx;
  background: #edf0ed;
  content: '';
}

.list-item:active {
  background: #f7faf8;
}

.list-item-text {
  color: var(--ym-ink);
  font-size: 27rpx;
}

.list-item-arrow {
  width: 12rpx;
  height: 12rpx;
  flex: 0 0 auto;
  margin-left: 20rpx;
  color: var(--ym-muted);
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}

.stat-item:active,
.function-item:active,
.section-header:active {
  opacity: 0.72;
}
</style>
