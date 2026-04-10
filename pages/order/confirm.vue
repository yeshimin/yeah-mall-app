<template>
	<view class="order-confirm">
		
		<!-- 收货地址 -->
		<view class="address-section">
			<view class="address-header">
				<text class="iconfont location-icon">&#xe611;</text>
				<text class="address-text">收货地址</text>
			</view>
			<view class="address-content" @click="selectAddress">
				<view class="address-info" v-if="selectedAddress">
					<view class="address-detail">
						<text class="name">{{ selectedAddress.name }}</text>
						<text class="phone">{{ selectedAddress.phone }}</text>
					</view>
					<view class="address-full">
						<text>{{ selectedAddress.address }}</text>
					</view>
				</view>
				<view class="no-address" v-else>
					<text>请选择收货地址</text>
				</view>
				<text class="iconfont arrow">&#xe65f;</text>
			</view>
		</view>
		
		<!-- 商品列表（按店铺分组） -->
		<view class="goods-section" v-for="(shop, shopIndex) in groupedOrderGoods" :key="shopIndex">
			<view class="shop-header">
				<text class="iconfont shop-icon">&#xe60c;</text>
				<text class="shop-name">{{ shop.shopName }}</text>
			</view>
			
			<view v-if="loading" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<template v-else>
				<view class="goods-item" v-for="(item, itemIndex) in shop.items" :key="itemIndex">
					<image class="goods-image" :src="item.image" mode="aspectFill"></image>
					<view class="goods-info">
						<text class="goods-name">{{ item.name }}</text>
						<text class="goods-spec">{{ item.spec }}</text>
						<view class="goods-price-quantity">
							<text class="goods-price">¥{{ item.price }}</text>
							<text class="goods-quantity">x{{ item.quantity }}</text>
						</view>
					</view>
				</view>
				
				<!-- 店铺小计 -->
				<view class="shop-subtotal">
					<text>店铺小计: </text>
					<text class="subtotal-price">¥{{ calculateShopTotal(shop) }}</text>
				</view>
			</template>
		</view>
		
		<!-- 空状态提示 -->
		<view class="empty-state" v-if="!loading && groupedOrderGoods.length === 0">
			<text class="iconfont empty-icon">&#xe64d;</text>
			<text class="empty-text">暂无商品信息</text>
		</view>
		
		<!-- 订单金额 -->
		<view class="order-amount">
			<view class="amount-item">
				<text>商品总额</text>
				<text>¥{{ goodsTotal }}</text>
			</view>
			<view class="amount-item">
				<text>运费</text>
				<text>¥{{ shippingFee }}</text>
			</view>
			<view class="amount-item coupon-item" @click="selectCoupon">
				<text>优惠券</text>
				<view class="coupon-info">
					<text class="discount-price" v-if="selectedCoupon">-¥{{ couponAmount }}</text>
					<text class="discount-price" v-else>-¥{{ couponAmount }}</text>
					<text class="coupon-name" v-if="selectedCoupon">{{ selectedCoupon.name }}</text>
					<text class="select-coupon" v-else>选择优惠券</text>
					<text class="iconfont arrow">
						&#xe65f;
					</text>
				</view>
			</view>
			<view class="total-amount">
				<text>合计:</text>
				<text class="total-price">¥{{ totalAmount }}</text>
			</view>
			<view class="blank">
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="total-info">
				<text class="total-label">合计:</text>
				<text class="total-price">¥{{ totalAmount }}</text>
			</view>
			<button class="submit-btn" @click="payOrder">付款</button>
		</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { fetchOrderPreview, queryAddressList, submitOrder } from '../../utils/api.js'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { getToken } from '@/utils/auth.js'

const instance = getCurrentInstance()

const selectedAddress = ref(null)
const addressLoading = ref(false)
const groupedOrderGoods = ref([])
const goodsTotal = ref('0.00')
const shippingFee = ref('0.00')
const loading = ref(false)
const requestItems = ref([])
const orderSource = ref(1)
const scene = ref('')
const selectedCoupon = ref(null)
const couponId = ref(null)

let seckillPollTimer = null

function roundAmount(value) {
  return Number(Number(value || 0).toFixed(2))
}

const couponAmount = computed(() => {
  const couponData = selectedCoupon.value
  const scopeAmount = Number(goodsTotal.value || 0)

  if (!couponData || scopeAmount <= 0) {
    return '0.00'
  }

  const couponType = String(couponData.type || '')
  if (couponType === '2') {
    const discount = Number(couponData.discount || 1)
    const discountedScopeAmount = roundAmount(scopeAmount * discount)
    const reducedAmount = Math.max(0, roundAmount(scopeAmount - discountedScopeAmount))
    return reducedAmount.toFixed(2)
  }

  const reducedAmount = Math.max(0, roundAmount(couponData.amount || 0))
  return reducedAmount.toFixed(2)
})

const totalAmount = computed(() => {
  return (Number(goodsTotal.value) + Number(shippingFee.value) - Number(couponAmount.value)).toFixed(2)
})

function clearSeckillPollTimer() {
  if (!seckillPollTimer) {
    return
  }

  clearTimeout(seckillPollTimer)
  seckillPollTimer = null
}

function createAuthHeader() {
  const header = {
    'Content-Type': 'application/json'
  }
  const token = getToken()

  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  return header
}

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

function buildGroupedGoods(data = []) {
  return data.map((shop) => ({
    shopId: shop.shopId,
    shopName: shop.shopName,
    items: (shop.items || []).map((item) => ({
      id: item.skuId,
      name: item.spuName || item.skuName,
      spec: item.specs && item.specs.length > 0
        ? item.specs.map((spec) => `${spec.specName}:${spec.optName}`).join(';')
        : item.skuName || '',
      price: item.price,
      quantity: item.quantity,
      image: getStoragePreviewUrl(item.spuMainImage || item.mainImage)
    }))
  }))
}

function calculateTotalPrice() {
  return groupedOrderGoods.value
    .flatMap((shop) => shop.items)
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2)
}

function calculateShopTotal(shop) {
  return shop.items
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2)
}

function processOrderPreviewData(data) {
  groupedOrderGoods.value = buildGroupedGoods(data)
  goodsTotal.value = calculateTotalPrice()
  loading.value = false
  uni.hideLoading()
}

async function refreshOrderData() {
  if (!requestItems.value || requestItems.value.length === 0) {
    uni.showToast({
      title: '没有商品数据',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '正在刷新数据...',
    icon: 'loading',
    duration: 500
  })

  await fetchOrderPreviewData(requestItems.value)
}

async function fetchOrderPreviewData(items) {
  loading.value = true
  uni.showLoading({
    title: '加载中...'
  })

  if (scene.value === 'seckill') {
    try {
      const res = await request({
        url: `${BASE_API}/app/order/previewForSeckill`,
        method: 'POST',
        header: createAuthHeader(),
        data: {
          items
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        processOrderPreviewData(res.data.data)
        return
      }

      console.error('获取秒杀订单预览失败:', res.data && res.data.message)
      uni.showToast({
        title: '获取订单信息失败，请重试',
        icon: 'none'
      })
    } catch (error) {
      console.error('请求秒杀订单预览失败:', error)
      uni.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    } finally {
      loading.value = false
      uni.hideLoading()
    }
    return
  }

  try {
    const data = await fetchOrderPreview(items)
    groupedOrderGoods.value = buildGroupedGoods(data)
    goodsTotal.value = calculateTotalPrice()
  } catch (error) {
    console.error('获取订单预览数据失败:', error)
    uni.showToast({
      title: '获取订单预览数据失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

function fetchDefaultAddress() {
  addressLoading.value = true
  queryAddressList({ isDefault: true })
    .then((data) => {
      if (!data || data.length === 0) {
        return
      }

      selectedAddress.value = {
        id: data[0].id,
        name: data[0].name,
        phone: data[0].contact,
        address: data[0].fullAddress,
        provinceCode: data[0].provinceCode,
        cityCode: data[0].cityCode,
        districtCode: data[0].districtCode,
        isDefault: data[0].isDefault
      }
    })
    .catch((error) => {
      console.error('获取默认地址失败:', error)
    })
    .finally(() => {
      addressLoading.value = false
    })
}

function selectAddress() {
  uni.navigateTo({
    url: '/pages/address/list?fromOrder=true'
  })
}

function selectCoupon() {
  const couponItems = requestItems.value
    .map((item) => ({
      skuId: Number(item.skuId),
      quantity: Number(item.quantity)
    }))
    .filter((item) => Number.isFinite(item.skuId) && item.skuId > 0 && Number.isFinite(item.quantity) && item.quantity > 0)

  if (couponItems.length === 0) {
    uni.showToast({
      title: '订单商品信息缺失',
      icon: 'none'
    })
    return
  }

  uni.setStorageSync('couponPreviewItems', couponItems)
  uni.navigateTo({
    url: '/pages/coupons/select'
  })
}

function navigateToPayResult({ orderId, orderNo = '', payResultType }) {
  const params = [`orderId=${orderId}`, `payResultType=${payResultType}`]
  if (orderNo) {
    params.push(`orderNo=${encodeURIComponent(orderNo)}`)
  }

  uni.navigateTo({
    url: `/pages/order/pay-result?${params.join('&')}`
  })
}

function startPayment(paymentData, { orderId, orderNo = '' }) {
  const payParams = {
    provider: 'wxpay',
    timeStamp: paymentData.timestamp,
    nonceStr: paymentData.nonceStr,
    package: paymentData.packageStr,
    signType: paymentData.signType,
    paySign: paymentData.paySign
  }

  if (typeof uni.requestPayment !== 'function') {
    uni.hideLoading()
    uni.showToast({
      title: '当前环境不支持微信支付',
      icon: 'none'
    })
    return
  }

  uni.requestPayment({
    ...payParams,
    success: () => {
      uni.hideLoading()
      navigateToPayResult({
        orderId,
        orderNo,
        payResultType: 'success'
      })
    },
    fail: (error) => {
      uni.hideLoading()
      navigateToPayResult({
        orderId,
        orderNo,
        payResultType: error.errMsg === 'requestPayment:fail cancel' ? 'cancel' : 'fail'
      })
    }
  })
}

async function payOrder() {
  if (!groupedOrderGoods.value || groupedOrderGoods.value.length === 0) {
    uni.showToast({
      title: '没有可支付的商品',
      icon: 'none'
    })
    return
  }

  if (!selectedAddress.value) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '处理中...'
  })

  const shop = groupedOrderGoods.value[0]
  const items = shop.items.map((item) => ({
    skuId: item.id,
    quantity: item.quantity
  }))

  const submitData = {
    items,
    addressId: selectedAddress.value.id,
    scene: orderSource.value === 2 ? 2 : 1,
    couponId: couponId.value
  }

  if (scene.value === 'seckill') {
    try {
      const res = await request({
        url: `${BASE_API}/app/order/submitForSeckill`,
        method: 'POST',
        header: createAuthHeader(),
        data: {
          items,
          addressId: selectedAddress.value.id,
          scene: '3',
          couponId: couponId.value
        }
      })

      if (res.statusCode === 200 && res.data.code === 0) {
        clearSeckillPollTimer()
        uni.showLoading({ title: '正在处理...' })
        pollSeckillResult(items[0].skuId, 0)
        return
      }

      uni.hideLoading()
      console.error('秒杀提交接口请求失败:', res.data && res.data.message)
      uni.showToast({
        title: (res.data && res.data.message) || '秒杀请求失败，请重试',
        icon: 'none'
      })
    } catch (error) {
      uni.hideLoading()
      console.error('秒杀提交接口请求失败:', error)
      uni.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      })
    }
    return
  }

  try {
    const result = await submitOrder(submitData)
    const paymentData = result.data
    startPayment(paymentData, {
      orderId: paymentData.orderId,
      orderNo: paymentData.orderNo
    })
  } catch (error) {
    console.error('支付处理失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '支付处理失败',
      icon: 'none'
    })
  }
}

function pollSeckillResult(skuId, retryCount) {
  if (retryCount >= 60) {
    uni.hideLoading()
    uni.showToast({
      title: '秒杀处理超时，请稍后查询订单状态',
      icon: 'none'
    })
    return
  }

  request({
    url: `${BASE_API}/app/order/querySeckillResult`,
    method: 'GET',
    header: createAuthHeader(),
    data: {
      skuId
    }
  })
    .then((res) => {
      if (res.statusCode === 200 && res.data.code === 0) {
        const result = res.data.data
        if (result && result.success) {
          uni.hideLoading()
          const paymentData = result.data
          startPayment(paymentData, {
            orderId: paymentData.orderId,
            orderNo: paymentData.orderNo || ''
          })
          return
        }
      } else {
        console.error('查询秒杀结果失败:', res.data && res.data.message)
      }

      seckillPollTimer = setTimeout(() => {
        pollSeckillResult(skuId, retryCount + 1)
      }, 2000)
    })
    .catch((error) => {
      console.error('查询秒杀结果失败:', error)
      seckillPollTimer = setTimeout(() => {
        pollSeckillResult(skuId, retryCount + 1)
      }, 2000)
    })
}

onLoad((options = {}) => {
  fetchDefaultAddress()
  scene.value = options.scene || ''

  if (options.skuId && options.quantity) {
    orderSource.value = 1
    requestItems.value = [{
      skuId: parseInt(options.skuId, 10),
      quantity: parseInt(options.quantity, 10)
    }]

    if (options.orderPreview) {
      processOrderPreviewData(JSON.parse(decodeURIComponent(options.orderPreview)))
      return
    }

    fetchOrderPreviewData(requestItems.value)
    return
  }

  const eventChannel = instance?.proxy?.getOpenerEventChannel?.()
  eventChannel?.on('acceptDataFromCartPage', (data) => {
    if (data && data.selectedItems && data.selectedItems.length > 0) {
      orderSource.value = 2
      requestItems.value = data.selectedItems
      fetchOrderPreviewData(data.selectedItems)
      return
    }

    loading.value = false
    uni.showToast({
      title: '没有选择商品',
      icon: 'none'
    })
  })
})

onShow(() => {
  const selectedAddr = uni.getStorageSync('selectedAddress')
  if (selectedAddr) {
    selectedAddress.value = selectedAddr
    uni.removeStorageSync('selectedAddress')
  }

  const storedCoupon = uni.getStorageSync('selectedCoupon')
  if (storedCoupon) {
    selectedCoupon.value = storedCoupon
    couponId.value = storedCoupon.id
    uni.removeStorageSync('selectedCoupon')
  }
})

onUnload(() => {
  clearSeckillPollTimer()
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

	.order-confirm {
		padding-bottom: 160rpx;
		margin-bottom: 60rpx;
		background-color: #f7f8fa;
		min-height: 100vh;
		box-sizing: border-box;
	}
	
	/* 加载状态样式 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0;
	}
	
	.loading-text {
		color: #999;
		font-size: 28rpx;
	}
	
	/* 空状态样式 */
	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;
		background-color: #fff;
		margin-top: 20rpx;
		border-radius: 12rpx;
	}
	
	.empty-icon {
		font-size: 80rpx;
		color: #ddd;
		margin-bottom: 20rpx;
	}
	
	.empty-text {
		color: #999;
		font-size: 28rpx;
	}

	.back-btn {
		font-size: 32rpx;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.address-section {
		margin-top: 10rpx; /* 减少顶部间距 */
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.address-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.location-icon {
		font-size: 36rpx;
		margin-right: 10rpx;
		color: #ff4757;
	}

	.address-text {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.address-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
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
	}

	.no-address {
		color: #999;
	}

	.arrow {
		font-size: 28rpx;
		color: #ccc;
	}

	/* 店铺分组样式 */
	.goods-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.shop-header {
		display: flex;
		align-items: center;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		margin-bottom: 10rpx;
	}

	.shop-icon {
		font-size: 32rpx;
		margin-right: 10rpx;
		color: #ff4757;
	}

	.shop-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.shop-subtotal {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 15rpx 0;
		border-top: 1rpx dashed #eee;
		margin-top: 10rpx;
	}

	.subtotal-price {
		color: #ff4757;
		font-weight: bold;
		margin-left: 10rpx;
	}

	.goods-item {
		display: flex;
		padding: 20rpx 0;
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
		font-weight: 500;
		color: #333;
		display: block;
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
		display: block;
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

	.order-amount {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.amount-item {
			display: flex;
			justify-content: space-between;
			padding: 15rpx 0;
			border-bottom: 1rpx solid #f5f5f5;
			font-size: 28rpx;
			color: #666;
		}
		
		.coupon-item {
			cursor: pointer;
		}
		
		.coupon-info {
			display: flex;
			align-items: center;
			justify-content: flex-end;
		}
		
		.coupon-name {
			margin: 0 10rpx;
			color: #999;
			font-size: 24rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 200rpx;
		}
		
		.select-coupon {
			margin: 0 10rpx;
			color: #4CAF50;
			font-size: 24rpx;
		}
		
		.coupon-info .arrow {
			margin-left: 5rpx;
			font-size: 24rpx;
			color: #ccc;
		}

	.discount-price {
		color: #4CAF50;
	}

	.total-amount {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		font-size: 32rpx;
		font-weight: bold;
	}

	.total-price {
		color: #ff4757;
	}

	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		padding: 0 30rpx;
		box-sizing: border-box;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		border-top: 1rpx solid #f5f5f5;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.total-info {
		display: flex;
		align-items: baseline;
	}

	.total-label {
		font-size: 28rpx;
		color: #333;
	}

	.total-info .total-price {
		font-size: 40rpx;
		font-weight: bold;
		color: #ff4757;
		margin-left: 10rpx;
	}

	.submit-btn {
		width: 220rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(to right, #ff6b6b, #ff4757);
		color: #fff;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: bold;
		box-shadow: 0 4rpx 10rpx rgba(255, 71, 87, 0.3);
		border: none;
	}

	.submit-btn:active {
		transform: scale(0.98);
		background: linear-gradient(to right, #ff5a5a, #ff3747);
	}
	.blank {
		height: 100rpx;
	}
</style>
