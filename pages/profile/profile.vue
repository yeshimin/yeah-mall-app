<template>
  <view class="profile-container">
    <!-- 个人信息区域 -->
    <view class="profile-header" @click="editProfile">
      <view class="user-info">
        <image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
        <view class="user-details">
          <text class="user-name">{{ userLoading ? '加载中...' : userError ? '会员信息加载失败' : (userInfo.nickname || '未设置昵称') }}</text>
          <text v-if="!userLoading && !userError" class="user-meta">{{ userInfo.account ? '会员 · ' + userInfo.account : '会员' }}</text>
        </view>
      </view>
      <view class="edit-arrow"></view>
    </view>
    
    <!-- 订单管理 -->
    <view class="profile-section profile-order-panel">
      <view class="section-header" @click="viewAllOrders">
        <text class="section-title">我的订单</text>
        <view class="section-more">全部订单</view>
      </view>
      <view class="order-stats">
        <view class="stat-item" v-for="stat in orderStats" :key="stat.key" @click="viewOrdersByStatus(stat)">
          <view class="stat-icon-box">
            <image class="stat-symbol" :src="stat.icon" mode="aspectFit" />
            <text v-if="stat.count > 0" class="stat-count">{{ stat.count }}</text>
          </view>
          <text class="stat-label">{{ stat.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 个人功能 -->
    <view v-for="(menus, groupIndex) in menuGroups" :key="groupIndex" class="profile-section profile-menu">
      <view v-for="menu in menus" :key="menu.name" class="menu-item" @click="openMenu(menu)">
        <image class="menu-icon" :src="menu.icon" mode="aspectFit" :draggable="false" />
        <text class="menu-text">{{ menu.name }}</text>
        <view class="menu-arrow"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchOrderCounts, fetchUserDetail } from '../../utils/api.js'
import { handleAuthFailure, isAuthenticated } from '../../utils/auth.js'
import { getStoragePreviewUrl } from '../../utils/config.js'

const userInfo = reactive({
  id: '',
  nickname: '',
  avatarUrl: '../../static/logo.png',
  mobile: '',
  account: '',
  gender: 0,
  birthday: ''
})
const userLoading = ref(true)
const userError = ref(false)

const orderStats = reactive([
  { name: '待付款', icon: '/static/profile-icons/order.png', key: 'waitPayCount', status: 1, count: 0 },
  { name: '待发货', icon: '/static/profile-icons/box.png', key: 'waitShipCount', status: 2, count: 0 },
  { name: '待收货', icon: '/static/profile-icons/truck.png', key: 'waitReceiveCount', status: 3, count: 0 },
  { name: '待评价', icon: '/static/profile-icons/message.png', key: 'waitCommentCount', status: 5, count: 0 },
  { name: '退款/售后', icon: '/static/profile-icons/refund.png', key: 'refundAndAfterSaleCount', status: 4, count: 0 }
])

const menuGroups = [
  [
    { name: '我的收藏', icon: '/static/profile-icons/heart.png', url: '/pages/profile/favorites' },
    { name: '浏览足迹', icon: '/static/profile-icons/clock.png', url: '/pages/profile/browse-history' },
    { name: '我的优惠券', icon: '/static/profile-icons/ticket.png', url: '/pages/coupons/list' },
    { name: '我的积分', icon: '/static/profile-icons/diamond.png', url: '/pages/profile/points' },
    { name: '地址管理', icon: '/static/profile-icons/location.png', url: '/pages/address/list' }
  ],
  [
    { name: '客服中心', icon: '/static/profile-icons/message.png', url: '/pages/customer-service/index' },
    { name: '意见反馈', icon: '/static/profile-icons/spark.png', url: '/pages/profile/feedback' },
    { name: '设置', icon: '/static/profile-icons/settings.png', url: '/pages/profile/settings' }
  ]
]

function loadUserInfo() {
  userLoading.value = true
  userError.value = false
  fetchUserDetail()
    .then((data) => {
      Object.assign(userInfo, {
        id: data.id || '',
        nickname: data.nickname || data.mobile || '',
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
      userError.value = true
      console.error('获取用户信息失败', error)
    })
    .finally(() => {
      userLoading.value = false
    })
}

function viewAllOrders() {
  uni.navigateTo({
    url: '/pages/order/list'
  })
}

function viewOrdersByStatus(stat) {
  uni.navigateTo({
    url: `/pages/order/list?status=${stat.status}`
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

function openMenu(menu) {
  uni.navigateTo({ url: menu.url })
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
  padding: 40rpx 32rpx 36rpx;
  border-radius: 0;
  background: var(--ym-surface);
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
  color: var(--ym-ink);
  font-size: 36rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-meta {
  display: block;
  overflow: hidden;
  color: var(--ym-muted);
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
  color: var(--ym-brand);
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}

.profile-section {
  overflow: hidden;
  margin-top: 20rpx;
  border: 0;
  border-radius: 0;
  background: var(--ym-surface);
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 32rpx;
  padding: 28rpx 0;
  border-bottom: 1rpx solid var(--ym-line);
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
  padding: 28rpx 12rpx 30rpx;
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
  width: 58rpx;
  height: 58rpx;
  align-items: center;
  justify-content: center;
  color: var(--ym-brand);
  border: 0;
  border-radius: 0;
  background: transparent;
}

.stat-symbol {
  width: 42rpx;
  height: 42rpx;
  background: transparent;
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

.profile-menu {
  padding: 0 32rpx;
}

.menu-item {
  position: relative;
  display: grid;
  grid-template-columns: 38rpx minmax(0, 1fr) 14rpx;
  align-items: center;
  min-height: 92rpx;
  box-sizing: border-box;
  gap: 20rpx;
  border-bottom: 0;
}

.menu-item:not(:last-child) {
  border-bottom: 1rpx solid var(--ym-line);
}

.menu-item:active {
  background: #f7faf8;
}

.menu-icon {
  display: block;
  width: 36rpx;
  height: 36rpx;
  background: transparent;
}

.menu-text {
  overflow: hidden;
  color: var(--ym-ink);
  font-size: 27rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-arrow {
  width: 12rpx;
  height: 12rpx;
  flex: 0 0 auto;
  color: var(--ym-muted);
  border-top: 2rpx solid currentColor;
  border-right: 2rpx solid currentColor;
  transform: rotate(45deg);
}

.stat-item:active,
.section-header:active {
  opacity: 0.72;
}
</style>
