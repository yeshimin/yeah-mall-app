<template>
	<view class="order-detail">
		<!-- 订单状态 -->
		<view class="order-status-section" :class="`status-${orderInfo.orderStatus}`">
			<text class="status-text">{{ orderInfo.statusText }}</text>
			<text class="order-no">订单编号：{{ orderInfo.orderNo }}</text>
		</view>
		
		<!-- 收货地址 -->
		<view class="address-section">
			<view class="section-title">
				<text class="iconfont location-icon"></text>
				<text>收货地址</text>
			</view>
			<view class="address-content" v-if="orderInfo.address">
				<view class="address-info">
					<view class="address-detail">
						<text class="name">{{ orderInfo.address.name }}</text>
						<text class="phone">{{ orderInfo.address.phone }}</text>
					</view>
					<view class="address-full">
						<text>{{ orderInfo.address.address }}</text>
					</view>
				</view>
			</view>
			<view class="no-address" v-else>
				<text>暂无地址信息</text>
			</view>
		</view>
		
		<!-- 商品列表 -->
		<view class="goods-section">
			<view class="section-title">
				<text class="iconfont shop-icon"></text>
				<text>商品信息</text>
			</view>
			
			<view class="shop-header">
				<text class="shop-name">{{ orderInfo.shopName }}</text>
			</view>
			
			<view class="goods-item" v-for="(goods, idx) in orderInfo.goods" :key="idx">
				<image class="goods-image" :src="goods.image" mode="aspectFill"></image>
				<view class="goods-info">
					<text class="goods-name">{{ goods.name }}</text>
					<text class="goods-spec">{{ goods.spec }}</text>
					<view class="goods-price-quantity">
						<text class="goods-price">¥{{ goods.price }}</text>
						<text class="goods-quantity">x{{ goods.quantity }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 订单金额 -->
		<view class="amount-section">
			<view class="section-title">
				<text>订单金额</text>
			</view>
			<view class="amount-item">
				<text>商品总额</text>
				<text>¥{{ orderInfo.totalPrice }}</text>
			</view>
			<view class="amount-item">
				<text>运费</text>
				<text>¥{{ orderInfo.shippingFee }}</text>
			</view>
			<view class="amount-item total">
				<text>实付款</text>
				<text class="total-price">¥{{ orderInfo.actualPayment }}</text>
			</view>
		</view>
		
		<!-- 订单信息 -->
		<view class="info-section">
			<view class="section-title">
				<text>订单信息</text>
			</view>
			<view class="info-item">
				<text class="label">下单时间</text>
				<text class="value">{{ orderInfo.createTime }}</text>
			</view>
			<view class="info-item" v-if="orderInfo.paySuccessTime">
				<text class="label">支付时间</text>
				<text class="value">{{ orderInfo.paySuccessTime }}</text>
			</view>
			<view class="info-item" v-if="orderInfo.shipTime">
				<text class="label">发货时间</text>
				<text class="value">{{ orderInfo.shipTime }}</text>
			</view>
			<view class="info-item" v-if="orderInfo.deliveryTime">
				<text class="label">配送时间</text>
				<text class="value">{{ orderInfo.deliveryTime }}</text>
			</view>
			<view class="info-item" v-if="orderInfo.orderStatus === 4">
				<text class="label">完成时间</text>
				<text class="value">{{ orderInfo.completeTime }}</text>
			</view>
		</view>
		
		<!-- 物流信息入口 -->
		<view class="logistics-section" v-if="orderInfo.orderStatus >= 3 && orderInfo.trackingNo">
			<view class="section-title" @click="handleAction('logistics')">
				<text class="iconfont logistics-icon"></text>
				<text>物流信息</text>
				<text class="iconfont arrow-icon"></text>
			</view>
			<view class="logistics-entrance" @click="handleAction('logistics')">
				<view class="logistics-brief" v-if="orderInfo.logisticsInfo && orderInfo.logisticsInfo.result">
					<text class="logistics-company">{{ orderInfo.logisticsInfo.result.company }} {{ orderInfo.logisticsInfo.result.no }}</text>
					<text class="logistics-status" :class="orderInfo.logisticsInfo.result.status === '1' ? 'status-signed' : 'status-transit'">
						{{ orderInfo.logisticsInfo.result.status === '1' ? '已签收' : '运输中' }}
					</text>
				</view>
				<view class="logistics-brief" v-else>
					<text>查看物流详情</text>
				</view>
			</view>
		</view>
		
		<!-- 订单操作 -->
		<view class="order-actions" v-if="orderInfo.actions && orderInfo.actions.length > 0">
			<button 
				v-for="action in orderInfo.actions" 
				:key="action.value"
				class="action-btn"
				:class="action.type"
				@click="handleAction(action.value)"
			>
				{{ action.label }}
			</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { confirmReceive, fetchOrderDetail } from '../../utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const statusMap = {
  '1': '待付款',
  '2': '待发货',
  '3': '待收货',
  '4': '交易成功',
  '5': '交易关闭',
  '6': '退款',
  '7': '售后'
}

const refundStatusMap = {
  '1': '申请中',
  '2': '处理中',
  '3': '退款成功',
  '4': '已拒绝',
  '5': '退款失败'
}

const orderInfo = reactive({
  orderNo: '',
  orderId: '',
  orderStatus: 0,
  statusText: '',
  shopName: '',
  address: null,
  goods: [],
  totalPrice: 0,
  shippingFee: 0,
  actualPayment: 0,
  createTime: '',
  paySuccessTime: '',
  shipTime: '',
  deliveryTime: '',
  completeTime: '',
  logisticsInfo: '',
  trackingNo: '',
  actions: []
})

const loading = ref(true)

function getOrderActions(status) {
  const actions = []

  switch (status) {
    case 1:
      actions.push(
        { label: '取消订单', value: 'cancel', type: 'default' },
        { label: '付款', value: 'pay', type: 'primary' }
      )
      break
    case 2:
      actions.push(
        { label: '提醒发货', value: 'remind', type: 'default' },
        { label: '联系客服', value: 'contact', type: 'default' }
      )
      break
    case 3:
      actions.push(
        { label: '确认收货', value: 'confirm', type: 'primary' }
      )
      break
    case 4:
      actions.push(
        { label: '删除订单', value: 'delete', type: 'default' },
        { label: '去评价', value: 'comment', type: 'primary' },
        { label: '再次购买', value: 'rebuy', type: 'default' }
      )
      break
    case 5:
      actions.push(
        { label: '删除订单', value: 'delete', type: 'default' },
        { label: '再次购买', value: 'rebuy', type: 'default' }
      )
      break
    default:
      break
  }

  return actions
}

function processOrderData(orderData) {
  const order = orderData.order
  const shopProducts = orderData.shopProducts || []
  const deliveryTracking = orderData.deliveryTracking

  let statusText = statusMap[order.status] || '未知状态'
  if (order.status === '6' && order.refundStatus && order.refundStatus !== '0') {
    statusText = refundStatusMap[order.refundStatus] || '退款中'
  } else if (order.refundStatus && order.refundStatus !== '0') {
    statusText = '退款中'
  } else if (order.afterSaleStatus && order.afterSaleStatus !== '0') {
    statusText = '售后中'
  } else if (order.status === '4' && !order.reviewed) {
    statusText = '待评价'
  } else if (order.status === '4' && order.reviewed) {
    statusText = '已完成'
  }

  Object.assign(orderInfo, {
    orderNo: order.orderNo,
    orderId: order.id,
    orderStatus: parseInt(order.status, 10),
    statusText,
    shopName: `店铺${order.shopId || 1}`,
    address: {
      name: order.receiverName,
      phone: order.receiverContact,
      address: order.receiverFullAddress
    },
    goods: shopProducts.map((item) => ({
      id: item.spuId,
      spuId: item.spuId,
      skuId: item.skuId,
      name: item.spuName,
      spec: item.specs && item.specs.length > 0
        ? item.specs.map((spec) => `${spec.specName}:${spec.optName}`).join(';')
        : item.skuName || '',
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity, 10),
      image: getStoragePreviewUrl(item.spuMainImage) || '/static/logo.png'
    })),
    totalPrice: parseFloat(order.totalAmount || 0),
    shippingFee: 0,
    actualPayment: parseFloat(order.totalAmount || 0),
    createTime: order.createTime,
    paySuccessTime: order.paySuccessTime,
    shipTime: order.shipTime,
    deliveryTime: order.receiveTime,
    completeTime: order.receiveTime,
    logisticsInfo: deliveryTracking,
    trackingNo: order.trackingNo,
    actions: getOrderActions(parseInt(order.status, 10))
  })
}

async function loadOrderDetail(orderNo) {
  loading.value = true
  try {
    const orderData = await fetchOrderDetail(orderNo)
    processOrderData(orderData)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({
      title: error.message || '获取订单详情失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function handleAction(action) {
  switch (action) {
    case 'cancel':
      uni.showModal({
        title: '取消订单',
        content: '确定要取消该订单吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) {
            return
          }
          uni.showToast({
            title: '订单已取消',
            icon: 'success'
          })
          loadOrderDetail(orderInfo.orderId || orderInfo.orderNo)
        }
      })
      break
    case 'pay':
      uni.navigateTo({
        url: `/pages/order/pay-result?orderNo=${orderInfo.orderNo}&payResultType=wait`
      })
      break
    case 'remind':
      uni.showToast({
        title: '已提醒商家发货',
        icon: 'success'
      })
      break
    case 'contact':
      uni.navigateTo({
        url: '/pages/customer-service/index'
      })
      break
    case 'logistics':
      uni.navigateTo({
        url: `/pages/order/logistics?orderId=${orderInfo.orderId}`
      })
      break
    case 'confirm':
      submitConfirmReceive()
      break
    case 'delete':
      uni.showModal({
        title: '删除订单',
        content: '确定要删除该订单吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) {
            return
          }
          uni.showToast({
            title: '订单已删除',
            icon: 'success'
          })
          uni.navigateBack()
        }
      })
      break
    case 'comment':
      uni.navigateTo({
        url: `/pages/order/review?orderId=${orderInfo.orderId}`
      })
      break
    case 'rebuy':
      uni.showToast({
        title: '再次购买功能待实现',
        icon: 'none'
      })
      break
    default:
      break
  }
}

function submitConfirmReceive() {
  uni.showModal({
    title: '确认收货',
    content: '请确认您已收到商品',
    confirmText: '确认收货',
    cancelText: '取消',
    success: async (res) => {
      if (!res.confirm) {
        return
      }

      uni.showLoading({
        title: '处理中...'
      })
      try {
        await confirmReceive(orderInfo.orderId)
        uni.hideLoading()
        uni.showToast({
          title: '已确认收货',
          icon: 'success'
        })
        loadOrderDetail(orderInfo.orderId || orderInfo.orderNo)
      } catch (error) {
        uni.hideLoading()
        console.error('确认收货失败:', error)
        uni.showToast({
          title: error.message || '确认收货失败',
          icon: 'none'
        })
      }
    }
  })
}

onLoad((options = {}) => {
  if (options.orderId) {
    loadOrderDetail(options.orderId)
  } else if (options.orderNo) {
    loadOrderDetail(options.orderNo)
  } else {
    uni.showToast({
      title: '订单号或订单ID不能为空',
      icon: 'none'
    })
    uni.navigateBack()
  }
})
</script>

<style scoped>
	/* 图标字体 */
	@font-face {
		font-family: "iconfont";
		src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAAVMAAsAAAAACkQAAAT+AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqHVIYnATYCJAMUCwwABCAFhGcHSRvSCFGUTk6Q7CtsynAvFKKiUBQVK6okqrb39mhve0MwPPH9fvzOvXOfmUkyCZJookmkkyYxkUQoJEKlE6Lh/2ua/QFbYauha6OmdRXRVZTVRKpkZa7Di6ScvDk5OW8+Jy/xEqF4Eo1EIiRCIiRC8TQaiRBCJEQjEbKZZO7p3wHEADYDGwxsa6C2FjGIZlsTBGDhf66ZXpIWTdvs5uTmXuGKqvCrAqsAq8IqcEX1c3wNqMrfNy9fZCpgo6Dw1r6z5mzk7QvvU3oK/xOkADfnB7jjQAFtgAGxUOhdBgdl2zAMXcapYQwk2xEo9sX4+5T3Ke9T3qe+T/3/E0yAJILjv3hAodAQG4SoQVQBCu8zZfApJYYvIFPhC0ZU+EISDb4QRIsvJCnhCwkKQJYCQDvAeYBYA0jfIbehCBSxsYsJm1AwmJycpNFIJHK5RKlUqHQ6rVar0WrVcrlMJpOKRCIez+dZLHqnU+/z6QIBfTCo93iMJpPBYNB7vSa73RwO2+Nxe0+PY3DQNTLiHhvzjI97Jia8U1O+2Vnf/Lx/YSGwtBRcWQmtrUU2NqJbW7Hd3fj+fvzoKHF8nDw9TZ2dpS8u0tls5vIye3WVu77O5/P5m5vC7W3x7q50f1+G4+m0Nh5XRyKKUEgWCEj9fqnXK3G7JS6X2OkUOxxCm01gsQjMZoHJxDcY+Dod4HYDHg/g9QL9/cDAADAyAoyPA1NTwOws8PAAnJ8DuRyQzwO3t8DjI/D0BLy8AK+vwNsb8P4OfHwAn5/A1xfw/Q38/AJ/f8Df3+9/wPcP8P0LfP0BX7/A5w/w8Q28vwGvr8DLC/D8DDw9Ao8PwP0dcHcL3FwD+Wtgbw/Y3QV2doDtbWBrC9jcBDY2gLU1YHUVWFkBlpeBxUVgfh6YmwNmZ4GZGWBqCpicBMbHgdFRYHgYGBwEBgaA/n6grw/o7QV6eoDubqCrC+jsBI6OgMNDIJMB0mkglQISCSAeB2IxIBoFIhEgHAZCISAYBAIBwO8HfD7A6wU8HsDtBlwuwOkEHA7AbgdsNsBqBSwWwGwGTCbAaAQMBkCvB3Q6QKsFNBpArQZUKkCpBBQKQC4HZDJAKgXEYkAkAoRCQCAA+HyA1wt4PIDLBTgcgM0GWCyAyQQYDIBOB2g0gEoFyOWARCIQCPl8Hk/I5Qq4XD6Hw+dweBwOl81ms1gsJovFYLEYbDaDw2Fw/2MwGEwmk8VisVgsNpvN4XC4XC6Px+Pz+QKBQCgUisRiiUQilUplMplcLlcoFEqlUqVSqdVqjUaj1Wp1Op1er8cxHA9gWADHAyQJUBRA0wDDABwHCAKgKIBhAJYFOA7gecDnA4GALxKJJBKJTCZTKBQqlUqj0eh0OoPBYDKZLBaLzWZzOBwul8vj8QQCgVAoFIvFUqlUJpMplUqNRqPVanU6ncFgMJlMFovFZrM5HA6Xy+XxeHw+XyAQiEQiiUQik8mUSqVKpdJoNFqtVqfTGQwGk8lksVhsNpvD4XC5XB6Px+fzBQKBSCQSi8VSqVQmkymVSo1Go9VqdTqdwWAwmUwWi8Vms//8+QcmQZKo') format('woff2');
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-size: 32rpx;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* 订单详情容器 */
	.order-detail {
		background-color: #f7f8fa;
		min-height: 100vh;
		padding-bottom: 20rpx;
	}
	
	/* 订单状态区域 */
	.order-status-section {
		padding: 30rpx;
		background-color: #3cc51f;
		color: #fff;
		margin-bottom: 20rpx;
	}
	
	.status-1 {
		background-color: #ff9800;
	}
	
	.status-2 {
		background-color: #2196f3;
	}
	
	.status-3 {
		background-color: #9c27b0;
	}
	
	.status-4 {
		background-color: #4caf50;
	}
	
	.status-5 {
		background-color: #f44336;
	}
	
	.status-text {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.order-no {
		font-size: 26rpx;
		opacity: 0.8;
	}
	
	/* 地址区域 */
	.address-section {
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
	
	.section-title {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		background-color: #fafafa;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}
	
	.section-title .iconfont {
		margin-right: 10rpx;
		color: #3cc51f;
	}
	
	.location-icon {
		font-size: 36rpx;
	}
	
	.shop-icon {
		font-size: 32rpx;
	}
	
	.address-content {
		padding: 20rpx 30rpx;
	}
	
	.address-info {
		flex: 1;
	}
	
	.address-detail {
		display: flex;
		align-items: center;
	}
	
	.address-info .name {
		font-weight: bold;
		margin-right: 20rpx;
		color: #333;
	}
	
	.address-info .phone {
		color: #999;
	}
	
	.address-full {
		margin-top: 10rpx;
		color: #666;
		font-size: 26rpx;
	}
	
	.no-address {
		padding: 40rpx 30rpx;
		color: #999;
		text-align: center;
	}
	
	/* 商品列表区域 */
	.goods-section {
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
	
	.shop-header {
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}
	
	.goods-item {
		display: flex;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.goods-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		margin-right: 20rpx;
		background-color: #f9f9f9;
	}
	
	.goods-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.goods-name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.goods-spec {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}
	
	.goods-price-quantity {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.goods-price {
		font-size: 30rpx;
		font-weight: bold;
		color: #ff4757;
	}
	
	.goods-quantity {
		color: #666;
		font-size: 26rpx;
	}
	
	/* 金额区域 */
	.amount-section {
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
	
	.amount-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15rpx 30rpx;
		font-size: 28rpx;
		color: #666;
	}
	
	.amount-item.total {
		font-weight: bold;
		border-top: 1rpx solid #f5f5f5;
		padding-top: 20rpx;
		margin-top: 10rpx;
	}
	
	.total-price {
		color: #ff4757;
		font-size: 32rpx;
	}
	
	/* 订单信息区域 */
	.info-section {
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15rpx 30rpx;
		font-size: 28rpx;
		color: #666;
	}
	
	.info-item .label {
		color: #999;
	}
	
	/* 物流信息区域 */
	.logistics-section {
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
	
	/* 物流信息入口样式 */
	.section-title {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
		background-color: #fafafa;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		cursor: pointer;
	}
	
	.arrow-icon {
		margin-left: auto;
		font-size: 24rpx;
		color: #ccc;
	}
	
	.logistics-entrance {
		padding: 20rpx 30rpx;
		cursor: pointer;
	}
	
	.logistics-brief {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.logistics-company {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}
	
	.logistics-status {
		font-size: 24rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}
	
	.status-signed {
		background-color: #e8f5e8;
		color: #4caf50;
	}
	
	.status-transit {
		background-color: #fff3e0;
		color: #ff9800;
	}
	
	.no-logistics {
		color: #999;
		text-align: center;
		padding: 40rpx 0;
	}
	
	/* 订单操作按钮 */
	.order-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		flex-wrap: wrap;
		gap: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
	
	.action-btn {
		width: 160rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: 1rpx solid #ddd;
		background-color: #fff;
		color: #666;
	}
	
	.action-btn.primary {
		background-color: #3cc51f;
		color: #fff;
		border: 1rpx solid #3cc51f;
	}
	
	.action-btn.default {
		background-color: #fff;
		color: #666;
		border: 1rpx solid #ddd;
	}
</style>
