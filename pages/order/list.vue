<template>
	<view class="order-list">
		<!-- 订单状态筛选Tab -->
		<scroll-view class="status-tabs-container" scroll-x="true" :scroll-left="scrollLeft" scroll-with-animation="true">
			<view class="status-tabs">
				<view 
					v-for="tab in statusTabs" 
					:key="tab.value"
					class="tab-item"
					:class="{ active: activeTab === tab.value }"
					@click="switchTab(tab.value)"
				>
					<text>{{ tab.label }}</text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 评价Tab的子Tab -->
		<view v-if="activeTab == 5" class="review-sub-tabs">
			<view 
				v-for="tab in reviewSubTabs" 
				:key="tab.value"
				class="review-sub-tab-item"
				:class="{ active: activeReviewSubTab === tab.value }"
				@click="switchReviewSubTab(tab.value)"
			>
				<text>{{ tab.label }}</text>
			</view>
		</view>
		
		<!-- 订单列表 -->
		<scroll-view class="order-content" scroll-y="true" @scrolltolower="loadMore" :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
			<view v-if="loading && orders.length === 0" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<template v-else>
				<!-- 订单为空状态 -->
				<view class="empty-state" v-if="orders.length === 0 && !loading">
					<text class="empty-icon">📦</text>
					<text class="empty-text">暂无订单</text>
					<button class="go-shop-btn" @click="goToShop">去逛逛</button>
				</view>
				
				<!-- 订单列表 -->
				<view class="order-item" v-for="order in orders" :key="order.id">
					<!-- 订单头部：店铺信息 -->
					<view class="order-header">
						<view class="shop-info">
							<text class="shop-icon">🏪</text>
							<text class="shop-name">{{ order.shopName }}</text>
						</view>
						<text class="order-status">{{ order.statusText }}</text>
					</view>
					
					<!-- 订单商品列表 -->
					<view class="order-goods" v-for="(goods, idx) in order.goods" :key="idx" @click="goToDetail(order.id, order.orderNo)">
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
					
					<!-- 订单金额 -->
					<view class="order-amount">
						<text>共{{ order.totalQuantity }}件商品 合计：</text>
						<text class="total-price">¥{{ order.totalPrice }}</text>
						<text class="shipping-fee" v-if="order.shippingFee > 0"> (含运费¥{{ order.shippingFee }})</text>
					</view>
					
					<!-- 订单时间 -->
					<view class="order-time">
						<text class="time-label">{{ getTimeLabel(order) }}：</text>
						<text class="time-value">{{ getOrderTime(order) }}</text>
					</view>
					
					<!-- 订单操作按钮 -->
					<view class="order-actions">
						<template v-if="activeTab === 5">
							<!-- 评价Tab的特殊处理 -->
							<template v-if="activeReviewSubTab === 0">
								<!-- 待评价 -->
								<button 
									class="action-btn primary"
									@click="handleOrderAction('comment', order)"
								>
									去评价
								</button>
							</template>
							<template v-else>
								<!-- 已评价 -->
								<button 
									class="action-btn default"
									@click="handleOrderAction('viewReview', order)"
								>
									查看评价
								</button>
							</template>
						</template>
						<template v-else>
							<!-- 其他Tab的默认处理 -->
							<button 
								v-for="action in getOrderActions(order.orderStatus)" 
								:key="action.value"
								class="action-btn"
								:class="action.type"
								@click="handleOrderAction(action.value, order)"
							>
								{{ action.label }}
							</button>
						</template>
					</view>
				</view>
				
				<!-- 加载更多状态 -->
				<view v-if="orders.length > 0" class="load-more-container">
					<view v-if="loading" class="loading-more">
						<text class="loading-text">加载中...</text>
					</view>
					<view v-else-if="pageInfo.current >= pageInfo.pages" class="no-more">
						<text class="no-more-text">没有更多了</text>
					</view>
					<view v-else class="load-more">
						<text class="load-more-text">上拉加载更多</text>
					</view>
				</view>
			</template>
		</scroll-view>
	</view>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { cancelOrder, confirmReceive, fetchOrderList, fetchPaymentInfo } from '../../utils/api.js'
import { getStoragePreviewUrl } from '../../utils/config.js'

const instance = getCurrentInstance()

const statusTabs = [
  { label: '全部', value: 0 },
  { label: '待付款', value: 1 },
  { label: '待发货', value: 2 },
  { label: '待收货', value: 3 },
  { label: '退款/售后', value: 4 },
  { label: '评价', value: 5 }
]

const reviewSubTabs = [
  { label: '待评价', value: 0 },
  { label: '已评价', value: 1 }
]

const statusMap = {
  1: '待付款',
  2: '待发货',
  3: '待收货',
  4: '交易成功',
  5: '交易关闭',
  6: '退款',
  7: '售后'
}

const refundStatusMap = {
  0: '无',
  1: '申请中',
  2: '处理中',
  3: '退款成功',
  4: '已拒绝'
}

const afterSaleStatusMap = {
  0: '无',
  1: '申请中',
  2: '处理中',
  3: '售后完成',
  4: '已驳回'
}

const activeTab = ref(0)
const activeReviewSubTab = ref(0)
const scrollLeft = ref(0)
const orders = ref([])
const loading = ref(false)
const refreshing = ref(false)

const pageInfo = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

function goToShop() {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

function goToDetail(orderId) {
  uni.navigateTo({
    url: `/pages/order/detail?orderId=${orderId}`
  })
}

function getTimeLabel(order) {
  if (order.orderStatus === 1) {
    return '创建时间'
  }

  if (order.orderStatus === 2) {
    return '支付时间'
  }

  return '创建时间'
}

function formatTime(timeStr) {
  if (!timeStr) {
    return ''
  }

  let formattedTimeStr = timeStr
  if (timeStr.includes(' ') && !timeStr.includes('T')) {
    formattedTimeStr = timeStr.replace(/-/g, '/')
  }

  const date = new Date(formattedTimeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function getOrderTime(order) {
  if (order.orderStatus === 1) {
    return formatTime(order.createTime)
  }

  if (order.orderStatus === 2) {
    return formatTime(order.paySuccessTime || order.createTime)
  }

  return formatTime(order.createTime)
}

function scrollToActiveTab() {
  const query = uni.createSelectorQuery().in(instance?.proxy)
  query.select('.status-tabs').boundingClientRect((containerRect) => {
    query.selectAll('.tab-item').boundingClientRect((tabRects) => {
      if (!containerRect || !tabRects || !tabRects[activeTab.value]) {
        return
      }

      const activeTabRect = tabRects[activeTab.value]
      const targetScrollLeft = activeTabRect.left - containerRect.left - (containerRect.width - activeTabRect.width) / 2
      scrollLeft.value = Math.max(0, targetScrollLeft)
    }).exec()
  }).exec()
}

function switchTab(value) {
  activeTab.value = value
  if (value === 5) {
    activeReviewSubTab.value = 0
  }
  fetchOrders(true)
  nextTick(() => {
    setTimeout(() => {
      scrollToActiveTab()
    }, 100)
  })
}

function switchReviewSubTab(value) {
  activeReviewSubTab.value = value
  fetchOrders(true)
}

function processOrderData(orderRecords = []) {
  return orderRecords.map((order) => {
    const orderStatus = Number(order.orderStatus)
    const refundStatus = Number(order.refundStatus || 0)
    const afterSaleStatus = Number(order.afterSaleStatus || 0)

    let statusText = statusMap[orderStatus] || '未知状态'
    if (refundStatus !== 0) {
      statusText = refundStatusMap[refundStatus] || '退款中'
    } else if (afterSaleStatus !== 0) {
      statusText = afterSaleStatusMap[afterSaleStatus] || '售后中'
    } else if (orderStatus === 4 && !order.isReviewed) {
      statusText = '待评价'
    } else if (orderStatus === 4 && order.isReviewed) {
      statusText = '已完成'
    }

    const processedGoods = (order.items || []).map((item) => ({
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
    }))

    const totalQuantity = processedGoods.reduce((total, item) => total + item.quantity, 0)
    const totalPrice = processedGoods.reduce((total, item) => total + item.price * item.quantity, 0)

    return {
      id: order.orderId || order.id,
      orderNo: order.orderNo || '',
      shopId: order.shopId,
      shopName: order.shopName || `店铺${order.shopId}`,
      orderStatus,
      statusText,
      totalPrice: totalPrice.toFixed(2),
      totalQuantity,
      shippingFee: parseFloat(order.shippingFee || 0),
      createTime: order.createTime,
      paySuccessTime: order.paySuccessTime,
      refundStatus,
      afterSaleStatus,
      isReviewed: !!order.isReviewed,
      goods: processedGoods
    }
  })
}

function generateMockOrders() {
  const mockOrders = [
    {
      id: 1,
      orderNo: 'MOCK20260324001',
      shopId: 1,
      shopName: '时尚精品店',
      orderStatus: 1,
      refundStatus: 0,
      afterSaleStatus: 0,
      shippingFee: 10,
      createTime: '2026-03-24 10:00:00',
      items: [
        {
          spuId: 101,
          spuName: '时尚连衣裙',
          spuMainImage: '',
          skuId: 1001,
          skuName: '红色-M',
          specs: [
            { specName: '颜色', optName: '红色' },
            { specName: '尺码', optName: 'M' }
          ],
          price: 99.5,
          quantity: 2
        }
      ]
    },
    {
      id: 2,
      orderNo: 'MOCK20260324002',
      shopId: 2,
      shopName: '家居生活馆',
      orderStatus: 2,
      refundStatus: 0,
      afterSaleStatus: 0,
      shippingFee: 0,
      createTime: '2026-03-23 09:30:00',
      paySuccessTime: '2026-03-23 09:45:00',
      items: [
        {
          spuId: 201,
          spuName: '舒适枕头',
          spuMainImage: '',
          skuId: 2001,
          skuName: '记忆棉-单个装',
          specs: [
            { specName: '材质', optName: '记忆棉' },
            { specName: '规格', optName: '单个装' }
          ],
          price: 299,
          quantity: 1
        }
      ]
    },
    {
      id: 3,
      orderNo: 'MOCK20260324003',
      shopId: 3,
      shopName: '运动户外店',
      orderStatus: 3,
      refundStatus: 0,
      afterSaleStatus: 0,
      shippingFee: 15,
      createTime: '2026-03-22 12:20:00',
      items: [
        {
          spuId: 301,
          spuName: '运动鞋',
          spuMainImage: '',
          skuId: 3001,
          skuName: '白色-42码',
          specs: [
            { specName: '颜色', optName: '白色' },
            { specName: '尺码', optName: '42码' }
          ],
          price: 399,
          quantity: 1
        }
      ]
    },
    {
      id: 4,
      orderNo: 'MOCK20260324004',
      shopId: 4,
      shopName: '美妆护肤店',
      orderStatus: 4,
      refundStatus: 0,
      afterSaleStatus: 0,
      shippingFee: 0,
      createTime: '2026-03-21 14:10:00',
      isReviewed: false,
      items: [
        {
          spuId: 401,
          spuName: '护肤套装',
          spuMainImage: '',
          skuId: 4001,
          skuName: '补水-套装',
          specs: [
            { specName: '功效', optName: '补水' },
            { specName: '规格', optName: '套装' }
          ],
          price: 258,
          quantity: 1
        }
      ]
    },
    {
      id: 5,
      orderNo: 'MOCK20260324005',
      shopId: 5,
      shopName: '电子产品店',
      orderStatus: 4,
      refundStatus: 0,
      afterSaleStatus: 0,
      shippingFee: 0,
      createTime: '2026-03-20 08:30:00',
      isReviewed: true,
      items: [
        {
          spuId: 501,
          spuName: '无线耳机',
          spuMainImage: '',
          skuId: 5001,
          skuName: '黑色-标准版',
          specs: [
            { specName: '颜色', optName: '黑色' },
            { specName: '版本', optName: '标准版' }
          ],
          price: 399,
          quantity: 1
        }
      ]
    }
  ]

  let filteredOrders = mockOrders
  if (activeTab.value === 1) {
    filteredOrders = mockOrders.filter((order) => order.orderStatus === 1)
  } else if (activeTab.value === 2) {
    filteredOrders = mockOrders.filter((order) => order.orderStatus === 2)
  } else if (activeTab.value === 3) {
    filteredOrders = mockOrders.filter((order) => order.orderStatus === 3)
  } else if (activeTab.value === 5) {
    filteredOrders = mockOrders.filter((order) => order.orderStatus === 4 && (activeReviewSubTab.value === 1 ? order.isReviewed : !order.isReviewed))
  }

  return processOrderData(filteredOrders)
}

async function fetchOrders(isRefresh = false) {
  if (isRefresh) {
    pageInfo.current = 1
    orders.value = []
  }

  loading.value = true
  try {
    let conditions = ''
    if (activeTab.value === 5) {
      conditions = `isReviewed:eq:${activeReviewSubTab.value}`
    }

    const response = await fetchOrderList(activeTab.value, pageInfo.current, pageInfo.size, conditions)

    pageInfo.current = response.current
    pageInfo.size = response.size
    pageInfo.total = response.total
    pageInfo.pages = response.pages

    const processedOrders = processOrderData(response.records)
    if (pageInfo.current === 1) {
      orders.value = processedOrders
    } else {
      orders.value = [...orders.value, ...processedOrders]
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)

    if (error.message === 'AUTH_401') {
      return
    }

    uni.showToast({
      title: '获取订单失败，使用模拟数据',
      icon: 'none'
    })

    orders.value = generateMockOrders()
    pageInfo.current = 1
    pageInfo.size = 10
    pageInfo.total = orders.value.length
    pageInfo.pages = 1
  } finally {
    loading.value = false
    if (isRefresh) {
      refreshing.value = false
    }
  }
}

function onRefresh() {
  refreshing.value = true
  fetchOrders(true)
}

function loadMore() {
  if (loading.value || pageInfo.current >= pageInfo.pages) {
    return
  }

  pageInfo.current += 1
  fetchOrders()
}

function getOrderActions(status) {
  const actions = []

  switch (Number(status)) {
    case 1:
      actions.push(
        { label: '取消订单', value: 'cancel', type: 'default' },
        { label: '付款', value: 'pay', type: 'primary' }
      )
      break
    case 2:
      actions.push(
        { label: '提醒发货', value: 'remind', type: 'default' },
        { label: '退款', value: 'refund', type: 'primary' }
      )
      break
    case 3:
      actions.push(
        { label: '查看物流', value: 'logistics', type: 'default' },
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
    case 7:
      actions.push(
        { label: '售后详情', value: 'afterSaleDetail', type: 'primary' }
      )
      break
    default:
      break
  }

  return actions
}

function navigateToPayResult(order, payResultType) {
  uni.navigateTo({
    url: `/pages/order/pay-result?orderId=${order.id}&orderNo=${order.orderNo}&payResultType=${payResultType}`
  })
}

function startPayment(paymentData, order) {
  const payParams = {
    provider: 'wxpay',
    timeStamp: paymentData.timestamp,
    nonceStr: paymentData.nonceStr,
    package: paymentData.packageStr,
    signType: paymentData.signType,
    paySign: paymentData.paySign
  }

  uni.requestPayment({
    ...payParams,
    success: () => {
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      navigateToPayResult(order, 'success')
    },
    fail: (error) => {
      navigateToPayResult(order, error.errMsg === 'requestPayment:fail cancel' ? 'cancel' : 'fail')
    }
  })
}

function refreshCurrentOrders() {
  fetchOrders(true)
}

function handleOrderAction(action, order) {
  switch (action) {
    case 'pay':
      uni.showLoading({
        title: '加载支付信息中...'
      })
      fetchPaymentInfo(order.id)
        .then((paymentData) => {
          uni.hideLoading()
          startPayment(paymentData, order)
        })
        .catch((error) => {
          uni.hideLoading()
          console.error('获取支付信息失败:', error)
          uni.showToast({
            title: '获取支付信息失败，请稍后重试',
            icon: 'none'
          })
        })
      break
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

          uni.showLoading({
            title: '处理中...'
          })
          cancelOrder(order.id)
            .then(() => {
              uni.hideLoading()
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              refreshCurrentOrders()
            })
            .catch((error) => {
              uni.hideLoading()
              console.error('取消订单失败:', error)
              uni.showToast({
                title: error.message || '取消订单失败',
                icon: 'none'
              })
            })
        }
      })
      break
    case 'remind':
      uni.showToast({
        title: '已提醒商家发货',
        icon: 'success'
      })
      break
    case 'refund':
      uni.navigateTo({
        url: `/pages/order/refund-apply?orderId=${order.id}`
      })
      break
    case 'confirm':
      uni.showModal({
        title: '确认收货',
        content: '请确认您已收到商品',
        confirmText: '确认收货',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) {
            return
          }

          uni.showLoading({
            title: '处理中...'
          })
          confirmReceive(order.id)
            .then(() => {
              uni.hideLoading()
              uni.showToast({
                title: '已确认收货',
                icon: 'success'
              })
              refreshCurrentOrders()
            })
            .catch((error) => {
              uni.hideLoading()
              console.error('确认收货失败:', error)
              uni.showToast({
                title: error.message || '确认收货失败',
                icon: 'none'
              })
            })
        }
      })
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
          refreshCurrentOrders()
        }
      })
      break
    case 'rebuy':
      uni.showToast({
        title: '再次购买功能开发中',
        icon: 'none'
      })
      break
    case 'refundDetail':
    case 'afterSaleDetail':
      uni.navigateTo({
        url: `/pages/order/detail?orderId=${order.id}`
      })
      break
    case 'logistics':
      uni.navigateTo({
        url: `/pages/order/logistics?orderId=${order.id}`
      })
      break
    case 'comment':
      uni.navigateTo({
        url: `/pages/order/review?orderId=${order.id}`
      })
      break
    case 'viewReview':
      uni.navigateTo({
        url: `/pages/order/review-detail?orderId=${order.id}`
      })
      break
    default:
      break
  }
}

onLoad((options = {}) => {
  if (options.status) {
    activeTab.value = parseInt(options.status, 10)
  }

  fetchOrders()
  nextTick(() => {
    setTimeout(() => {
      scrollToActiveTab()
    }, 100)
  })
})
</script>

<style scoped>
	/* 全局样式重置 */
	page {
		background-color: #f8f8f8;
	}

	/* 订单列表容器 */
	.order-list {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	/* 订单状态筛选Tab容器 */
	.status-tabs-container {
		height: 80rpx;
		background-color: #fff;
		margin-top: 0;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 90;
		white-space: nowrap;
	}

	/* 订单状态筛选Tab */
	.status-tabs {
		display: flex;
		align-items: center;
		height: 100%;
		min-width: 100%;
	}

	.tab-item {
		flex: none;
		min-width: 120rpx;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.tab-item.active {
		color: #3cc51f;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 4rpx;
		background-color: #3cc51f;
		border-radius: 2rpx;
	}

	/* 评价Tab的子Tab */
	.review-sub-tabs {
		display: flex;
		background-color: #fff;
		border-bottom: 1rpx solid #f5f5f5;
		position: sticky;
		top: 80rpx;
		z-index: 80;
	}

	.review-sub-tab-item {
		flex: 1;
		height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #666;
		position: relative;
	}

	.review-sub-tab-item.active {
		color: #3cc51f;
	}

	.review-sub-tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 4rpx;
		background-color: #3cc51f;
		border-radius: 2rpx;
	}

	/* 订单内容区域 */
	.order-content {
		padding: 20rpx;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;
	}

	.loading-text {
		color: #999;
		font-size: 28rpx;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
		background-color: #fff;
		border-radius: 12rpx;
	}

	.empty-icon {
		font-size: 120rpx;
		color: #ddd;
		margin-bottom: 30rpx;
	}

	.empty-text {
		color: #999;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}

	.go-shop-btn {
		width: 200rpx;
		height: 60rpx;
		line-height: 60rpx;
		background-color: #3cc51f;
		color: #fff;
		border-radius: 30rpx;
		font-size: 28rpx;
		border: none;
	}

	/* 加载更多状态 */
	.load-more-container {
		padding: 20rpx 0;
		text-align: center;
	}

	.loading-more,
	.no-more,
	.load-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx 0;
	}

	.loading-text,
	.no-more-text,
	.load-more-text {
		font-size: 26rpx;
		color: #999;
	}

	.loading-text {
		color: #3cc51f;
	}

	/* 订单项 */
	.order-item {
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	/* 订单头部 */
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.shop-info {
		display: flex;
		align-items: center;
	}

	.shop-icon {
		font-size: 32rpx;
		margin-right: 10rpx;
		color: #3cc51f;
	}

	.shop-name {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.order-status {
		font-size: 28rpx;
		color: #ff4757;
		font-weight: 500;
	}

	/* 订单商品 */
	.order-goods {
		display: flex;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		cursor: pointer;
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

	/* 订单金额 */
	.order-amount {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		font-size: 28rpx;
		color: #666;
	}

	.total-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff4757;
		margin: 0 10rpx;
	}

	.shipping-fee {
		font-size: 24rpx;
		color: #999;
	}

	/* 订单时间 */
	.order-time {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 0 20rpx 20rpx 20rpx;
		font-size: 26rpx;
		color: #999;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.time-label {
		color: #999;
	}

	.time-value {
		color: #666;
		margin-left: 10rpx;
	}

	/* 订单操作按钮 */
	.order-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 20rpx;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.action-btn {
		width: 140rpx;
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
