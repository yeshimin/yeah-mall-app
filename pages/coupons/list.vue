<template>
  <view class="container">
    <!-- 优惠券分类标签 -->
    <view class="coupon-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </view>

    <!-- 优惠券列表 -->
    <scroll-view 
      class="coupon-list" 
      scroll-y 
      @refresherrefresh="onRefresh" 
      @scrolltolower="onLoadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      refresher-threshold="80"
    >
      <!-- 可用优惠券 -->
      <view v-if="activeTab === 'available'">
        <view 
          v-for="coupon in availableCoupons" 
          :key="coupon.id"
          class="coupon-item"
        >
          <view class="coupon-left">
            <text class="coupon-amount">¥{{ coupon.amount }}</text>
            <text class="coupon-condition">满{{ coupon.minSpend }}元可用</text>
          </view>
          <view class="coupon-right">
            <view class="coupon-header">
              <text class="coupon-title">{{ coupon.title }}</text>
              <text class="coupon-use-range">{{ coupon.useRangeText }}</text>
            </view>
            <view class="coupon-footer">
              <text class="coupon-expiry">有效期至: {{ coupon.expiryDate }}</text>
              <button class="coupon-btn" @click="useCoupon(coupon.id)">
                立即使用
              </button>
            </view>
          </view>
        </view>
        <view v-if="availableCoupons.length === 0 && !loading" class="empty-state">
          <image class="empty-icon" src="/static/logo.png" mode="aspectFill" />
          <text class="empty-text">暂无可用优惠券</text>
        </view>
      </view>

      <!-- 已使用优惠券 -->
      <view v-else-if="activeTab === 'used'">
        <view 
          v-for="coupon in usedCoupons" 
          :key="coupon.id"
          class="coupon-item used"
        >
          <view class="coupon-left">
            <text class="coupon-amount">¥{{ coupon.amount }}</text>
            <text class="coupon-condition">满{{ coupon.minSpend }}元可用</text>
          </view>
          <view class="coupon-right">
            <view class="coupon-header">
              <text class="coupon-title">{{ coupon.title }}</text>
              <text class="coupon-use-range">{{ coupon.useRangeText }}</text>
            </view>
            <view class="coupon-footer">
              <text class="coupon-expiry">使用时间: {{ coupon.usedDate }}</text>
              <text class="coupon-status">已使用</text>
            </view>
          </view>
        </view>
        <view v-if="usedCoupons.length === 0 && !loading" class="empty-state">
          <image class="empty-icon" src="/static/logo.png" mode="aspectFill" />
          <text class="empty-text">暂无已使用优惠券</text>
        </view>
      </view>

      <!-- 已过期优惠券 -->
      <view v-else-if="activeTab === 'expired'">
        <view 
          v-for="coupon in expiredCoupons" 
          :key="coupon.id"
          class="coupon-item expired"
        >
          <view class="coupon-left">
            <text class="coupon-amount">¥{{ coupon.amount }}</text>
            <text class="coupon-condition">满{{ coupon.minSpend }}元可用</text>
          </view>
          <view class="coupon-right">
            <view class="coupon-header">
              <text class="coupon-title">{{ coupon.title }}</text>
              <text class="coupon-use-range">{{ coupon.useRangeText }}</text>
            </view>
            <view class="coupon-footer">
              <text class="coupon-expiry">有效期至: {{ coupon.expiryDate }}</text>
              <text class="coupon-status">已过期</text>
            </view>
          </view>
        </view>
        <view v-if="expiredCoupons.length === 0 && !loading" class="empty-state">
          <image class="empty-icon" src="/static/logo.png" mode="aspectFill" />
          <text class="empty-text">暂无已过期优惠券</text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="loadingMore" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 没有更多数据 -->
      <view v-if="noMore" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { BASE_API } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

const tabs = [
  { id: 'available', name: '可用' },
  { id: 'used', name: '已使用' },
  { id: 'expired', name: '已过期' }
]

const activeTab = ref('available')
const availableCoupons = ref([])
const usedCoupons = ref([])
const expiredCoupons = ref([])
const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

function switchTab(tabId) {
  activeTab.value = tabId
  pagination.currentPage = 1
  noMore.value = false
  loading.value = true
  fetchCoupons()
}

function onRefresh() {
  if (refreshing.value) {
    return
  }
  refreshing.value = true
  pagination.currentPage = 1
  noMore.value = false
  fetchCoupons()
}

function onLoadMore() {
  if (loadingMore.value || noMore.value) {
    return
  }
  loadingMore.value = true
  pagination.currentPage += 1
  fetchCoupons()
}

function fetchCoupons() {
  let condition = 1
  if (activeTab.value === 'used') {
    condition = 2
  } else if (activeTab.value === 'expired') {
    condition = 3
  }

  authRequest({
    url: `${BASE_API}/app/coupon/receiveList?condition=${condition}&current=${pagination.currentPage}&size=${pagination.pageSize}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    if (res.statusCode === 200 && res.data.code === 0) {
      const coupons = (res.data.data.records || []).map((item) => {
        let useRangeText = ''
        if (item.useRange === 1) useRangeText = '指定店铺'
        else if (item.useRange === 2) useRangeText = '指定商品'
        else if (item.useRange === 3) useRangeText = '指定品类'

        return {
          id: item.id,
          title: item.name,
          amount: item.amount,
          minSpend: item.minAmount,
          expiryDate: item.endTime,
          usedDate: item.usedTime,
          type: item.type,
          useRange: item.useRange,
          useRangeText,
          isUsed: item.isUsed
        }
      })

      if (activeTab.value === 'available') {
        availableCoupons.value = pagination.currentPage === 1 ? coupons : [...availableCoupons.value, ...coupons]
      } else if (activeTab.value === 'used') {
        usedCoupons.value = pagination.currentPage === 1 ? coupons : [...usedCoupons.value, ...coupons]
      } else {
        expiredCoupons.value = pagination.currentPage === 1 ? coupons : [...expiredCoupons.value, ...coupons]
      }

      noMore.value = coupons.length < pagination.pageSize
    } else {
      console.error('获取优惠券列表失败:', res.data && res.data.message)
    }

    loading.value = false
    refreshing.value = false
    loadingMore.value = false
  }, (error) => {
    console.error('请求优惠券列表失败:', error)
    loading.value = false
    refreshing.value = false
    loadingMore.value = false
  }, '/pages/coupons/list')
}

function useCoupon(couponId) {
  uni.showToast({
    title: '跳转到使用页面',
    icon: 'success',
    duration: 1500
  })
  void couponId
}

onLoad(() => {
  fetchCoupons()
})
</script>

<style scoped>
/* 页面容器 */
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

/* 页面标题 */
.page-header {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: relative;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 优惠券分类标签 */
.coupon-tabs {
  display: flex;
  background-color: #fff;
  margin-top: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #3cc51f;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #3cc51f;
}

/* 优惠券列表 */
.coupon-list {
  padding: 20rpx;
  height: calc(100vh - 160rpx);
}

/* 优惠券项 */
.coupon-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  position: relative;
}

/* 已使用和已过期的优惠券样式 */
.coupon-item.used,
.coupon-item.expired {
  opacity: 0.7;
}

/* 优惠券左侧金额部分 */
.coupon-left {
  width: 200rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: #fff;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.coupon-item.used .coupon-left,
.coupon-item.expired .coupon-left {
  background: linear-gradient(135deg, #999 0%, #777 100%);
}

/* 优惠券金额 */
.coupon-amount {
  font-size: 48rpx;
  font-weight: bold;
  line-height: 1;
}

/* 优惠券使用条件 */
.coupon-condition {
  font-size: 20rpx;
  margin-top: 10rpx;
}

/* 优惠券右侧信息部分 */
.coupon-right {
  flex: 1;
  padding: 20rpx;
  position: relative;
}

/* 优惠券头部 */
.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

/* 优惠券标题 */
.coupon-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 12rpx;
}

/* 使用范围标签 */
.coupon-use-range {
  font-size: 20rpx;
  color: #3cc51f;
  background-color: #f0f9e8;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  white-space: nowrap;
}

/* 优惠券底部信息 */
.coupon-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
}

/* 优惠券有效期 */
.coupon-expiry {
  font-size: 20rpx;
  color: #999;
}

/* 优惠券状态 */
.coupon-status {
  font-size: 20rpx;
  color: #999;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  background-color: #f5f5f5;
}

/* 领取按钮 */
.coupon-btn {
  width: 120rpx;
  height: 50rpx;
  line-height: 50rpx;
  font-size: 22rpx;
  color: #fff;
  background-color: #3cc51f;
  border: none;
  border-radius: 25rpx;
  padding: 0;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 20rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 加载更多 */
.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

/* 没有更多数据 */
.no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

.no-more-text {
  font-size: 28rpx;
  color: #999;
}

/* 优惠券左侧的波浪线效果 */
.coupon-left::after {
  content: '';
  position: absolute;
  right: -20rpx;
  top: 0;
  bottom: 0;
  width: 20rpx;
  background-image: radial-gradient(circle at 0 0, transparent 20rpx, #ff6b6b 20rpx),
                    radial-gradient(circle at 0 40rpx, #ff6b6b 20rpx, transparent 20rpx);
  background-size: 40rpx 40rpx;
  background-repeat: repeat-y;
}

.coupon-item.used .coupon-left::after,
.coupon-item.expired .coupon-left::after {
  background-image: radial-gradient(circle at 0 0, transparent 20rpx, #999 20rpx),
                    radial-gradient(circle at 0 40rpx, #999 20rpx, transparent 20rpx);
}
</style>
