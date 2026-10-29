<template>
  <view class="page">
    <view v-if="(!loaded || loading) && items.length === 0" class="state">加载中...</view>
    <view v-else-if="loadError && items.length === 0" class="state">
      <text>{{ loadError }}</text>
      <text class="state-retry" @click="load(true)">重新加载</text>
    </view>
    <view v-else-if="items.length === 0" class="state">暂未收藏商品</view>
    <view v-else class="product-list">
      <view v-for="item in items" :key="item.id" class="product-card" @click="openProduct(item)">
        <image class="image" :src="imageUrl(item.mainImage)" mode="aspectFill" />
        <view class="content">
          <text class="name">{{ item.name || '商品已失效' }}</text>
          <text class="price">¥{{ price(item.minPrice) }}</text>
          <text class="time">收藏于 {{ item.favoriteTime || '-' }}</text>
        </view>
        <view class="actions">
          <text v-if="!item.available" class="invalid">已失效</text>
          <text class="remove" @click.stop="remove(item)">取消收藏</text>
        </view>
      </view>
    </view>
    <view v-if="items.length > 0" class="footer">{{ noMore ? '没有更多了' : '上拉加载更多' }}</view>
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
const loadError = ref('')
const loaded = ref(false)

function load(reset = false) {
  if (loading.value || (!reset && noMore.value)) return
  if (reset) {
    current.value = 1
    noMore.value = false
    items.value = []
    loaded.value = false
  }
  loading.value = true
  loadError.value = ''
  authRequest({ url: `${BASE_API}/app/productFavorites/query?current=${current.value}&size=20`, method: 'GET' }, (res) => {
    if (res.statusCode !== 200 || res.data?.code !== 0) {
      loadError.value = res.data?.message || '收藏列表加载失败'
      loading.value = false
      loaded.value = true
      return
    }
    const data = res.data?.data || {}
    const records = data.records || []
    items.value = reset ? records : items.value.concat(records)
    noMore.value = Number(data.current || current.value) >= Number(data.pages || 1)
    if (!noMore.value) current.value += 1
    loading.value = false
    loaded.value = true
  }, () => {
    loadError.value = '网络错误，请稍后重试'
    loading.value = false
    loaded.value = true
  })
}

function remove(item) {
  authRequest({
    url: `${BASE_API}/app/productFavorites/remove`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    data: { id: item.id }
  }, (res) => {
    if (res.data?.code === 0) {
      items.value = items.value.filter((value) => value.id !== item.id)
    }
  })
}

function openProduct(item) {
  if (!item.available) return
  uni.navigateTo({ url: `/pages/product/detail?id=${item.id}` })
}

function imageUrl(fileKey) {
  return getStoragePreviewUrl(fileKey) || '/static/logo.png'
}

function price(value) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return '--'
  return Number(value).toFixed(2)
}

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

.time,
.invalid {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.actions {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  flex-direction: column;
  gap: 10rpx;
}

.remove {
  display: flex;
  min-height: 56rpx;
  align-items: center;
  padding-left: 12rpx;
  color: var(--ym-brand);
  font-size: 24rpx;
  font-weight: 500;
}

.state,
.footer {
  padding: 120rpx 0;
  color: var(--ym-muted);
  font-size: 26rpx;
  text-align: center;
}

.state-retry { display: block; margin-top: 18rpx; color: var(--ym-brand); }

.footer {
  padding: 28rpx 0 12rpx;
  font-size: 23rpx;
}
</style>
