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
.page {
  min-height: 100vh;
  padding-bottom: 164rpx;
  color: var(--ym-ink);
  background: var(--ym-paper);
}

.cover {
  width: 100%;
  height: 720rpx;
}

.content-card {
  position: relative;
  margin: 20rpx 24rpx 0;
  padding: 30rpx 28rpx 44rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.title-row > view {
  min-width: 0;
  flex: 1;
}

.name,
.subtitle {
  display: block;
}

.name {
  color: var(--ym-ink);
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
}

.subtitle {
  margin-top: 10rpx;
  color: var(--ym-muted);
  font-size: 24rpx;
}

.type-tag {
  align-self: flex-start;
  padding: 8rpx 14rpx;
  color: var(--ym-brand);
  border-radius: 8rpx;
  background: var(--ym-brand-soft);
  font-size: 21rpx;
  white-space: nowrap;
}

.section-title {
  display: block;
  margin: 38rpx 0 20rpx;
  color: var(--ym-ink);
  font-size: 29rpx;
  font-weight: 700;
}

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.sku-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 14rpx;
  border: 2rpx solid var(--ym-line);
  border-radius: var(--ym-radius-control);
}

.sku-card.active {
  border-color: var(--ym-brand);
  background: var(--ym-brand-soft);
}

.sku-card.disabled {
  opacity: 0.45;
}

.sku-image {
  width: 88rpx;
  height: 88rpx;
  border-radius: 12rpx;
}

.sku-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 8rpx;
  color: var(--ym-ink-secondary);
  font-size: 25rpx;
}

.sku-copy text:last-child {
  color: var(--ym-price);
  font-weight: 700;
}

.sku-stock {
  color: var(--ym-muted);
  font-size: 21rpx;
}

.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
  padding: 24rpx 0;
  border-top: 1rpx solid var(--ym-line);
}

.stepper {
  display: grid;
  width: 232rpx;
  height: 72rpx;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
  border: 1rpx solid var(--ym-line-strong);
  border-radius: var(--ym-radius-control);
  background: #fff;
}

.stepper text {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1rpx solid var(--ym-line);
  font-size: 27rpx;
}

.stepper text:last-child {
  border: 0;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 20rpx;
  padding: 24rpx;
  color: var(--ym-muted);
  border-radius: var(--ym-radius-control);
  background: var(--ym-surface-subtle);
  font-size: 23rpx;
  line-height: 1.55;
}

.rules text:first-child {
  color: var(--ym-ink);
  font-weight: 700;
}

.description {
  color: var(--ym-ink-secondary);
  font-size: 26rpx;
  line-height: 1.75;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--ym-line);
  background: rgba(255, 255, 255, 0.97);
}

.total-label {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.total-points {
  display: block;
  color: var(--ym-price);
  font-size: 34rpx;
  font-weight: 800;
}

.exchange-btn {
  width: 260rpx;
  height: 88rpx;
  margin: 0;
  color: #fff;
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand);
  font-size: 28rpx;
  line-height: 88rpx;
}

.exchange-btn[disabled] {
  background: #a9b4ae;
  opacity: 1;
}
</style>
