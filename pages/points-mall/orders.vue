<template>
  <view class="page">
    <scroll-view scroll-x class="tabs" :show-scrollbar="false">
      <view class="tab-row">
        <view v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: status === tab.value }" @click="switchTab(tab.value)">{{ tab.label }}</view>
      </view>
    </scroll-view>
    <view v-if="loadError && !orders.length && !loading" class="empty">
      <text>{{ loadError }}</text>
      <text class="state-retry" @click="loadOrders(true)">重新加载</text>
    </view>
    <view v-else-if="loaded && !orders.length && !loading" class="empty">暂无积分兑换订单</view>
    <view v-for="order in orders" :key="order.id" class="order-card" @click="openDetail(order.id)">
      <view class="order-head"><text>{{ order.orderNo }}</text><text :class="['status', statusClass(order.status)]">{{ statusText(order.status) }}</text></view>
      <view class="goods-row">
        <image :src="imageUrl(order.productImage)" mode="aspectFill" />
        <view class="goods-copy"><text>{{ order.productName }}</text><text>{{ order.skuName }} × {{ order.quantity }}</text><text>{{ displayNumber(order.totalPoints) }} 积分</text></view>
      </view>
      <view class="order-foot"><text>{{ order.createTime }}</text><text>{{ fulfillmentText(order.fulfillmentType) }}</text></view>
    </view>
    <view v-if="loading || !loaded" class="state">加载中...</view>
    <view v-else-if="orders.length && !hasMore" class="state">已经到底了</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { fetchPointsOrders } from '@/utils/api.js'
import {
  getPointsFulfillmentText,
  getPointsOrderStatusClass,
  getPointsOrderStatusText,
  POINTS_ORDER_STATUS_OPTIONS,
} from '@/utils/pointsMall.js'

const tabs = [{ value: '', label: '全部' }, ...POINTS_ORDER_STATUS_OPTIONS]
const status = ref('')
const orders = ref([])
const current = ref(1)
const loading = ref(false)
const hasMore = ref(true)
const loaded = ref(false)
const loadError = ref('')
const pageSize = 10

function imageUrl(key) { return key ? getStoragePreviewUrl(key) : '/static/logo.png' }
function statusText(value) { return getPointsOrderStatusText(value) }
function statusClass(value) { return getPointsOrderStatusClass(value) }
function fulfillmentText(value) { return getPointsFulfillmentText(value) }
function displayNumber(value) { return value == null || value === '' ? '--' : value }
function openDetail(id) { uni.navigateTo({ url: `/pages/points-mall/order-detail?id=${id}` }) }
function switchTab(value) { status.value = value; loadOrders(true) }

async function loadOrders(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) return
  if (reset) { current.value = 1; orders.value = []; hasMore.value = true }
  loading.value = true
  loadError.value = ''
  try {
    const data = await fetchPointsOrders({ current: current.value, size: pageSize, status: status.value || undefined })
    const records = data?.records || []
    orders.value = reset ? records : orders.value.concat(records)
    hasMore.value = Number(data?.current || current.value) < Number(data?.pages || 0)
    if (hasMore.value) current.value += 1
    loaded.value = true
  } catch (error) {
    loadError.value = error?.message || '积分订单加载失败，请稍后重试'
  }
  finally { loading.value = false; loaded.value = true }
}

onLoad(() => loadOrders(true))
onShow(() => { if (loaded.value) loadOrders(true) })
onReachBottom(() => loadOrders())
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  background: var(--ym-paper);
}

.tabs {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 20rpx 0;
  white-space: nowrap;
  background: rgba(244, 246, 243, 0.96);
}

.tab-row {
  display: inline-flex;
  gap: 12rpx;
}

.tab {
  min-height: 56rpx;
  box-sizing: border-box;
  padding: 12rpx 24rpx;
  color: var(--ym-muted);
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-control);
  background: var(--ym-surface);
  font-size: 24rpx;
}

.tab.active {
  color: #fff;
  border-color: var(--ym-brand);
  background: var(--ym-brand);
}

.order-card {
  margin-bottom: 18rpx;
  padding: 24rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.order-head,
.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  color: var(--ym-muted);
  font-size: 21rpx;
}

.status {
  font-size: 24rpx;
  font-weight: 700;
}

.points-status-pending { color: var(--ym-warning); }
.points-status-shipped { color: #326a73; }
.points-status-completed { color: var(--ym-brand); }
.points-status-canceled { color: var(--ym-muted); }

.goods-row {
  display: flex;
  gap: 18rpx;
  margin: 22rpx 0;
}

.goods-row image {
  width: 132rpx;
  height: 132rpx;
  flex: 0 0 132rpx;
  border-radius: var(--ym-radius-control);
}

.goods-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 9rpx;
  color: var(--ym-ink-secondary);
  font-size: 26rpx;
}

.goods-copy text:first-child {
  color: var(--ym-ink);
  font-weight: 700;
}

.goods-copy text:nth-child(2) {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.goods-copy text:last-child {
  margin-top: auto;
  color: var(--ym-price);
  font-weight: 800;
}

.order-foot {
  padding-top: 18rpx;
  border-top: 1rpx solid var(--ym-line);
}

.empty,
.state {
  padding: 120rpx 0;
  color: var(--ym-muted);
  text-align: center;
  font-size: 26rpx;
}

.state {
  padding: 36rpx 0;
}

.state-retry { display: block; margin-top: 18rpx; color: var(--ym-brand); }
</style>
