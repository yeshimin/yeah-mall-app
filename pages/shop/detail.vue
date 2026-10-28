<template>
  <view class="shop-page">
    <view v-if="loading" class="page-state">
      <text>正在加载店铺...</text>
    </view>

    <view v-else-if="error" class="page-state error-state">
      <text class="state-title">店铺加载失败</text>
      <text class="state-copy">{{ error }}</text>
      <view class="retry-button" @click="loadPage">重新加载</view>
    </view>

    <template v-else>
      <view class="shop-hero">
        <image class="shop-logo" :src="shopLogo" mode="aspectFill" />
        <view class="shop-copy">
          <text class="shop-name">{{ shop.shopName || fallbackShopName }}</text>
          <text class="shop-no">店铺编号 {{ shop.shopNo || '-' }}</text>
        </view>
        <view class="contact-button" @click="contactService">联系客服</view>
      </view>

      <view class="shop-summary">
        <view class="summary-item">
          <text class="summary-value">{{ shop.productCount || 0 }}</text>
          <text class="summary-label">店铺商品</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-note">
          <text class="summary-title">店铺好物</text>
          <text class="summary-subtitle">精选商品，放心选购</text>
        </view>
      </view>

      <view class="product-section">
        <view class="section-heading">
          <text class="section-title">全部商品</text>
          <text class="section-count">共 {{ shop.productCount || products.length }} 件</text>
        </view>

        <view v-if="products.length" class="product-grid">
          <view v-for="product in products" :key="product.id" class="product-card" @click="openProduct(product.id)">
            <image class="product-image" :src="productImage(product.mainImage)" mode="aspectFill" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-meta">
                <text class="product-price">{{ productPrice(product) }}</text>
                <text class="product-sales">已售 {{ product.sales || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="!productLoading" class="empty-products">
          <text class="empty-title">暂无店铺商品</text>
          <text class="empty-copy">店铺商品上新后会展示在这里</text>
        </view>

        <view v-if="productLoading" class="list-footer">正在加载商品...</view>
        <view v-else-if="products.length" class="list-footer">
          {{ hasMore ? '上拉加载更多' : '已经到底了' }}
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { fetchShopDetail, fetchShopProducts } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const shopId = ref('')
const fallbackShopName = ref('店铺')
const shop = reactive({
  id: '',
  shopNo: '',
  shopName: '',
  shopLogo: '',
  productCount: 0
})
const products = ref([])
const loading = ref(true)
const productLoading = ref(false)
const error = ref('')
const current = ref(1)
const pages = ref(1)
const pageSize = 10

const shopLogo = computed(() => getStoragePreviewUrl(shop.shopLogo) || '/static/logo.png')
const hasMore = computed(() => current.value < pages.value)

async function loadPage() {
  if (!shopId.value) {
    loading.value = false
    error.value = '缺少店铺ID'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const detail = await fetchShopDetail(shopId.value)
    Object.assign(shop, detail || {})
    await loadProducts(true)
  } catch (loadError) {
    error.value = loadError?.message || '请稍后重试'
  } finally {
    loading.value = false
  }
}

async function loadProducts(reset = false) {
  if (productLoading.value || (!reset && !hasMore.value)) return
  productLoading.value = true
  try {
    const targetPage = reset ? 1 : current.value + 1
    const result = await fetchShopProducts(shopId.value, targetPage, pageSize)
    const records = result?.records || []
    products.value = reset ? records : products.value.concat(records)
    current.value = Number(result?.current || targetPage)
    pages.value = Number(result?.pages || 1)
  } finally {
    productLoading.value = false
  }
}

function productImage(fileKey) {
  return getStoragePreviewUrl(fileKey) || '/static/logo.png'
}

function productPrice(product) {
  const minPrice = Number(product.minPrice || 0)
  const maxPrice = Number(product.maxPrice || minPrice)
  if (maxPrice > minPrice) {
    return `¥${minPrice.toFixed(2)} 起`
  }
  return `¥${minPrice.toFixed(2)}`
}

function openProduct(productId) {
  uni.navigateTo({ url: `/pages/product/detail?id=${productId}` })
}

function contactService() {
  uni.navigateTo({ url: `/pages/customer-service/index?shopId=${encodeURIComponent(shopId.value)}` })
}

onLoad((options = {}) => {
  shopId.value = options.shopId || ''
  fallbackShopName.value = options.shopName ? decodeURIComponent(options.shopName) : '店铺'
  loadPage()
})

onReachBottom(() => {
  loadProducts()
})
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx 24rpx 48rpx;
  background: var(--ym-paper);
}

.page-state {
  display: flex;
  min-height: 480rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--ym-muted);
  font-size: 26rpx;
  text-align: center;
}

.error-state {
  margin-top: 20rpx;
  min-height: 360rpx;
  padding: 40rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.state-title {
  color: var(--ym-ink);
  font-size: 32rpx;
  font-weight: 700;
}

.state-copy {
  margin-top: 12rpx;
}

.retry-button,
.contact-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ym-radius-control);
  font-weight: 600;
}

.retry-button {
  min-width: 176rpx;
  height: 68rpx;
  margin-top: 28rpx;
  padding: 0 24rpx;
  color: #fff;
  background: var(--ym-brand);
}

.shop-hero {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 30rpx;
  color: #fff;
  border-radius: var(--ym-radius-card);
  background: linear-gradient(135deg, var(--ym-ink), var(--ym-brand));
  box-shadow: var(--ym-shadow-card);
}

.shop-logo {
  width: 112rpx;
  height: 112rpx;
  flex: 0 0 112rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 24rpx;
  background: var(--ym-surface);
}

.shop-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  margin-left: 24rpx;
}

.shop-name {
  overflow: hidden;
  font-size: 34rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-no {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.68);
  font-size: 22rpx;
}

.contact-button {
  height: 64rpx;
  flex: 0 0 auto;
  margin-left: 20rpx;
  padding: 0 22rpx;
  color: var(--ym-brand-strong);
  background: #fff;
  font-size: 24rpx;
}

.shop-summary {
  display: flex;
  align-items: center;
  margin-top: 18rpx;
  padding: 24rpx 28rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.summary-item {
  display: flex;
  min-width: 120rpx;
  align-items: center;
  flex-direction: column;
}

.summary-value {
  color: var(--ym-ink);
  font-size: 34rpx;
  font-weight: 700;
}

.summary-label,
.summary-subtitle {
  margin-top: 4rpx;
  color: var(--ym-muted);
  font-size: 22rpx;
}

.summary-divider {
  width: 1rpx;
  height: 64rpx;
  margin: 0 28rpx;
  background: var(--ym-line);
}

.summary-note {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.summary-title {
  color: var(--ym-ink-secondary);
  font-size: 28rpx;
  font-weight: 600;
}

.product-section {
  margin-top: 28rpx;
}

.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18rpx;
  padding: 0 4rpx;
}

.section-title {
  color: var(--ym-ink);
  font-size: 32rpx;
  font-weight: 700;
}

.section-count {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.product-card {
  min-width: 0;
  overflow: hidden;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.product-image {
  width: 100%;
  height: 310rpx;
  background: var(--ym-brand-soft);
}

.product-info {
  padding: 18rpx;
}

.product-name {
  display: -webkit-box;
  min-height: 78rpx;
  overflow: hidden;
  color: var(--ym-ink);
  font-size: 27rpx;
  line-height: 1.45;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10rpx;
  margin-top: 14rpx;
}

.product-price {
  color: var(--ym-price);
  font-size: 30rpx;
  font-weight: 700;
}

.product-sales {
  color: var(--ym-muted);
  font-size: 20rpx;
  white-space: nowrap;
}

.empty-products {
  display: flex;
  min-height: 280rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.empty-title {
  color: var(--ym-ink);
  font-size: 29rpx;
  font-weight: 600;
}

.empty-copy {
  margin-top: 10rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
}

.list-footer {
  padding: 30rpx 0 10rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
  text-align: center;
}
</style>
