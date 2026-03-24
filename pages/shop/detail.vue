<template>
  <view class="shop-detail-page">
    <view class="hero-card">
      <text class="shop-label">店铺详情</text>
      <text class="shop-name">{{ shopName }}</text>
      <text class="shop-desc">
        当前店铺详情路由已经接通，后续可以直接在这里替换成真实店铺接口与商品数据。
      </text>
    </view>

    <view class="action-card">
      <button class="primary-btn" @click="viewProducts">查看店铺商品</button>
      <button class="secondary-btn" @click="contactService">联系店铺客服</button>
    </view>

    <view class="meta-card">
      <view class="meta-row">
        <text class="meta-label">店铺 ID</text>
        <text class="meta-value">{{ shopId || '--' }}</text>
      </view>
      <view class="meta-row">
        <text class="meta-label">当前状态</text>
        <text class="meta-value">开发阶段占位详情页</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const shopId = ref('')
const shopName = ref('店铺')

function viewProducts() {
  uni.navigateTo({
    url: `/pages/product/list?query=${encodeURIComponent(shopName.value)}`
  })
}

function contactService() {
  const query = shopId.value ? `?shopId=${encodeURIComponent(shopId.value)}` : ''
  uni.navigateTo({
    url: `/pages/customer-service/index${query}`
  })
}

onLoad((options = {}) => {
  shopId.value = options.shopId || ''
  shopName.value = options.shopName ? decodeURIComponent(options.shopName) : '店铺'
})
</script>

<style scoped>
.shop-detail-page {
  min-height: 100vh;
  padding: 32rpx;
  background: linear-gradient(180deg, #f7f0e7 0%, #f8f8f8 40%, #ffffff 100%);
  box-sizing: border-box;
}

.hero-card,
.action-card,
.meta-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.action-card,
.meta-card {
  margin-top: 24rpx;
}

.shop-label {
  display: inline-flex;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background-color: #f6ede2;
  color: #8d5f2c;
  font-size: 24rpx;
}

.shop-name {
  display: block;
  margin-top: 24rpx;
  font-size: 44rpx;
  font-weight: 600;
  color: #2a2118;
}

.shop-desc {
  display: block;
  margin-top: 18rpx;
  line-height: 1.7;
  color: #675949;
  font-size: 28rpx;
}

.primary-btn,
.secondary-btn {
  border-radius: 999rpx;
  font-size: 28rpx;
}

.primary-btn {
  background-color: #2f6b55;
  color: #fff;
}

.secondary-btn {
  margin-top: 20rpx;
  background-color: #f2f4f1;
  color: #2f6b55;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f1f1f1;
}

.meta-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.meta-label {
  color: #8a8a8a;
  font-size: 26rpx;
}

.meta-value {
  color: #222;
  font-size: 28rpx;
}
</style>
