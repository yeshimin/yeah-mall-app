<template>
  <view class="page" v-if="product.id">
    <image class="cover" :src="imageUrl(product.mainImage)" mode="aspectFill" />
    <view class="content-card">
      <view class="title-row">
        <view><text class="name">{{ product.name }}</text><text class="subtitle">{{ product.subtitle }}</text></view>
        <text class="type-tag">{{ fulfillmentText(product.fulfillmentType) }}</text>
      </view>

      <text class="section-title">选择规格</text>
      <view class="sku-list">
        <view
          v-for="sku in skus"
          :key="sku.id"
          class="sku-card"
          :class="{ active: selectedSku?.id === sku.id, disabled: sku.stock <= 0 }"
          @click="selectSku(sku)"
        >
          <image class="sku-image" :src="imageUrl(sku.mainImage || product.mainImage)" mode="aspectFill" />
          <view class="sku-copy"><text>{{ sku.name }}</text><text>{{ sku.pointsPrice }} 积分</text></view>
          <text class="sku-stock">库存 {{ sku.stock }}</text>
        </view>
      </view>

      <view class="quantity-row">
        <text>兑换数量</text>
        <view class="stepper"><text @click="decrease">−</text><text>{{ quantity }}</text><text @click="increase">＋</text></view>
      </view>

      <view class="rules">
        <text>兑换说明</text>
        <text>每人限兑：{{ product.perMemberLimit > POINTS_UNLIMITED_PER_MEMBER_LIMIT ? product.perMemberLimit + ' 件' : '不限' }}</text>
        <text>兑换截止：{{ product.endTime }}</text>
        <text>{{ fulfillmentDescription(product.fulfillmentType) }}</text>
      </view>

      <view class="description">
        <text class="section-title">商品详情</text>
        <rich-text :nodes="product.detailDesc || '<p>暂无商品详情</p>'" />
      </view>
    </view>
    <view class="bottom-bar">
      <view><text class="total-label">合计</text><text class="total-points">{{ totalPoints }} 积分</text></view>
      <button class="exchange-btn" :disabled="!selectedSku || selectedSku.stock <= 0" @click="openConfirm">立即兑换</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { fetchPointsMallDetail, fetchPointsMallSkus } from '@/utils/api.js'
import {
  getPointsFulfillmentDescription,
  getPointsFulfillmentText,
  POINTS_EXCHANGE_MIN_QUANTITY,
  POINTS_UNLIMITED_PER_MEMBER_LIMIT,
} from '@/utils/pointsMall.js'

const product = reactive({})
const skus = ref([])
const selectedSku = ref(null)
const quantity = ref(POINTS_EXCHANGE_MIN_QUANTITY)
const totalPoints = computed(() => Number(selectedSku.value?.pointsPrice || 0) * quantity.value)

function imageUrl(key) { return key ? getStoragePreviewUrl(key) : '/static/logo.png' }
function fulfillmentText(value) { return getPointsFulfillmentText(value) }
function fulfillmentDescription(value) { return getPointsFulfillmentDescription(value) }
function selectSku(sku) { if (sku.stock > 0) { selectedSku.value = sku; quantity.value = POINTS_EXCHANGE_MIN_QUANTITY } }
function decrease() { quantity.value = Math.max(POINTS_EXCHANGE_MIN_QUANTITY, quantity.value - 1) }
function increase() { if (selectedSku.value) quantity.value = Math.min(selectedSku.value.stock, quantity.value + POINTS_EXCHANGE_MIN_QUANTITY) }
function openConfirm() {
  if (!selectedSku.value) return
  uni.navigateTo({ url: `/pages/points-mall/confirm?spuId=${product.id}&skuId=${selectedSku.value.id}&quantity=${quantity.value}` })
}

onLoad(async ({ id }) => {
  try {
    const [detail, skuData] = await Promise.all([fetchPointsMallDetail(id), fetchPointsMallSkus(id)])
    Object.assign(product, detail || {})
    skus.value = skuData || []
    selectedSku.value = skus.value.find((item) => item.stock > 0) || null
  } catch (error) { uni.showToast({ title: error.message || '商品加载失败', icon: 'none' }) }
})
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 150rpx; background: #eee9e1; color: #2d2925; }.cover { width: 100%; height: 750rpx; background: #ded7cc; }.content-card { position: relative; margin-top: -34rpx; padding: 34rpx 28rpx 50rpx; border-radius: 34rpx 34rpx 0 0; background: #fff; }
.title-row { display: flex; justify-content: space-between; gap: 20rpx; }.name, .subtitle { display: block; }.name { font-family: Georgia, serif; font-size: 42rpx; font-weight: 700; }.subtitle { margin-top: 10rpx; color: #8e867c; font-size: 24rpx; }.type-tag { align-self: flex-start; padding: 9rpx 14rpx; color: #8d4c2e; border-radius: 10rpx; background: #f6e9dc; font-size: 21rpx; }.section-title { display: block; margin: 38rpx 0 20rpx; font-size: 29rpx; font-weight: 700; }
.sku-list { display: flex; flex-direction: column; gap: 14rpx; }.sku-card { display: flex; align-items: center; gap: 16rpx; padding: 14rpx; border: 2rpx solid #eee9e2; border-radius: 18rpx; }.sku-card.active { border-color: #c35a32; background: #fff9f5; }.sku-card.disabled { opacity: .42; }.sku-image { width: 84rpx; height: 84rpx; border-radius: 12rpx; background: #eee; }.sku-copy { display: flex; flex: 1; flex-direction: column; gap: 8rpx; font-size: 25rpx; }.sku-copy text:last-child { color: #c45128; font-weight: 700; }.sku-stock { color: #999; font-size: 21rpx; }
.quantity-row { display: flex; justify-content: space-between; align-items: center; margin-top: 28rpx; padding: 24rpx 0; border-top: 1rpx solid #eee8e1; }.stepper { display: flex; overflow: hidden; border: 1rpx solid #ddd5ca; border-radius: 10rpx; }.stepper text { min-width: 64rpx; padding: 8rpx 0; text-align: center; border-right: 1rpx solid #ddd5ca; }.stepper text:last-child { border: 0; }.rules { display: flex; flex-direction: column; gap: 12rpx; margin-top: 20rpx; padding: 24rpx; color: #756d63; border-radius: 16rpx; background: #f7f3ed; font-size: 23rpx; line-height: 1.5; }.rules text:first-child { color: #342f2a; font-weight: 700; }.description { color: #504a43; font-size: 25rpx; line-height: 1.7; }
.bottom-bar { position: fixed; right: 0; bottom: 0; left: 0; display: flex; justify-content: space-between; align-items: center; padding: 18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,.96); box-shadow: 0 -8rpx 26rpx rgba(50,43,35,.08); }.total-label { color: #8e867d; font-size: 21rpx; }.total-points { display: block; color: #c74f28; font-size: 34rpx; font-weight: 800; }.exchange-btn { width: 260rpx; margin: 0; color: #fff; border-radius: 40rpx; background: #2e4439; font-size: 28rpx; }.exchange-btn[disabled] { opacity: .4; }
</style>
