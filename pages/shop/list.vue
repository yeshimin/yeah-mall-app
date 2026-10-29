<template>
  <view class="shop-list-page">
    <view class="search-panel">
      <view class="search-field">
        <view class="search-icon"><view class="search-icon-handle"></view></view>
        <input v-model="keyword" class="search-input" placeholder="搜索店铺" confirm-type="search" @confirm="search" />
      </view>
      <button class="search-button" @click="search">搜索</button>
    </view>

    <view v-if="loading && !shops.length" class="page-state">正在加载店铺...</view>
    <view v-else-if="error && !shops.length" class="page-state">
      <text class="state-title">店铺加载失败</text>
      <text class="state-copy">{{ error }}</text>
      <button class="retry-button" @click="loadShops(true)">重新加载</button>
    </view>
    <view v-else-if="!shops.length" class="page-state">
      <text class="state-title">暂无店铺</text>
      <text class="state-copy">换个关键词试试</text>
    </view>

    <view v-else class="shop-list">
      <view v-for="shop in shops" :key="shop.id" class="shop-card" @click="openShop(shop)">
        <image v-if="shop.shopLogo && !shop.logoFailed" class="shop-logo" :src="previewUrl(shop.shopLogo)" mode="aspectFill" @error="shop.logoFailed = true" />
        <view v-else class="shop-logo-placeholder">{{ shopInitial(shop.shopName) }}</view>
        <view class="shop-copy">
          <text class="shop-name">{{ shop.shopName || '未命名店铺' }}</text>
          <text class="shop-products">商品 {{ shop.productCount || 0 }} 件</text>
        </view>
        <view class="shop-arrow"></view>
      </view>
    </view>

    <view v-if="shops.length" class="list-footer">
      {{ loading ? '正在加载更多...' : hasMore ? '继续上滑加载' : '已经到底了' }}
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { fetchShops } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const keyword = ref('')
const shops = ref([])
const current = ref(1)
const pages = ref(1)
const loading = ref(false)
const error = ref('')
const pageSize = 10
const hasMore = computed(() => current.value < pages.value)

function previewUrl(fileKey) {
  return getStoragePreviewUrl(fileKey)
}

function shopInitial(name) {
  return String(name || '店').trim().slice(0, 1)
}

function openShop(shop) {
  uni.navigateTo({
    url: `/pages/shop/detail?shopId=${encodeURIComponent(shop.id)}&shopName=${encodeURIComponent(shop.shopName || '')}`
  })
}

async function loadShops(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) return
  loading.value = true
  error.value = ''
  const targetPage = reset ? 1 : current.value + 1
  try {
    const result = await fetchShops({ current: targetPage, size: pageSize, keyword: keyword.value.trim() || undefined })
    const records = (result?.records || []).map((shop) => ({ ...shop, logoFailed: false }))
    shops.value = reset ? records : shops.value.concat(records)
    current.value = Number(result?.current || targetPage)
    pages.value = Number(result?.pages || 1)
  } catch (loadError) {
    error.value = loadError?.message || '请稍后重试'
  } finally {
    loading.value = false
  }
}

function search() {
  loadShops(true)
}

onLoad(() => loadShops(true))
onReachBottom(() => loadShops())
onPullDownRefresh(async () => {
  try {
    await loadShops(true)
  } finally {
    uni.stopPullDownRefresh()
  }
})
</script>

<style scoped>
.shop-list-page { min-height: 100vh; box-sizing: border-box; padding-bottom: 48rpx; background: var(--ym-surface); }
.search-panel { display: grid; grid-template-columns: minmax(0, 1fr) 112rpx; gap: 16rpx; padding: 24rpx; background: var(--ym-surface); }
.search-field { display: flex; height: 76rpx; align-items: center; gap: 16rpx; box-sizing: border-box; padding: 0 22rpx; border: 1rpx solid var(--ym-line); border-radius: var(--ym-radius-control); background: var(--ym-surface-subtle); }
.search-icon { position: relative; width: 24rpx; height: 24rpx; flex: 0 0 24rpx; box-sizing: border-box; border: 3rpx solid var(--ym-muted); border-radius: 50%; }
.search-icon-handle { position: absolute; right: -8rpx; bottom: -6rpx; width: 10rpx; height: 3rpx; border-radius: 2rpx; background: var(--ym-muted); transform: rotate(45deg); transform-origin: left center; }
.search-input { min-width: 0; height: 76rpx; flex: 1; padding: 0; border: 0; background: transparent; font-size: 26rpx; }
.search-button { width: 112rpx; height: 76rpx; margin: 0; padding: 0; color: #fff; border-radius: var(--ym-radius-control); background: var(--ym-brand); font-size: 25rpx; line-height: 76rpx; }
.shop-list { background: var(--ym-surface); }
.shop-card { display: flex; min-height: 180rpx; align-items: center; gap: 24rpx; box-sizing: border-box; padding: 28rpx 32rpx; border-bottom: 1rpx solid var(--ym-line); background: var(--ym-surface); }
.shop-logo, .shop-logo-placeholder { width: 124rpx; height: 124rpx; flex: 0 0 124rpx; border-radius: 20rpx; }
.shop-logo { background: transparent; }
.shop-logo-placeholder { display: flex; align-items: center; justify-content: center; color: #fff; background: var(--ym-brand); font-size: 40rpx; font-weight: 800; }
.shop-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 16rpx; }
.shop-name { overflow: hidden; color: var(--ym-ink); font-size: 30rpx; font-weight: 700; white-space: nowrap; text-overflow: ellipsis; }
.shop-products { color: var(--ym-muted); font-size: 23rpx; }
.shop-arrow { width: 14rpx; height: 14rpx; color: var(--ym-muted); border-top: 2rpx solid currentColor; border-right: 2rpx solid currentColor; transform: rotate(45deg); }
.page-state { display: flex; min-height: 480rpx; align-items: center; justify-content: center; flex-direction: column; color: var(--ym-muted); text-align: center; }
.state-title { color: var(--ym-ink); font-size: 30rpx; font-weight: 700; }.state-copy { margin-top: 10rpx; font-size: 24rpx; }
.retry-button { min-width: 176rpx; height: 72rpx; margin-top: 28rpx; color: #fff; border-radius: var(--ym-radius-control); background: var(--ym-brand); font-size: 25rpx; line-height: 72rpx; }
.list-footer { padding: 32rpx 0 12rpx; color: var(--ym-muted); font-size: 23rpx; text-align: center; }
</style>
