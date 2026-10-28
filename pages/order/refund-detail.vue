<template>
  <view class="refund-page">
    <view v-if="loading" class="page-state">正在加载退款进度...</view>
    <view v-else-if="error" class="page-state">
      <text class="state-title">退款信息加载失败</text>
      <text class="state-copy">{{ error }}</text>
      <button class="retry-button" @click="load">重新加载</button>
    </view>
    <template v-else>
      <view class="status-card" :class="`status-${order.refundStatus}`">
        <text class="status-title">{{ refundStatusText }}</text>
        <text class="status-hint">{{ refundStatusHint }}</text>
      </view>

      <view v-if="product" class="product-card">
        <image class="product-image" :src="productImage" mode="aspectFill" />
        <view class="product-copy">
          <text class="product-name">{{ product.spuName }}</text>
          <text class="product-sku">{{ product.skuName || specText(product.specs) }}</text>
          <text class="refund-amount">退款金额 ¥{{ amount(order.finalAmount || order.totalAmount) }}</text>
        </view>
      </view>

      <view class="info-card">
        <text class="card-title">退款信息</text>
        <view class="info-row"><text>订单编号</text><text>{{ order.orderNo }}</text></view>
        <view class="info-row"><text>申请原因</text><text>{{ order.refundApplyReason || '-' }}</text></view>
        <view class="info-row"><text>申请时间</text><text>{{ order.refundApplyTime || '-' }}</text></view>
        <view v-if="order.refundConfirmRemark" class="info-row"><text>处理备注</text><text>{{ order.refundConfirmRemark }}</text></view>
        <view v-if="order.refundRejectReason" class="info-row"><text>拒绝原因</text><text>{{ order.refundRejectReason }}</text></view>
        <view v-if="order.refundSummary" class="info-row"><text>退款结果</text><text>{{ order.refundSummary }}</text></view>
      </view>

      <view class="timeline-card">
        <text class="card-title">退款进度</text>
        <view v-for="(item, index) in timeline" :key="item.title" class="timeline-item" :class="{ active: item.active }">
          <view class="timeline-mark"></view>
          <view class="timeline-copy">
            <text class="timeline-title">{{ item.title }}</text>
            <text class="timeline-description">{{ item.description }}</text>
          </view>
          <text class="timeline-time">{{ item.time || '-' }}</text>
          <view v-if="index < timeline.length - 1" class="timeline-line"></view>
        </view>
      </view>

      <view v-if="Number(order.refundStatus) === 4" class="bottom-bar">
        <button class="primary-button" @click="applyAgain">再次申请退款</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchOrderDetail } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const order = reactive({})
const products = ref([])
const orderId = ref('')
const loading = ref(true)
const error = ref('')
const product = computed(() => products.value[0] || null)
const productImage = computed(() => getStoragePreviewUrl(product.value?.spuMainImage) || '/static/logo.png')

const statusMap = { '1': '退款申请中', '2': '退款处理中', '3': '退款成功', '4': '退款已拒绝', '5': '退款失败' }
const refundStatusText = computed(() => statusMap[String(order.refundStatus)] || '暂无退款信息')
const refundStatusHint = computed(() => {
  if (String(order.refundStatus) === '1') return '申请已提交，等待商家处理'
  if (String(order.refundStatus) === '2') return '商家已同意，退款正在原路处理'
  if (String(order.refundStatus) === '3') return '退款已完成，请留意原支付账户'
  if (String(order.refundStatus) === '4') return '本次申请未通过，可查看原因后重新申请'
  if (String(order.refundStatus) === '5') return '第三方退款未成功，系统将继续处理'
  return '当前订单没有退款记录'
})

const timeline = computed(() => {
  const rows = [{
    title: '提交退款申请',
    description: order.refundApplyReason || '用户提交退款申请',
    time: order.refundApplyTime,
    active: Boolean(order.refundApplyTime)
  }]
  if (order.refundConfirmTime) {
    rows.push({ title: '商家同意退款', description: order.refundConfirmRemark || '退款申请已通过', time: order.refundConfirmTime, active: true })
  }
  if (order.refundRejectTime) {
    rows.push({ title: '商家拒绝退款', description: order.refundRejectReason || '退款申请未通过', time: order.refundRejectTime, active: true })
  }
  if (order.refundSuccessTime) {
    rows.push({ title: '退款成功', description: order.refundSummary || '退款已退回原支付账户', time: order.refundSuccessTime, active: true })
  } else if (String(order.refundStatus) === '5') {
    rows.push({ title: '退款失败', description: order.refundSummary || '第三方退款暂未成功', time: order.refundConfirmTime, active: true })
  }
  return rows
})

function amount(value) { return Number(value || 0).toFixed(2) }
function specText(specs) { return (specs || []).map((item) => `${item.specName}:${item.optName}`).join('；') }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchOrderDetail(orderId.value)
    Object.assign(order, data?.order || {})
    products.value = data?.shopProducts || []
  } catch (loadError) {
    error.value = loadError?.message || '请稍后重试'
  } finally {
    loading.value = false
  }
}

function applyAgain() {
  uni.navigateTo({ url: `/pages/order/refund-apply?orderId=${encodeURIComponent(orderId.value)}` })
}

onLoad((options = {}) => {
  orderId.value = options.orderId || ''
  if (!orderId.value) {
    error.value = '缺少订单参数'
    loading.value = false
    return
  }
  load()
})
</script>

<style scoped>
.refund-page { min-height: 100vh; box-sizing: border-box; padding: 24rpx 24rpx 164rpx; background: var(--ym-paper); }
.status-card { display: flex; flex-direction: column; gap: 12rpx; padding: 36rpx 30rpx; color: #fff; border-radius: var(--ym-radius-card); background: linear-gradient(135deg, #7a521d, var(--ym-warning)); }.status-3 { background: linear-gradient(135deg, var(--ym-brand-strong), var(--ym-brand)); }.status-4, .status-5 { background: linear-gradient(135deg, #7d3a35, var(--ym-danger)); }
.status-title { font-size: 38rpx; font-weight: 800; }.status-hint { color: rgba(255,255,255,.78); font-size: 24rpx; }
.product-card, .info-card, .timeline-card { margin-top: 20rpx; padding: 26rpx; border: 1rpx solid var(--ym-line); border-radius: var(--ym-radius-card); background: var(--ym-surface); }
.product-card { display: flex; gap: 20rpx; }.product-image { width: 144rpx; height: 144rpx; flex: 0 0 144rpx; border-radius: var(--ym-radius-control); }.product-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 10rpx; }.product-name { color: var(--ym-ink); font-size: 28rpx; font-weight: 700; }.product-sku { color: var(--ym-muted); font-size: 23rpx; }.refund-amount { margin-top: auto; color: var(--ym-price); font-size: 28rpx; font-weight: 700; }
.card-title { display: block; margin-bottom: 16rpx; color: var(--ym-ink); font-size: 29rpx; font-weight: 700; }.info-row { display: flex; justify-content: space-between; gap: 28rpx; padding: 13rpx 0; color: var(--ym-muted); font-size: 24rpx; line-height: 1.55; }.info-row text:last-child { max-width: 68%; color: var(--ym-ink-secondary); text-align: right; word-break: break-all; }
.timeline-item { position: relative; display: grid; min-height: 92rpx; grid-template-columns: 28rpx minmax(0,1fr) auto; gap: 12rpx; }.timeline-mark { z-index: 1; width: 18rpx; height: 18rpx; margin-top: 5rpx; box-sizing: border-box; border: 4rpx solid var(--ym-line-strong); border-radius: 50%; background: #fff; }.timeline-item.active .timeline-mark { border-color: var(--ym-brand); background: var(--ym-brand); }.timeline-line { position: absolute; top: 22rpx; bottom: -4rpx; left: 8rpx; width: 2rpx; background: var(--ym-line); }.timeline-copy { display: flex; flex-direction: column; gap: 7rpx; }.timeline-title { color: var(--ym-ink); font-size: 26rpx; font-weight: 600; }.timeline-description, .timeline-time { color: var(--ym-muted); font-size: 22rpx; }.timeline-time { white-space: nowrap; }
.bottom-bar { position: fixed; right: 0; bottom: 0; left: 0; padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid var(--ym-line); background: rgba(255,255,255,.98); }.primary-button { width: 100%; height: 88rpx; color: #fff; border-radius: var(--ym-radius-control); background: var(--ym-brand); font-size: 28rpx; line-height: 88rpx; }
.page-state { display: flex; min-height: 480rpx; align-items: center; justify-content: center; flex-direction: column; color: var(--ym-muted); text-align: center; }.state-title { color: var(--ym-ink); font-size: 30rpx; font-weight: 700; }.state-copy { margin-top: 10rpx; }.retry-button { min-width: 176rpx; height: 72rpx; margin-top: 28rpx; color: #fff; border-radius: var(--ym-radius-control); background: var(--ym-brand); font-size: 25rpx; line-height: 72rpx; }
</style>
