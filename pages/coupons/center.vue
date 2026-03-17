<template>
  <view class="container">
    <!-- 筛选标签 -->
    <scroll-view class="filter-tabs" scroll-x>
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </scroll-view>

    <!-- 优惠券列表 -->
    <view class="coupon-list">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 优惠券列表 -->
      <view v-else>
        <view 
          v-for="coupon in coupons" 
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
              <button 
                class="coupon-btn" 
                :class="{ 'disabled': coupon.receivedCount >= coupon.perLimit }"
                :disabled="coupon.receivedCount >= coupon.perLimit"
                @click="claimCoupon(coupon.id)"
              >
                {{ coupon.receivedCount >= coupon.perLimit ? '已领取' : '立即领取' }}
              </button>
            </view>
          </view>
        </view>
        <view v-if="coupons.length === 0" class="empty-state">
          <image class="empty-icon" src="https://via.placeholder.com/100" mode="aspectFill" />
          <text class="empty-text">暂无可用优惠券</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { BASE_API } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

export default {
  data() {
    return {
      // 筛选标签
      tabs: [
        { id: 'all', name: '全部', useRange: null },
        { id: 'shop', name: '店铺', useRange: 1 },
        { id: 'product', name: '商品', useRange: 2 },
        { id: 'category', name: '品类', useRange: 3 }
      ],
      // 当前选中的标签
      activeTab: 'all',
      // 优惠券数据
      coupons: [],
      // 加载状态
      loading: false
    }
  },
  computed: {
    // 当前选中标签的useRange值
    currentUseRange() {
      const tab = this.tabs.find(t => t.id === this.activeTab);
      return tab ? tab.useRange : null;
    }
  },
  methods: {
    // 切换标签
    switchTab(tabId) {
      this.activeTab = tabId;
      this.fetchCoupons();
    },
    // 获取优惠券列表
    fetchCoupons() {
      this.loading = true;
      
      // 构建API请求URL
      let url = `${BASE_API}/app/coupon/centerList`;
      
      // 添加useRange参数
      if (this.currentUseRange !== null) {
        url += `?useRange=${this.currentUseRange}`;
      }
      
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
          const couponData = res.data.data.records;
          
          // 转换数据结构
              this.coupons = couponData.map(item => {
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
                  type: item.type,
                  quantity: item.quantity,
                  received: item.received,
                  receivedCount: item.receivedCount || 0,
                  used: item.used,
                  perLimit: item.perLimit,
                  useRange: item.useRange,
                  useRangeText: useRangeText
                };
              });
        } else {
          console.error('获取优惠券列表失败:', res.data.message);
        }
        this.loading = false;
      }, (err) => {
        // 错误回调
        console.error('请求优惠券列表失败:', err);
        this.loading = false;
      }, '/pages/coupons/center'); // 传递redirect参数
    },
    // 领取优惠券
    claimCoupon(couponId) {
      // 构建API请求URL
      const url = `${BASE_API}/app/coupon/receive`;
      
      // 使用authRequest发送带认证的请求
      authRequest({
        url: url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          couponId: couponId
        }
      }, (res) => {
        // 成功回调
        if (res.statusCode === 200 && res.data.code === 0) {
          // 显示领取成功提示
          uni.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 1500
          });
          
          // 重新获取优惠券列表
          this.fetchCoupons();
        } else {
          // 显示领取失败提示
          uni.showToast({
            title: res.data.message || '领取失败',
            icon: 'none',
            duration: 1500
          });
        }
      }, (err) => {
        // 错误回调
        console.error('领取优惠券失败:', err);
        // 显示领取失败提示
        uni.showToast({
          title: '领取失败，请重试',
          icon: 'none',
          duration: 1500
        });
      }, '/pages/coupons/center'); // 传递redirect参数
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
  background-color: #f5f5f5;
  padding: 0;
  margin: 0;
  width: 100%;
}

/* 筛选标签 */
.filter-tabs {
  background-color: #fff;
  padding: 12px 0;
  border-bottom: 1rpx solid #eee;
  white-space: nowrap;
}

.tab-item {
  display: inline-block;
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  margin: 0 8rpx;
  border-radius: 28rpx;
  background-color: #f0f0f0;
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  background-color: #3cc51f;
  color: #fff;
}

/* 优惠券列表 */
.coupon-list {
  padding: 16px;
  min-height: 100vh;
}

/* 优惠券项 */
.coupon-item {
  display: flex;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  position: relative;
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

/* 禁用状态的领取按钮 */
.coupon-btn.disabled {
  background-color: #999;
  color: #fff;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 12px;
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

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 12px;
}

.loading-text {
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
</style>