<template>
  <view class="page">
    <view class="activity-header">
      <text class="activity-name">{{ activityName }}</text>
      <text class="activity-time">{{ activityEndTime }} 截止</text>
    </view>
    <view v-if="loading" class="state">加载中...</view>
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

function loadProducts(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) {
    return
  }
  if (reset) {
    currentPage.value = 1
    hasMore.value = true
    products.value = []
  }
  loading.value = true
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
      uni.showToast({ title: res.data?.message || '获取拼团商品失败', icon: 'none' })
    }
    loading.value = false
  }, () => {
    loading.value = false
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  })
}

function formatPrice(value) {
  return Number(value || 0).toFixed(2)
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
.page { min-height: 100vh; background: #f7f8fa; }
.activity-header { display: flex; flex-direction: column; gap: 8rpx; padding: 32rpx 28rpx; color: #fff; background: linear-gradient(120deg, #d55420, #f28b3a); }
.activity-name { font-size: 36rpx; font-weight: 700; }
.activity-time { font-size: 24rpx; opacity: .9; }
.product-list { padding: 20rpx; }
.product-card { display: flex; min-height: 190rpx; margin-bottom: 18rpx; padding: 18rpx; background: #fff; border-radius: 18rpx; }
.image { width: 164rpx; height: 164rpx; flex: 0 0 164rpx; border-radius: 12rpx; background: #eee; }
.content { display: flex; min-width: 0; flex: 1; flex-direction: column; padding-left: 20rpx; }
.name { display: -webkit-box; overflow: hidden; color: #312317; font-size: 28rpx; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.people { width: fit-content; margin-top: 12rpx; padding: 4rpx 10rpx; color: #d55420; font-size: 22rpx; background: #fff0e7; border-radius: 6rpx; }
.price-line { display: flex; align-items: baseline; gap: 12rpx; margin-top: auto; }
.price { color: #d94812; font-size: 34rpx; font-weight: 700; }
.origin { color: #aaa; font-size: 24rpx; text-decoration: line-through; }
.state { padding-top: 180rpx; color: #999; font-size: 28rpx; text-align: center; }
</style>
