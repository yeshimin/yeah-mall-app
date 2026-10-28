<template>
  <view class="page">
    <view v-if="items.length" class="header"><text class="clear" @click="clear">清空</text></view>
    <view v-if="loading && items.length === 0" class="state">加载中...</view>
    <view v-else-if="items.length === 0" class="state">暂未浏览商品</view>
    <view v-else class="product-list">
      <view v-for="item in items" :key="item.id" class="product-card" @click="openProduct(item)">
        <image class="image" :src="imageUrl(item.mainImage)" mode="aspectFill" />
        <view class="content">
          <text class="name">{{ item.name || '商品已失效' }}</text>
          <text class="price">¥{{ price(item.minPrice) }}</text>
          <text class="time">浏览 {{ item.browseCount || 0 }} 次 · {{ item.lastBrowseTime || '-' }}</text>
        </view>
        <text class="remove" @click.stop="remove(item)">删除</text>
      </view>
    </view>
    <view v-if="items.length" class="footer">{{ noMore ? '没有更多了' : '上拉加载更多' }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

const items = ref([])
const current = ref(1)
const loading = ref(false)
const noMore = ref(false)

function load(reset = false) {
  if (loading.value || (!reset && noMore.value)) return
  if (reset) { current.value = 1; noMore.value = false; items.value = [] }
  loading.value = true
  authRequest({ url: `${BASE_API}/app/productBrowseHistory/query?current=${current.value}&size=20`, method: 'GET' }, (res) => {
    const data = res.data?.data || {}
    const records = data.records || []
    items.value = reset ? records : items.value.concat(records)
    noMore.value = Number(data.current || current.value) >= Number(data.pages || 1)
    if (!noMore.value) current.value += 1
    loading.value = false
  }, () => { loading.value = false })
}

function remove(item) {
  authRequest({ url: `${BASE_API}/app/productBrowseHistory/remove`, method: 'POST',
    header: { 'Content-Type': 'application/json' }, data: { id: item.id } }, (res) => {
    if (res.data?.code === 0) items.value = items.value.filter((value) => value.id !== item.id)
  })
}

function clear() {
  if (items.value.length === 0) return
  uni.showModal({ title: '提示', content: '确认清空全部浏览足迹吗？', success: ({ confirm }) => {
    if (!confirm) return
    authRequest({ url: `${BASE_API}/app/productBrowseHistory/clear`, method: 'POST' }, (res) => {
      if (res.data?.code === 0) items.value = []
    })
  } })
}

function openProduct(item) {
  if (item.available) uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` })
}
function imageUrl(fileKey) { return getStoragePreviewUrl(fileKey) || '/static/logo.png' }
function price(value) { return Number(value || 0).toFixed(2) }
onLoad(() => load(true))
onReachBottom(() => load())
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 20rpx 24rpx 40rpx;
  background: var(--ym-paper);
}

.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 56rpx;
  margin-bottom: 12rpx;
}

.clear,
.remove {
  display: flex;
  min-height: 56rpx;
  align-items: center;
  padding: 0 8rpx;
  color: var(--ym-brand);
  font-size: 24rpx;
  font-weight: 500;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  box-sizing: border-box;
  padding: 18rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.image {
  width: 132rpx;
  height: 132rpx;
  flex: 0 0 132rpx;
  border-radius: 14rpx;
  background: var(--ym-brand-soft);
}

.content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
}

.name {
  display: -webkit-box;
  overflow: hidden;
  color: var(--ym-ink);
  font-size: 28rpx;
  line-height: 1.45;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.price {
  color: var(--ym-price);
  font-size: 30rpx;
  font-weight: 700;
}

.time {
  overflow: hidden;
  color: var(--ym-muted);
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.state {
  margin-top: 120rpx;
  color: var(--ym-muted);
  font-size: 26rpx;
  text-align: center;
}

.footer {
  padding: 28rpx 0 12rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
  text-align: center;
}
</style>
