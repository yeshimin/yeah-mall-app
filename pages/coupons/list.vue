<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的优惠券</text>
    </view>

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
    <view class="coupon-list">
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
            <text class="coupon-title">{{ coupon.title }}</text>
            <text class="coupon-desc">{{ coupon.description }}</text>
            <view class="coupon-footer">
              <text class="coupon-expiry">有效期至: {{ coupon.expiryDate }}</text>
              <button class="coupon-btn" @click="claimCoupon(coupon.id)">
                立即领取
              </button>
            </view>
          </view>
        </view>
        <view v-if="availableCoupons.length === 0" class="empty-state">
          <image class="empty-icon" src="https://via.placeholder.com/100" mode="aspectFill" />
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
            <text class="coupon-title">{{ coupon.title }}</text>
            <text class="coupon-desc">{{ coupon.description }}</text>
            <view class="coupon-footer">
              <text class="coupon-expiry">使用时间: {{ coupon.usedDate }}</text>
              <text class="coupon-status">已使用</text>
            </view>
          </view>
        </view>
        <view v-if="usedCoupons.length === 0" class="empty-state">
          <image class="empty-icon" src="https://via.placeholder.com/100" mode="aspectFill" />
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
            <text class="coupon-title">{{ coupon.title }}</text>
            <text class="coupon-desc">{{ coupon.description }}</text>
            <view class="coupon-footer">
              <text class="coupon-expiry">有效期至: {{ coupon.expiryDate }}</text>
              <text class="coupon-status">已过期</text>
            </view>
          </view>
        </view>
        <view v-if="expiredCoupons.length === 0" class="empty-state">
          <image class="empty-icon" src="https://via.placeholder.com/100" mode="aspectFill" />
          <text class="empty-text">暂无已过期优惠券</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 优惠券分类标签
      tabs: [
        { id: 'available', name: '可领取' },
        { id: 'used', name: '已使用' },
        { id: 'expired', name: '已过期' }
      ],
      // 当前选中的标签
      activeTab: 'available',
      // 可用优惠券数据
      availableCoupons: [
        {
          id: 1,
          title: '新人专享优惠券',
          amount: 20,
          minSpend: 100,
          description: '全场通用，限时领取',
          expiryDate: '2026-12-31'
        },
        {
          id: 2,
          title: '全场满减券',
          amount: 50,
          minSpend: 200,
          description: '全场通用，无门槛',
          expiryDate: '2026-12-31'
        },
        {
          id: 3,
          title: '品类优惠券',
          amount: 30,
          minSpend: 150,
          description: '指定品类可用',
          expiryDate: '2026-12-31'
        }
      ],
      // 已使用优惠券数据
      usedCoupons: [
        {
          id: 4,
          title: '首单立减券',
          amount: 10,
          minSpend: 50,
          description: '首次下单可用',
          usedDate: '2026-03-10'
        }
      ],
      // 已过期优惠券数据
      expiredCoupons: [
        {
          id: 5,
          title: '限时折扣券',
          amount: 15,
          minSpend: 80,
          description: '限时活动专用',
          expiryDate: '2026-03-01'
        }
      ]
    }
  },
  methods: {
    // 切换标签
    switchTab(tabId) {
      this.activeTab = tabId;
    },
    // 领取优惠券
    claimCoupon(couponId) {
      // 模拟领取优惠券
      uni.showToast({
        title: '领取成功',
        icon: 'success',
        duration: 1500
      });
      
      // 这里可以添加实际的领取逻辑，调用API
      console.log('领取优惠券:', couponId);
    }
  }
}
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

/* 优惠券标题 */
.coupon-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

/* 优惠券描述 */
.coupon-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.4;
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