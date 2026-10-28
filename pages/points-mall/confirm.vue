<template>
  <view class="page" v-if="product.id && sku.id">
    <view v-if="product.fulfillmentType === POINTS_FULFILLMENT_TYPE.LOGISTICS" class="address-card" @click="chooseAddress">
      <template v-if="address.id">
        <view class="address-head"><text>{{ address.name }}</text><text>{{ address.contact }}</text></view>
        <text class="address-detail">{{ address.fullAddress }}</text>
      </template>
      <text v-else class="address-empty">请选择收货地址</text>
      <text class="arrow">›</text>
    </view>

    <view class="order-card">
      <image class="image" :src="imageUrl(sku.mainImage || product.mainImage)" mode="aspectFill" />
      <view class="product-copy">
        <text class="name">{{ product.name }}</text>
        <text class="sku">{{ sku.name }}</text>
        <text class="points">{{ sku.pointsPrice }} 积分 × {{ quantity }}</text>
      </view>
    </view>

    <view class="summary-card">
      <view><text>履约方式</text><text>{{ fulfillmentText(product.fulfillmentType) }}</text></view>
      <view><text>当前积分</text><text>{{ balance }}</text></view>
      <view><text>兑换积分</text><text class="points-cost">{{ totalPoints }}</text></view>
      <view class="remaining"><text>兑换后剩余</text><text>{{ remainingPointsText }}</text></view>
    </view>

    <view class="notice">
      <text>兑换须知</text>
      <text>积分兑换成功后将生成独立的积分订单。</text>
      <text v-if="product.fulfillmentType === POINTS_FULFILLMENT_TYPE.AUTO_COUPON">优惠券会自动发放，兑换成功后不可取消。</text>
      <text v-else>待履约前可以取消订单，积分和库存会自动退回。</text>
    </view>

    <view class="bottom-bar">
      <view><text>应付</text><text>{{ totalPoints }} 积分</text></view>
      <button :loading="submitting" :disabled="submitting || balance < totalPoints" @click="submitExchange">
        {{ balance < totalPoints ? '积分不足' : '确认兑换' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { exchangePointsProduct, fetchPointsMallDetail, fetchPointsMallSkus, fetchPointsOverview, queryAddressList } from '@/utils/api.js'
import {
  getPointsFulfillmentText,
  POINTS_EXCHANGE_MIN_QUANTITY,
  POINTS_FULFILLMENT_TYPE,
} from '@/utils/pointsMall.js'

const product = reactive({})
const sku = reactive({})
const address = reactive({})
const quantity = ref(POINTS_EXCHANGE_MIN_QUANTITY)
const balance = ref(0)
const submitting = ref(false)
const requestNo = ref('')
const totalPoints = computed(() => Number(sku.pointsPrice || 0) * quantity.value)
const remainingPointsText = computed(() => {
  const remaining = balance.value - totalPoints.value
  return remaining < 0 ? '积分不足' : remaining
})

function imageUrl(key) { return key ? getStoragePreviewUrl(key) : '/static/logo.png' }
function fulfillmentText(value) { return getPointsFulfillmentText(value) }
function chooseAddress() { uni.navigateTo({ url: '/pages/address/list?fromOrder=true' }) }

async function loadDefaultAddress() {
  if (product.fulfillmentType !== POINTS_FULFILLMENT_TYPE.LOGISTICS || address.id) return
  const list = await queryAddressList()
  const selected = (list || []).find((item) => item.isDefault) || (list || [])[0]
  if (selected) Object.assign(address, selected)
}

async function submitExchange() {
  if (product.fulfillmentType === POINTS_FULFILLMENT_TYPE.LOGISTICS && !address.id) { uni.showToast({ title: '请选择收货地址', icon: 'none' }); return }
  submitting.value = true
  try {
    const order = await exchangePointsProduct({
      skuId: sku.id,
      quantity: quantity.value,
      addressId: address.id || null,
      requestNo: requestNo.value,
    })
    uni.showToast({ title: '兑换成功', icon: 'success' })
    setTimeout(() => uni.redirectTo({ url: `/pages/points-mall/order-detail?id=${order.id}` }), 700)
  } catch (error) { uni.showToast({ title: error.message || '兑换失败', icon: 'none' }) }
  finally { submitting.value = false }
}

onLoad(async ({ spuId, skuId, quantity: count }) => {
  requestNo.value = `PX${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  quantity.value = Math.max(POINTS_EXCHANGE_MIN_QUANTITY, Number(count || POINTS_EXCHANGE_MIN_QUANTITY))
  try {
    const [detail, skuList, overview] = await Promise.all([
      fetchPointsMallDetail(spuId), fetchPointsMallSkus(spuId), fetchPointsOverview(),
    ])
    Object.assign(product, detail || {})
    const target = (skuList || []).find((item) => item.id === skuId)
    if (!target) throw new Error('积分商品规格已失效')
    Object.assign(sku, target)
    balance.value = Number(overview?.balance || 0)
    await loadDefaultAddress()
  } catch (error) { uni.showToast({ title: error.message || '兑换信息加载失败', icon: 'none' }) }
})

onShow(() => {
  const selected = uni.getStorageSync('selectedAddress')
  if (selected?.id) {
    Object.assign(address, { id: selected.id, name: selected.name, contact: selected.phone, fullAddress: selected.address })
    uni.removeStorageSync('selectedAddress')
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 24rpx 24rpx 164rpx;
  color: var(--ym-ink);
  background: var(--ym-paper);
}

.address-card,
.order-card,
.summary-card,
.notice {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.address-card {
  position: relative;
}

.address-head {
  display: flex;
  gap: 22rpx;
  color: var(--ym-ink);
  font-size: 29rpx;
  font-weight: 700;
}

.address-detail {
  display: block;
  margin-top: 12rpx;
  padding-right: 36rpx;
  color: var(--ym-muted);
  font-size: 25rpx;
  line-height: 1.55;
}

.address-empty {
  color: var(--ym-brand);
  font-weight: 700;
}

.arrow {
  position: absolute;
  top: 50%;
  right: 24rpx;
  color: var(--ym-muted);
  font-size: 42rpx;
  transform: translateY(-50%);
}

.order-card {
  display: flex;
  gap: 22rpx;
}

.image {
  width: 170rpx;
  height: 170rpx;
  flex: 0 0 170rpx;
  border-radius: var(--ym-radius-control);
}

.product-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.name {
  color: var(--ym-ink);
  font-size: 29rpx;
  font-weight: 700;
}

.sku {
  margin-top: 12rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
}

.points {
  margin-top: auto;
  color: var(--ym-price);
  font-size: 30rpx;
  font-weight: 800;
}

.summary-card view {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  color: var(--ym-muted);
  font-size: 25rpx;
}

.summary-card view text:last-child {
  color: var(--ym-ink-secondary);
}

.summary-card .remaining {
  margin-top: 12rpx;
  padding-top: 24rpx;
  color: var(--ym-ink);
  border-top: 1rpx solid var(--ym-line);
  font-size: 29rpx;
  font-weight: 700;
}

.points-cost,
.summary-card .remaining text:last-child {
  color: var(--ym-price) !important;
}

.notice {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  color: var(--ym-muted);
  background: var(--ym-surface-subtle);
  font-size: 23rpx;
  line-height: 1.55;
}

.notice text:first-child {
  color: var(--ym-ink);
  font-size: 27rpx;
  font-weight: 700;
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

.bottom-bar view text {
  display: block;
}

.bottom-bar view text:first-child {
  color: var(--ym-muted);
  font-size: 21rpx;
}

.bottom-bar view text:last-child {
  color: var(--ym-price);
  font-size: 34rpx;
  font-weight: 800;
}

.bottom-bar button {
  width: 270rpx;
  height: 88rpx;
  margin: 0;
  color: #fff;
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand);
  font-size: 28rpx;
  line-height: 88rpx;
}

.bottom-bar button[disabled] {
  background: #a9b4ae;
  opacity: 1;
}
</style>
