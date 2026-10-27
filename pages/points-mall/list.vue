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

    <view v-if="loading && !products.length" class="state">正在准备积分好物...</view>
    <view v-else-if="!products.length" class="state">当前分类暂无可兑换商品</view>
    <view v-else class="grid">
      <view v-for="item in products" :key="item.id" class="card" @click="openDetail(item.id)">
        <image class="card-image" :src="imageUrl(item.mainImage)" mode="aspectFill" />
        <view class="card-body">
          <text class="card-name">{{ item.name }}</text>
          <text class="card-subtitle">{{ item.subtitle || fulfillmentText(item.fulfillmentType) }}</text>
          <view class="card-footer">
            <text class="points">{{ item.minPointsPrice }}<text>积分起</text></text>
            <text class="stock">库存 {{ item.stock }}</text>
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
const pageSize = 12

function imageUrl(key) { return key ? getStoragePreviewUrl(key) : '/static/logo.png' }
function fulfillmentText(value) { return getPointsFulfillmentText(value) || '积分兑换' }

async function loadBase() {
  categories.value = await fetchPointsMallCategories() || []
}

async function loadProducts(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) return
  if (reset) { current.value = 1; products.value = []; hasMore.value = true }
  loading.value = true
  try {
    const data = await fetchPointsMallProducts({ current: current.value, size: pageSize, categoryId: categoryId.value || undefined })
    const records = data?.records || []
    products.value = reset ? records : products.value.concat(records)
    hasMore.value = Number(data?.current || current.value) < Number(data?.pages || 0)
    if (hasMore.value) current.value += 1
  } catch (error) {
    uni.showToast({ title: error.message || '积分商品加载失败', icon: 'none' })
  } finally { loading.value = false }
}

function selectCategory(id) { categoryId.value = id; loadProducts(true) }
function openDetail(id) { uni.navigateTo({ url: `/pages/points-mall/detail?id=${id}` }) }
function openOrders() { uni.navigateTo({ url: '/pages/points-mall/orders' }) }

onLoad(async () => { try { await loadBase(); await loadProducts(true) } catch (error) { uni.showToast({ title: error.message || '积分商城暂不可用', icon: 'none' }) } })
onReachBottom(() => loadProducts())
onPullDownRefresh(async () => { await loadBase(); await loadProducts(true); uni.stopPullDownRefresh() })
</script>

<style scoped>
.page { min-height: 100vh; padding: 24rpx 24rpx 140rpx; box-sizing: border-box; background: #f4f0e8; color: #2d2a25; }
.category-scroll { margin-bottom: 22rpx; white-space: nowrap; }.category-row { display: inline-flex; gap: 14rpx; }.category-chip { padding: 14rpx 28rpx; color: #756d63; border-radius: 30rpx; background: #fff; font-size: 24rpx; }.category-chip.active { color: #fff; background: #c45a31; box-shadow: 0 8rpx 20rpx rgba(196,90,49,.22); }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20rpx; }.card { overflow: hidden; border-radius: 22rpx; background: #fff; box-shadow: 0 8rpx 24rpx rgba(68,54,41,.07); }.card-image { width: 100%; height: 310rpx; background: #e8e1d5; }.card-body { padding: 20rpx; }.card-name, .card-subtitle { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }.card-name { font-size: 28rpx; font-weight: 700; }.card-subtitle { margin-top: 9rpx; color: #93897d; font-size: 21rpx; }.card-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 22rpx; }.points { color: #c64d25; font-size: 34rpx; font-weight: 800; }.points text { margin-left: 4rpx; font-size: 19rpx; font-weight: 500; }.stock { color: #a39c92; font-size: 19rpx; }
.state, .more-state { padding: 90rpx 0; color: #9b9287; text-align: center; font-size: 25rpx; }.more-state { padding: 34rpx 0; }
.orders-entry { position: fixed; right: 28rpx; bottom: 44rpx; padding: 18rpx 28rpx; color: #fff; border-radius: 36rpx; background: #2d4038; font-size: 24rpx; box-shadow: 0 10rpx 28rpx rgba(45,64,56,.28); }
</style>
