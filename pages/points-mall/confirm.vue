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
.page { min-height: 100vh; padding: 24rpx 24rpx 150rpx; box-sizing: border-box; background: #f4f1eb; color: #302c27; }.address-card, .order-card, .summary-card, .notice { margin-bottom: 20rpx; padding: 28rpx; border-radius: 22rpx; background: #fff; box-shadow: 0 6rpx 20rpx rgba(62,51,40,.05); }.address-card { position: relative; }.address-head { display: flex; gap: 22rpx; font-size: 29rpx; font-weight: 700; }.address-detail { display: block; margin-top: 12rpx; padding-right: 36rpx; color: #716960; font-size: 25rpx; line-height: 1.5; }.address-empty { color: #b05632; font-weight: 700; }.arrow { position: absolute; right: 24rpx; top: 50%; color: #aaa; font-size: 42rpx; transform: translateY(-50%); }
.order-card { display: flex; gap: 22rpx; }.image { width: 170rpx; height: 170rpx; flex: 0 0 170rpx; border-radius: 16rpx; background: #eee; }.product-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; }.name { font-size: 29rpx; font-weight: 700; }.sku { margin-top: 12rpx; color: #938a80; font-size: 23rpx; }.points { margin-top: auto; color: #c54f28; font-size: 30rpx; font-weight: 800; }
.summary-card view { display: flex; justify-content: space-between; padding: 14rpx 0; color: #6f675e; font-size: 25rpx; }.summary-card .remaining { margin-top: 12rpx; padding-top: 24rpx; color: #302c27; border-top: 1rpx solid #eee8e1; font-size: 29rpx; font-weight: 700; }.points-cost { color: #c64f2a; }.notice { display: flex; flex-direction: column; gap: 12rpx; color: #81786e; font-size: 23rpx; line-height: 1.5; }.notice text:first-child { color: #34302b; font-size: 27rpx; font-weight: 700; }
.bottom-bar { position: fixed; right: 0; bottom: 0; left: 0; display: flex; justify-content: space-between; align-items: center; padding: 18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -8rpx 24rpx rgba(60,50,40,.08); }.bottom-bar view text { display: block; }.bottom-bar view text:first-child { color: #8d857b; font-size: 20rpx; }.bottom-bar view text:last-child { color: #c54f29; font-size: 34rpx; font-weight: 800; }.bottom-bar button { width: 270rpx; margin: 0; color: #fff; border-radius: 42rpx; background: #2e4439; font-size: 28rpx; }.bottom-bar button[disabled] { opacity: .45; }
</style>
