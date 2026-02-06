<template>
  <view class="profile-container">
    <!-- 个人信息区域 -->
    <view class="profile-header" @click="editProfile">
      <view class="user-info">
        <image class="user-avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
        <view class="user-details">
          <text class="user-name">{{ userInfo.nickname }}</text>
        </view>
      </view>
      <text class="edit-arrow">&gt;</text>
    </view>
    
    <!-- 订单管理 -->
    <view class="section">
      <view class="section-header" @click="viewAllOrders">
        <text class="section-title">我的订单</text>
        <text class="section-more">查看全部订单 &gt; </text>
      </view>
      <view class="order-stats">
        <view class="stat-item" v-for="(stat, index) in orderStats" :key="index" @click="viewOrdersByStatus(index)">
          <text class="stat-icon">{{ stat.name }}</text>
          <text class="stat-count">{{ stat.count }}</text>
        </view>
      </view>
    </view>
    
    <!-- 功能入口 -->
    <view class="section">
      <view class="function-grid">
        <view class="function-item" v-for="(func, index) in functions" :key="index" @click="useFunction(index)">
          <text class="function-icon">{{ func.icon }}</text>
          <text class="function-text">{{ func.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 其他功能 -->
    <view class="section">
      <view class="list-item" v-for="(setting, index) in settings" :key="index" @click="openSetting(index)">
        <text class="list-item-text">{{ setting.name }}</text>
        <text class="list-item-arrow">&gt;</text>
      </view>
    </view>
  </view>
</template>

<script>
import { isAuthenticated, handleAuthFailure } from '../../utils/auth.js'
import { fetchOrderCounts, fetchUserDetail } from '../../utils/api.js'
import { BASE_API } from '../../utils/config.js'

export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {
        id: '',
        nickname: '用户名',
        avatarUrl: '../../static/logo.png',
        mobile: '',
        account: '',
        gender: 0,
        birthday: ''
      },
      orderStats: [
        { name: '待付款', key: 'waitPayCount', count: 0 },
        { name: '待发货', key: 'waitShipCount', count: 0 },
        { name: '待收货', key: 'waitReceiveCount', count: 0 },
        { name: '待评价', key: 'waitCommentCount', count: 0 },
        { name: '退款/售后', key: 'refundAndAfterSaleCount', count: 0 }
      ],
      functions: [
        { name: '优惠券', icon: '优惠券' },
        { name: '积分', icon: '积分' },
        { name: '收藏', icon: '收藏' },
        { name: '地址', icon: '地址' }
      ],
      settings: [
        { name: '消息中心' },
        { name: '客服中心' },
        { name: '设置' }
      ]
    }
  },
  onShow() {
    // 进入页面时校验登录状态
    if (!isAuthenticated()) {
      handleAuthFailure()
      return
    }
    // 已登录则拉取用户信息和订单数量
    this.loadUserInfo()
    this.loadOrderCounts()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      fetchUserDetail()
        .then(data => {
          // 处理用户头像URL
          const avatarUrl = data.avatar ? `${BASE_API}/public/storage/preview?fileKey=${data.avatar}` : '../../static/logo.png'
          
          this.userInfo = {
            id: data.id || '',
            nickname: data.nickname || data.mobile || '用户名',
            avatarUrl: avatarUrl,
            mobile: data.mobile || '',
            account: data.account || '',
            gender: data.gender || 0,
            birthday: data.birthday || ''
          }
        })
        .catch(err => {
          // 认证失败已在全局处理，这里不再重复提示
          if (err && err.message === 'AUTH_401') {
            return
          }
          console.error('获取用户信息失败', err)
          // 保持默认用户信息，不影响页面显示
        })
    },
    
    // 查看全部订单
    viewAllOrders() {
      console.log('查看全部订单')
      uni.navigateTo({
        url: '/pages/order/list'
      })
    },
    
    // 点击订单状态
    viewOrdersByStatus(index) {
      console.log('查看订单状态:', this.orderStats[index].name)
      // 根据不同状态跳转到订单列表页面，并传递状态参数
      let status = 0 // 默认为全部
      if (index === 0) status = 1 // 待付款
      else if (index === 1) status = 2 // 待发货
      else if (index === 2) status = 3 // 待收货
      else if (index === 3) status = 5 // 待评价
      else if (index === 4) status = 4 // 退款/售后
      
      uni.navigateTo({
        url: `/pages/order/list?status=${status}`
      })
    },
    // 加载个人订单数量
    loadOrderCounts() {
      fetchOrderCounts()
        .then(data => {
          // data: OrderCountVo
          this.orderStats = this.orderStats.map(stat => ({
            ...stat,
            count: data && data[stat.key] != null ? data[stat.key] : 0
          }))
        })
        .catch(err => {
          // 认证失败已在全局处理，这里不再重复提示
          if (err && err.message === 'AUTH_401') {
            return
          }
          console.error('获取订单数量失败', err)
          uni.showToast({
            title: '获取订单数量失败',
            icon: 'none'
          })
        })
    },
    
    // 点击功能入口
    useFunction(index) {
      console.log('使用功能:', this.functions[index].name)
      // 这里可以跳转到相应的功能页面
    },
    
    // 点击设置项
    openSetting(index) {
      console.log('打开设置:', this.settings[index].name)
      // 这里可以跳转到相应的设置页面
    },
    
    // 编辑个人信息
    editProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      })
    }
  }
}
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
  font-size: 28rpx;
  color: #999;
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
  font-size: 24rpx;
  color: #999;
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
  font-size: 24rpx;
  color: #999;
}
</style>