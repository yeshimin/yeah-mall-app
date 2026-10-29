<template>
  <view class="page">
    <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
      <view class="category-row">
        <view class="category-chip" :class="{ active: !categoryId }" @click="selectCategory('')">全部</view>
        <view
          v-for="item in categories"
          :key="item.id"
          class="category-chip"
          :class="{ active: categoryId === item.id }"
          @click="selectCategory(item.id)"
        >{{ item.name }}</view>
      </view>
    </scroll-view>

    <view v-if="!initialized || (loading && !products.length)" class="state">正在准备积分好物...</view>
    <view v-else-if="loadError && !products.length" class="state">
      <text>{{ loadError }}</text>
      <text class="state-retry" @click="initializePage">重新加载</text>
    </view>
    <view v-else-if="!products.length" class="state">当前分类暂无可兑换商品</view>
    <view v-else class="grid">
      <view v-for="item in products" :key="item.id" class="card" @click="openDetail(item.id)">
        <image class="card-image" :src="imageUrl(item.mainImage)" mode="aspectFill" />
        <view class="card-body">
          <text class="card-name">{{ item.name }}</text>
          <text class="card-subtitle">{{ item.subtitle || fulfillmentText(item.fulfillmentType) }}</text>
          <view class="card-footer">
            <text class="points">{{ displayNumber(item.minPointsPrice) }}<text>积分起</text></text>
            <text v-if="item.stock != null" class="stock">库存 {{ item.stock }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-if="loading && products.length" class="more-state">加载中...</view>
    <view v-else-if="!hasMore && products.length" class="more-state">已经到底了</view>

    <view class="orders-entry" @click="openOrders">兑换记录</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { fetchPointsMallCategories, fetchPointsMallProducts } from '@/utils/api.js'
import { getPointsFulfillmentText } from '@/utils/pointsMall.js'

const categories = ref([])
const products = ref([])
const categoryId = ref('')
const current = ref(1)
const loading = ref(false)
const hasMore = ref(true)
const loadError = ref('')
const initialized = ref(false)
const pageSize = 12

function imageUrl(key) { return key ? getStoragePreviewUrl(key) : '/static/logo.png' }
function fulfillmentText(value) { return getPointsFulfillmentText(value) || '积分兑换' }
function displayNumber(value) { return value == null || value === '' ? '--' : value }

async function loadBase() {
  categories.value = await fetchPointsMallCategories() || []
}

async function loadProducts(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) return
  if (reset) { current.value = 1; products.value = []; hasMore.value = true }
  loading.value = true
  loadError.value = ''
  try {
    const data = await fetchPointsMallProducts({ current: current.value, size: pageSize, categoryId: categoryId.value || undefined })
    const records = data?.records || []
    products.value = reset ? records : products.value.concat(records)
    hasMore.value = Number(data?.current || current.value) < Number(data?.pages || 0)
    if (hasMore.value) current.value += 1
  } catch (error) {
    loadError.value = error?.message || '积分商品加载失败，请稍后重试'
    uni.showToast({ title: error.message || '积分商品加载失败', icon: 'none' })
  } finally { loading.value = false }
}

function selectCategory(id) { categoryId.value = id; loadProducts(true) }
function openDetail(id) { uni.navigateTo({ url: `/pages/points-mall/detail?id=${id}` }) }
function openOrders() { uni.navigateTo({ url: '/pages/points-mall/orders' }) }

async function initializePage() {
  initialized.value = false
  loadError.value = ''
  try {
    await loadBase()
    await loadProducts(true)
  } catch (error) {
    loadError.value = error?.message || '积分商城暂不可用，请稍后重试'
  } finally {
    initialized.value = true
  }
}

onLoad(initializePage)
onReachBottom(() => loadProducts())
onPullDownRefresh(async () => {
  try {
    await initializePage()
  } finally {
    uni.stopPullDownRefresh()
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx 24rpx 152rpx;
  color: var(--ym-ink);
  background: var(--ym-paper);
}

.category-scroll {
  margin-bottom: 22rpx;
  white-space: nowrap;
}

.category-row {
  display: inline-flex;
  gap: 12rpx;
}

.category-chip {
  min-height: 56rpx;
  box-sizing: border-box;
  padding: 12rpx 26rpx;
  color: var(--ym-muted);
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-control);
  background: var(--ym-surface);
  font-size: 24rpx;
}

.category-chip.active {
  color: #fff;
  border-color: var(--ym-brand);
  background: var(--ym-brand);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.card {
  overflow: hidden;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.card:active {
  opacity: 0.82;
}

.card-image {
  width: 100%;
  height: 310rpx;
}

.card-body {
  padding: 20rpx;
}

.card-name,
.card-subtitle {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-name {
  color: var(--ym-ink);
  font-size: 28rpx;
  font-weight: 700;
}

.card-subtitle {
  margin-top: 8rpx;
  color: var(--ym-muted);
  font-size: 22rpx;
}

.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10rpx;
  margin-top: 20rpx;
}

.points {
  color: var(--ym-price);
  font-size: 34rpx;
  font-weight: 800;
}

.points text,
.stock {
  color: var(--ym-muted);
  font-size: 20rpx;
  font-weight: 500;
}

.points text {
  margin-left: 4rpx;
  color: var(--ym-price);
}

.state,
.more-state {
  padding: 96rpx 0;
  color: var(--ym-muted);
  text-align: center;
  font-size: 26rpx;
}

.more-state {
  padding: 36rpx 0;
}

.state-retry { display: block; margin-top: 18rpx; color: var(--ym-brand); }

.orders-entry {
  position: fixed;
  right: 24rpx;
  bottom: calc(28rpx + env(safe-area-inset-bottom));
  z-index: 10;
  padding: 18rpx 28rpx;
  color: #fff;
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand);
  box-shadow: 0 10rpx 28rpx rgba(23, 75, 59, 0.22);
  font-size: 24rpx;
  font-weight: 600;
}
</style>
