<template>
  <view class="page">
    <view v-if="loading" class="page-state">积分订单加载中...</view>
    <view v-else-if="loadError" class="page-state">
      <text>{{ loadError }}</text>
      <button class="retry-btn" @click="reloadOrder">重新加载</button>
    </view>
    <template v-else>
    <view class="status-card" :class="statusClass(order.status)">
      <text class="status-title">{{ statusText(order.status) }}</text>
      <text>{{ statusHint(order) }}</text>
    </view>

    <view class="goods-card">
      <image :src="imageUrl(order.productImage)" mode="aspectFill" />
      <view><text class="name">{{ order.productName }}</text><text class="sku">{{ order.skuName }} × {{ order.quantity }}</text><text class="points">{{ order.totalPoints }} 积分</text></view>
    </view>

    <view v-if="order.receiverName" class="info-card">
      <text class="card-title">收货信息</text>
      <view><text>收货人</text><text>{{ order.receiverName }} {{ order.receiverContact }}</text></view>
      <view><text>收货地址</text><text>{{ order.receiverFullAddress }}</text></view>
    </view>

    <view class="info-card">
      <text class="card-title">订单信息</text>
      <view><text>订单编号</text><text>{{ order.orderNo }}</text></view>
      <view><text>履约方式</text><text>{{ fulfillmentText(order.fulfillmentType) }}</text></view>
      <view><text>兑换时间</text><text>{{ order.createTime }}</text></view>
      <view v-if="order.shipTime"><text>发货时间</text><text>{{ order.shipTime }}</text></view>
      <view v-if="order.completeTime"><text>完成时间</text><text>{{ order.completeTime }}</text></view>
      <view v-if="order.cancelTime"><text>取消时间</text><text>{{ order.cancelTime }}</text></view>
      <view v-if="order.cancelReason"><text>取消原因</text><text>{{ order.cancelReason }}</text></view>
    </view>

    <view v-if="order.trackingNo || order.fulfillmentRemark || order.memberCouponId" class="info-card">
      <text class="card-title">履约信息</text>
      <view v-if="order.trackingNo"><text>物流公司</text><text>{{ order.deliveryProviderCode }}</text></view>
      <view v-if="order.trackingNo"><text>物流单号</text><text>{{ order.trackingNo }}</text></view>
      <view v-if="order.fulfillmentRemark"><text>履约说明</text><text>{{ order.fulfillmentRemark }}</text></view>
      <view v-if="order.memberCouponId"><text>优惠券</text><text class="link" @click="openCoupons">已发放，去查看 ›</text></view>
    </view>

    <view v-if="order.status === POINTS_ORDER_STATUS.PENDING_FULFILLMENT && order.fulfillmentType !== POINTS_FULFILLMENT_TYPE.AUTO_COUPON" class="bottom-bar">
      <button class="cancel-btn" @click="cancelOrder">取消兑换</button>
    </view>
    <view v-if="order.status === POINTS_ORDER_STATUS.SHIPPED" class="bottom-bar">
      <button class="confirm-btn" @click="confirmOrder">确认收货</button>
    </view>
    </template>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { cancelPointsOrder, confirmPointsOrder, fetchPointsOrderDetail } from '@/utils/api.js'
import {
  getPointsFulfillmentText,
  getPointsOrderStatusClass,
  getPointsOrderStatusText,
  POINTS_FULFILLMENT_TYPE,
  POINTS_ORDER_STATUS,
} from '@/utils/pointsMall.js'

const order = reactive({})
let orderId = ''
const loading = ref(true)
const loadError = ref('')
function imageUrl(key) { return key ? getStoragePreviewUrl(key) : '/static/logo.png' }
function statusText(value) { return getPointsOrderStatusText(value) }
function statusClass(value) { return getPointsOrderStatusClass(value) }
function fulfillmentText(value) { return getPointsFulfillmentText(value) }
function statusHint(value) {
  if (value.status === POINTS_ORDER_STATUS.PENDING_FULFILLMENT) {
    return value.fulfillmentType === POINTS_FULFILLMENT_TYPE.LOGISTICS ? '平台正在准备发货' : '平台正在处理本次兑换'
  }
  if (value.status === POINTS_ORDER_STATUS.SHIPPED) return '请留意物流信息，收到商品后确认收货'
  if (value.status === POINTS_ORDER_STATUS.COMPLETED) return '感谢你的兑换，期待下次见面'
  return '积分与库存已退回'
}
function openCoupons() { uni.navigateTo({ url: '/pages/coupons/list' }) }
async function load() { const data = await fetchPointsOrderDetail(orderId); Object.assign(order, data || {}) }
async function reloadOrder() {
  loading.value = true
  loadError.value = ''
  try {
    await load()
  } catch (error) {
    loadError.value = error?.message || '积分订单加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
function cancelOrder() {
  uni.showModal({ title: '取消兑换', content: '取消后积分和库存将自动退回，确认继续？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await cancelPointsOrder(order.id); uni.showToast({ title: '已取消', icon: 'success' }); await load() }
    catch (error) { uni.showToast({ title: error.message || '取消失败', icon: 'none' }) }
  } })
}
function confirmOrder() {
  uni.showModal({ title: '确认收货', content: '确认已经收到兑换商品？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await confirmPointsOrder(order.id); uni.showToast({ title: '订单已完成', icon: 'success' }); await load() }
    catch (error) { uni.showToast({ title: error.message || '操作失败', icon: 'none' }) }
  } })
}
onLoad(({ id }) => {
  orderId = id || ''
  if (!orderId) {
    loading.value = false
    loadError.value = '缺少积分订单ID'
    return
  }
  reloadOrder()
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

.page-state { display: flex; min-height: 60vh; align-items: center; justify-content: center; flex-direction: column; gap: 24rpx; padding: 48rpx; color: var(--ym-muted); font-size: 26rpx; text-align: center; }
.retry-btn { padding: 0 34rpx; color: #fff; background: var(--ym-brand); font-size: 24rpx; }
.retry-btn::after { border: 0; }

.status-card {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 36rpx 32rpx;
  color: #fff;
  border-radius: var(--ym-radius-card);
  background: linear-gradient(135deg, #7a521d, var(--ym-warning));
}

.status-card.points-status-shipped {
  background: linear-gradient(135deg, #275861, #3d7a78);
}

.status-card.points-status-completed {
  background: linear-gradient(135deg, var(--ym-brand-strong), var(--ym-brand));
}

.status-card.points-status-canceled {
  background: linear-gradient(135deg, #59645e, #78827c);
}

.status-title {
  font-size: 38rpx;
  font-weight: 800;
}

.status-card text:last-child {
  font-size: 23rpx;
  opacity: 0.84;
}

.goods-card,
.info-card {
  margin-top: 20rpx;
  padding: 26rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
}

.goods-card {
  display: flex;
  gap: 20rpx;
}

.goods-card image {
  width: 150rpx;
  height: 150rpx;
  flex: 0 0 150rpx;
  border-radius: var(--ym-radius-control);
}

.goods-card > view {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
}

.name {
  color: var(--ym-ink);
  font-size: 29rpx;
  font-weight: 700;
}

.sku {
  color: var(--ym-muted);
  font-size: 23rpx;
}

.points {
  margin-top: auto;
  color: var(--ym-price);
  font-size: 30rpx;
  font-weight: 800;
}

.card-title {
  display: block;
  margin-bottom: 16rpx;
  color: var(--ym-ink);
  font-size: 28rpx;
  font-weight: 800;
}

.info-card view {
  display: flex;
  justify-content: space-between;
  gap: 30rpx;
  padding: 12rpx 0;
  color: var(--ym-muted);
  font-size: 24rpx;
  line-height: 1.55;
}

.info-card view text:last-child {
  max-width: 70%;
  color: var(--ym-ink-secondary);
  text-align: right;
  word-break: break-all;
}

.link {
  color: var(--ym-brand) !important;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--ym-line);
  background: rgba(255, 255, 255, 0.97);
}

.bottom-bar button {
  width: 100%;
  height: 88rpx;
  color: #fff;
  border-radius: var(--ym-radius-control);
  font-size: 28rpx;
  line-height: 88rpx;
}

.cancel-btn {
  background: #59665f;
}

.confirm-btn {
  background: var(--ym-brand);
}
</style>
