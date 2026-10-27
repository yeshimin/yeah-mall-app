<template>
  <view class="page" v-if="order.id">
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
  </view>
</template>

<script setup>
import { reactive } from 'vue'
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
onLoad(async ({ id }) => { orderId = id; try { await load() } catch (error) { uni.showToast({ title: error.message || '订单加载失败', icon: 'none' }) } })
</script>

<style scoped>
.page { min-height: 100vh; padding: 24rpx 24rpx 150rpx; box-sizing: border-box; background: #f4f1eb; color: #322e29; }.status-card { display: flex; flex-direction: column; gap: 12rpx; padding: 38rpx 32rpx; color: #fff; border-radius: 24rpx; background: linear-gradient(135deg, #b96b31, #d99b4a); }.status-card.points-status-shipped { background: linear-gradient(135deg, #32636a, #52928c); }.status-card.points-status-completed { background: linear-gradient(135deg, #30463a, #668265); }.status-card.points-status-canceled { background: linear-gradient(135deg, #74716c, #9a958e); }.status-title { font-size: 38rpx; font-weight: 800; }.status-card text:last-child { font-size: 23rpx; opacity: .85; }
.goods-card, .info-card { margin-top: 20rpx; padding: 26rpx; border-radius: 22rpx; background: #fff; box-shadow: 0 6rpx 20rpx rgba(62,51,40,.05); }.goods-card { display: flex; gap: 20rpx; }.goods-card image { width: 150rpx; height: 150rpx; flex: 0 0 150rpx; border-radius: 14rpx; background: #eee; }.goods-card > view { display: flex; flex-direction: column; gap: 10rpx; }.name { font-size: 29rpx; font-weight: 700; }.sku { color: #8d857b; font-size: 23rpx; }.points { margin-top: auto; color: #c65029; font-size: 30rpx; font-weight: 800; }.card-title { display: block; margin-bottom: 16rpx; font-size: 28rpx; font-weight: 800; }.info-card view { display: flex; justify-content: space-between; gap: 30rpx; padding: 12rpx 0; color: #756d64; font-size: 24rpx; line-height: 1.5; }.info-card view text:last-child { max-width: 70%; color: #3f3a34; text-align: right; word-break: break-all; }.link { color: #bd542e !important; }
.bottom-bar { position: fixed; right: 0; bottom: 0; left: 0; padding: 18rpx 26rpx calc(18rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -8rpx 24rpx rgba(60,50,40,.08); }.bottom-bar button { width: 100%; color: #fff; border-radius: 42rpx; font-size: 28rpx; }.cancel-btn { background: #806b5b; }.confirm-btn { background: #30463a; }
</style>
