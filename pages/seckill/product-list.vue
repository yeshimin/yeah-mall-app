<template>
  <view class="container">
    <!-- 活动信息 -->
    <view class="activity-info-section" v-if="activityInfo">
      <view class="activity-header">
        <text class="activity-name">{{ activityInfo.name }}</text>
        <view class="activity-status" :class="{ active: activityInfo.status === '5' }">
          <text class="status-text">{{ getActivityStatusText(activityInfo.status) }}</text>
        </view>
      </view>
      <text class="activity-description">{{ activityInfo.description }}</text>
      <view class="activity-time">
        <text class="time-label">活动时间：</text>
        <text class="time-text">{{ activityInfo.activityBeginTime }} - {{ activityInfo.activityEndTime }}</text>
      </view>
    </view>

    <!-- 秒杀商品列表 -->
    <view class="seckill-products">
      <view class="section-title">秒杀商品</view>
      <view 
        v-for="(product, index) in seckillProducts" 
        :key="product.id"
        class="product-item"
        @click="goToProductDetail(product.id)"
      >
        <!-- 商品图片 -->
        <view class="product-image-container">
          <image 
            class="product-image" 
            :src="product.image"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <!-- 秒杀标签 -->
          <view class="seckill-tag">
            <text class="seckill-tag-text">秒杀</text>
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          
          <!-- 商家和场次信息 -->
          <view class="product-meta">
            <text class="mch-name">{{ product.mchName }}</text>
            <text class="shop-name">{{ product.shopName }}</text>
            <text class="session-name">{{ product.sessionName }}</text>
          </view>
          
          <!-- 价格信息 -->
          <view class="price-container">
            <view class="seckill-price">
              <text class="price-symbol">￥</text>
              <text class="price-value">{{ product.seckillPrice }}</text>
            </view>
            <view class="original-price">
              <text class="original-price-text">￥{{ product.originalPrice }}</text>
            </view>
          </view>


        </view>
        
        <!-- 透明覆盖层，确保点击事件被捕获 -->
        <view class="product-overlay"></view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading || !loaded" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="loadError" class="empty-container">
      <text class="empty-text">{{ loadError }}</text>
      <text class="state-retry" @click="fetchSeckillProducts(activityInfo.id)">重新加载</text>
    </view>

    <!-- 无数据 -->
    <view v-else-if="seckillProducts.length === 0" class="empty-container">
      <text class="empty-text">暂无秒杀商品</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

const activityInfo = ref(null)
const seckillProducts = ref([])
const loading = ref(false)
const loadError = ref('')
const loaded = ref(false)

function handleImageLoad() {}

function handleImageError(error) {
  void error
}

function goToProductDetail(productId) {
  if (!activityInfo.value) {
    return
  }

  uni.navigateTo({
    url: `/pages/product/detail?productId=${productId}&scene=seckill&activityBeginTime=${encodeURIComponent(activityInfo.value.activityBeginTime)}&activityEndTime=${encodeURIComponent(activityInfo.value.activityEndTime)}&activityId=${encodeURIComponent(activityInfo.value.id)}`
  })
}

function fetchSeckillProducts(activityId) {
  if (loading.value) {
    return
  }

  loading.value = true
  loadError.value = ''
  authRequest({
    url: `${BASE_API}/app/seckill/queryProduct?activityId=${activityId}`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    if (res.statusCode === 200 && res.data.code === 0) {
      const responseData = res.data.data || {}
      seckillProducts.value = (responseData.records || []).map((item) => ({
        id: item.id,
        name: item.name,
        image: getStoragePreviewUrl(item.mainImage),
        seckillPrice: formatPrice(item.minSeckillPrice),
        originalPrice: formatPrice(item.minOriginPrice),
        mchName: item.mchName,
        shopName: item.shopName,
        sessionName: item.sessionName
      }))
    } else {
      console.error('获取秒杀商品失败:', res.data && res.data.message)
      seckillProducts.value = []
      loadError.value = (res.data && res.data.message) || '秒杀商品加载失败'
    }
    loading.value = false
    loaded.value = true
  }, (error) => {
    console.error('请求秒杀商品失败:', error)
    seckillProducts.value = []
    loadError.value = '网络错误，请稍后重试'
    loading.value = false
    loaded.value = true
  })
}

function formatPrice(value) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) {
    return '--'
  }
  return Number(value).toFixed(2)
}

function getActivityStatusText(status) {
  const statusMap = {
    '1': '新建',
    '2': '发布',
    '3': '开始报名',
    '4': '结束报名',
    '5': '开始活动',
    '6': '结束活动'
  }
  return statusMap[status] || '未知状态'
}

onLoad((options = {}) => {
  const activityId = options.activityId
  if (!activityId) {
    loadError.value = '缺少秒杀活动ID'
    loaded.value = true
    return
  }

  activityInfo.value = {
    id: options.activityId,
    name: decodeURIComponent(options.activityName || ''),
    description: decodeURIComponent(options.activityDescription || ''),
    coverImage: decodeURIComponent(options.coverImage || ''),
    activityBeginTime: decodeURIComponent(options.activityBeginTime || ''),
    activityEndTime: decodeURIComponent(options.activityEndTime || ''),
    status: options.activityStatus || ''
  }

  fetchSeckillProducts(activityId)
})
</script>

<style scoped>
/* 重置默认样式 */
.container,
.activity-list,
.activity-item {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0;
  margin: 0;
  width: 100%;
}

/* 活动信息区域 */
.activity-info-section {
  background-color: #ffffff;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  flex: 1;
  margin-right: 12px;
}

.activity-description {
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.activity-time {
  font-size: 12px;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.time-label {
  margin-right: 4px;
}

.activity-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #f0f0f0;
  color: #666666;
  flex-shrink: 0;
  border: 1px solid #e0e0e0;
}

.activity-status.active {
  background-color: #fff0f0;
  color: #ff4444;
  border-color: #ffcccc;
}

/* 秒杀商品列表样式 */
.seckill-products {
  background-color: #ffffff;
  padding: 16px;
  margin-top: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-right: 16px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
}

.seckill-tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ff4444;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: var(--ym-radius-card, 24rpx);
  font-size: 12px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #333333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.mch-name,
.shop-name,
.session-name {
  font-size: 12px;
  color: #999999;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.seckill-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  color: #ff4444;
  margin-right: 2px;
}

.price-value {
  font-size: 20px;
  font-weight: 600;
  color: #ff4444;
}

.original-price {
  font-size: 12px;
  color: #999999;
  text-decoration: line-through;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: transparent;
  cursor: pointer;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 14px;
  color: #999999;
}

/* 无数据样式 */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  font-size: 14px;
  color: #999999;
}
</style>

<style scoped>
.container {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx;
  background: var(--ym-paper);
}

.activity-info-section {
  margin-bottom: 18rpx;
  padding: 26rpx;
  color: #fff;
  border-radius: var(--ym-radius-card);
  background: linear-gradient(135deg, var(--ym-brand-strong), var(--ym-brand));
  box-shadow: none;
}

.activity-name {
  color: #fff;
  font-size: 32rpx;
}

.activity-description,
.activity-time,
.time-text {
  color: rgba(255, 255, 255, 0.76);
}

.activity-status,
.activity-status.active {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.28);
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.12);
}

.seckill-products {
  margin-top: 0;
  padding: 0;
  background: transparent;
}

.section-title {
  margin-bottom: 16rpx;
  padding: 4rpx 0 16rpx;
  color: var(--ym-ink);
  border-bottom-color: var(--ym-line);
  font-size: 30rpx;
}

.product-item {
  margin-bottom: 18rpx;
  padding: 18rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.product-image-container {
  width: 210rpx;
  height: 210rpx;
  margin-right: 20rpx;
}

.product-image {
  border-radius: var(--ym-radius-control);
}

.seckill-tag {
  color: #fff;
  border-radius: 8rpx;
  background: var(--ym-price);
}

.product-name {
  color: var(--ym-ink);
  font-size: 28rpx;
}

.mch-name,
.shop-name,
.session-name {
  color: var(--ym-muted);
  border-radius: 8rpx;
  background: var(--ym-surface-subtle);
}

.price-symbol,
.price-value {
  color: var(--ym-price);
}

.original-price,
.loading-container,
.empty-container {
  color: var(--ym-muted);
}

.state-retry {
  display: block;
  margin-top: 18rpx;
  color: var(--ym-brand);
}
</style>
