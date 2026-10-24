<template>
  <view class="page">
    <view v-if="loading && items.length === 0" class="state">加载中...</view>
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

function load(reset = false) {
  if (loading.value || (!reset && noMore.value)) return
  if (reset) {
    current.value = 1
    noMore.value = false
    items.value = []
  }
  loading.value = true
  authRequest({ url: `${BASE_API}/app/productFavorites/query?current=${current.value}&size=20`, method: 'GET' }, (res) => {
    const data = res.data?.data || {}
    const records = data.records || []
    items.value = reset ? records : items.value.concat(records)
    noMore.value = Number(data.current || current.value) >= Number(data.pages || 1)
    if (!noMore.value) current.value += 1
    loading.value = false
  }, () => { loading.value = false })
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
  return Number(value || 0).toFixed(2)
}

onLoad(() => load(true))
onReachBottom(() => load())
</script>

<style scoped>
.page { min-height: 100vh; padding: 20rpx; box-sizing: border-box; background: #f7f8fa; }
.product-card { display: flex; align-items: center; gap: 18rpx; margin-bottom: 16rpx; padding: 18rpx; background: #fff; border-radius: 14rpx; }
.image { width: 132rpx; height: 132rpx; border-radius: 10rpx; background: #eee; }
.content { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 10rpx; }
.name { overflow: hidden; color: #222; font-size: 28rpx; text-overflow: ellipsis; white-space: nowrap; }
.price { color: #e64340; font-size: 30rpx; font-weight: 700; }
.time, .invalid { color: #999; font-size: 22rpx; }
.actions { display: flex; flex-direction: column; align-items: flex-end; gap: 14rpx; }
.remove { color: #576b95; font-size: 24rpx; }
.state, .footer { padding: 100rpx 0; color: #999; font-size: 26rpx; text-align: center; }
.footer { padding: 26rpx 0; }
</style>
