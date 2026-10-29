<template>
  <view class="page">
    <view class="activity-header">
      <text class="activity-name">{{ activityName }}</text>
      <text v-if="activityEndTime" class="activity-time">{{ activityEndTime }} 截止</text>
    </view>
    <view v-if="loading || !loaded" class="state">加载中...</view>
    <view v-else-if="loadError" class="state">
      <text>{{ loadError }}</text>
      <text class="state-retry" @click="loadProducts(true)">重新加载</text>
    </view>
    <view v-else-if="products.length === 0" class="state">暂无可查看的拼团商品</view>
    <view v-else class="product-list">
      <view v-for="product in products" :key="product.id" class="product-card" @click="openProduct(product)">
        <image class="image" :src="product.image" mode="aspectFill" />
        <view class="content">
          <text class="name">{{ product.name }}</text>
          <text class="people">{{ product.minPeople }}人团</text>
          <view class="price-line">
            <text class="price">¥{{ formatPrice(product.minGroupPrice) }}</text>
            <text class="origin">¥{{ formatPrice(product.minOriginPrice) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

const activityId = ref('')
const activityName = ref('拼团商品')
const activityBeginTime = ref('')
const activityEndTime = ref('')
const products = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const hasMore = ref(true)
const loadError = ref('')
const loaded = ref(false)

function loadProducts(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) {
    return
  }
  if (reset) {
    currentPage.value = 1
    hasMore.value = true
    products.value = []
    loaded.value = false
  }
  loading.value = true
  loadError.value = ''
  authRequest({
    url: `${BASE_API}/app/groupBuy/queryProduct?activityId=${activityId.value}&current=${currentPage.value}&size=${pageSize}`,
    method: 'GET'
  }, (res) => {
    if (res.statusCode === 200 && res.data.code === 0) {
      const page = res.data.data || {}
      const records = (page.records || []).map((product) => ({
        ...product,
        image: getStoragePreviewUrl(product.mainImage)
      }))
      products.value = reset ? records : products.value.concat(records)
      const pages = Number(page.pages || 0)
      hasMore.value = pages > 0
        ? currentPage.value < pages
        : records.length >= pageSize
      if (hasMore.value) {
        currentPage.value += 1
      }
    } else {
      loadError.value = res.data?.message || '拼团商品加载失败'
      uni.showToast({ title: res.data?.message || '获取拼团商品失败', icon: 'none' })
    }
    loading.value = false
    loaded.value = true
  }, () => {
    loading.value = false
    loaded.value = true
    loadError.value = '网络错误，请稍后重试'
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  })
}

function formatPrice(value) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) {
    return '--'
  }
  return Number(value).toFixed(2)
}

function openProduct(product) {
  const query = [
    `productId=${product.id}`,
    'scene=groupBuy',
    `activityId=${activityId.value}`,
    `activityBeginTime=${encodeURIComponent(activityBeginTime.value)}`,
    `activityEndTime=${encodeURIComponent(activityEndTime.value)}`
  ].join('&')
  uni.navigateTo({ url: `/pages/product/detail?${query}` })
}

onLoad((options = {}) => {
  activityId.value = options.activityId || ''
  activityName.value = decodeURIComponent(options.activityName || '拼团商品')
  activityBeginTime.value = decodeURIComponent(options.activityBeginTime || '')
  activityEndTime.value = decodeURIComponent(options.activityEndTime || '')
  if (activityId.value) {
    loadProducts(true)
  }
})

onReachBottom(() => loadProducts())
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--ym-paper);
}

.activity-header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 32rpx 28rpx;
  color: #fff;
  background: linear-gradient(135deg, var(--ym-brand-strong), var(--ym-brand));
}

.activity-name {
  font-size: 36rpx;
  font-weight: 700;
}

.activity-time {
  color: rgba(255, 255, 255, 0.76);
  font-size: 24rpx;
}

.product-list {
  padding: 20rpx 24rpx;
}

.product-card {
  display: flex;
  min-height: 190rpx;
  margin-bottom: 18rpx;
  padding: 18rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.image {
  width: 164rpx;
  height: 164rpx;
  flex: 0 0 164rpx;
  border-radius: var(--ym-radius-control);
}

.content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  padding-left: 20rpx;
}

.name {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ym-ink);
  font-size: 28rpx;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.people {
  width: fit-content;
  margin-top: 12rpx;
  padding: 5rpx 10rpx;
  color: var(--ym-brand);
  border-radius: 8rpx;
  background: var(--ym-brand-soft);
  font-size: 22rpx;
}

.price-line {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-top: auto;
}

.price {
  color: var(--ym-price);
  font-size: 34rpx;
  font-weight: 700;
}

.origin {
  color: var(--ym-muted);
  font-size: 24rpx;
  text-decoration: line-through;
}

.state {
  padding-top: 180rpx;
  color: var(--ym-muted);
  font-size: 28rpx;
  text-align: center;
}

.state-retry {
  display: block;
  margin-top: 18rpx;
  color: var(--ym-brand);
}
</style>
