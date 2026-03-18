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
          <image class="empty-icon" src="https://via.placeholder.com/100" mode="aspectFill" />
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

<script>
import { BASE_API } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

export default {
  data() {
    return {
      // 优惠券分类标签
      tabs: [
        { id: 'available', name: '可用' },
        { id: 'used', name: '已使用' },
        { id: 'expired', name: '已过期' }
      ],
      // 当前选中的标签
      activeTab: 'available',
      // 优惠券数据
      availableCoupons: [],
      usedCoupons: [],
      expiredCoupons: [],
      // 加载状态
      loading: false,
      // 刷新状态
      refreshing: false,
      // 加载更多状态
      loadingMore: false,
      // 没有更多数据
      noMore: false,
      // 分页参数
      currentPage: 1,
      pageSize: 10
    }
  },
  methods: {
    // 切换标签
    switchTab(tabId) {
      this.activeTab = tabId;
      this.currentPage = 1; // 切换标签时重置到第一页
      this.noMore = false; // 重置没有更多数据的状态
      this.loading = true; // 显示加载状态
      this.fetchCoupons();
    },
    
    // 下拉刷新
    onRefresh() {
      if (this.refreshing) {
        return;
      }
      this.refreshing = true;
      this.currentPage = 1;
      this.noMore = false;
      this.fetchCoupons();
    },
    
    // 上拉加载更多
    onLoadMore() {
      if (this.loadingMore || this.noMore) {
        return;
      }
      this.loadingMore = true;
      this.currentPage++;
      this.fetchCoupons();
    },
    // 获取优惠券列表
    fetchCoupons() {
      // 构建API请求URL
      let url = `${BASE_API}/app/coupon/receiveList`;
      
      // 添加条件参数
      let condition = 1; // 默认为可用
      if (this.activeTab === 'used') {
        condition = 2; // 已使用
      } else if (this.activeTab === 'expired') {
        condition = 3; // 已过期
      }
      url += `?condition=${condition}&current=${this.currentPage}&size=${this.pageSize}`;
      
      // 使用authRequest发送带认证的请求
      authRequest({
        url: url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        // 成功回调
        if (res.statusCode === 200 && res.data.code === 0) {
          // 处理返回的优惠券数据
          const couponData = res.data.data.records || [];
          
          // 转换数据结构
          const coupons = couponData.map(item => {
            // 根据useRange生成使用范围文本
            let useRangeText = '';
            switch(item.useRange) {
              case 1:
                useRangeText = '指定店铺';
                break;
              case 2:
                useRangeText = '指定商品';
                break;
              case 3:
                useRangeText = '指定品类';
                break;
              default:
                useRangeText = '';
            }
            
            return {
              id: item.id,
              title: item.name,
              amount: item.amount,
              minSpend: item.minAmount,
              expiryDate: item.endTime,
              usedDate: item.usedTime,
              type: item.type,
              useRange: item.useRange,
              useRangeText: useRangeText,
              isUsed: item.isUsed
            };
          });
          
          // 根据标签类型存储数据
          if (this.activeTab === 'available') {
            if (this.currentPage === 1) {
              this.availableCoupons = coupons;
            } else {
              this.availableCoupons = [...this.availableCoupons, ...coupons];
            }
          } else if (this.activeTab === 'used') {
            if (this.currentPage === 1) {
              this.usedCoupons = coupons;
            } else {
              this.usedCoupons = [...this.usedCoupons, ...coupons];
            }
          } else if (this.activeTab === 'expired') {
            if (this.currentPage === 1) {
              this.expiredCoupons = coupons;
            } else {
              this.expiredCoupons = [...this.expiredCoupons, ...coupons];
            }
          }
          
          // 判断是否还有更多数据
          this.noMore = coupons.length < this.pageSize;
        } else {
          console.error('获取优惠券列表失败:', res.data.message);
        }
        this.loading = false;
        this.refreshing = false;
        this.loadingMore = false;
      }, (err) => {
        // 错误回调
        console.error('请求优惠券列表失败:', err);
        this.loading = false;
        this.refreshing = false;
        this.loadingMore = false;
      }, '/pages/coupons/list'); // 传递redirect参数
    },
    // 使用优惠券
    useCoupon(couponId) {
      // 这里可以添加使用优惠券的逻辑
      uni.showToast({
        title: '跳转到使用页面',
        icon: 'success',
        duration: 1500
      });
      
      console.log('使用优惠券:', couponId);
      // 这里可以跳转到商品列表或购物车页面
    },
    // 上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchCoupons();
      }
    },
    // 下一页
    nextPage() {
      this.currentPage++;
      this.fetchCoupons();
    }
  },
  // 页面加载时获取数据
  mounted() {
    this.fetchCoupons();
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