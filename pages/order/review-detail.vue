<template>
	<view class="review-detail-container">
		<!-- 订单基本信息 -->
		<view class="order-info">
			<view class="order-header">
				<text class="order-label">订单号：</text>
				<text class="order-value">{{ orderDetail.orderNo }}</text>
			</view>
			<view class="order-time">
				<text>{{ formatTime(orderDetail.reviewTime) }}</text>
			</view>
		</view>

		<!-- 整体订单评价 -->
		<view class="order-review">
			<view class="review-header">
				<text class="header-title">订单评价</text>
				<text class="anonymous-tag" v-if="orderDetail.isAnonymous">匿名评价</text>
			</view>
			<view class="sub-rates">
				<view class="rate-row">
					<text class="label">描述相符</text>
					<view class="stars sm">
						<text 
							v-for="i in 5" 
							:key="i" 
							class="star-icon" 
							:class="{ active: orderDetail.descriptionRating >= i }"
						>
							★
						</text>
					</view>
					<text class="rate-score">{{ orderDetail.descriptionRating }}分</text>
				</view>
				<view class="rate-row">
					<text class="label">物流服务</text>
					<view class="stars sm">
						<text 
							v-for="i in 5" 
							:key="i" 
							class="star-icon" 
							:class="{ active: orderDetail.deliveryRating >= i }"
						>
							★
						</text>
					</view>
					<text class="rate-score">{{ orderDetail.deliveryRating }}分</text>
				</view>
				<view class="rate-row">
					<text class="label">服务态度</text>
					<view class="stars sm">
						<text 
							v-for="i in 5" 
							:key="i" 
							class="star-icon" 
							:class="{ active: orderDetail.serviceRating >= i }"
						>
							★
						</text>
					</view>
					<text class="rate-score">{{ orderDetail.serviceRating }}分</text>
				</view>
			</view>
		</view>

		<!-- 商品评价列表 -->
		<view class="goods-reviews" v-if="orderDetail.items && orderDetail.items.length > 0">
			<view class="review-section-header">
				<text class="section-title">商品评价</text>
			</view>
			<view class="goods-review-item" v-for="(item, index) in orderDetail.items" :key="index">
				<view class="goods-info">
					<image class="goods-image" :src="getImageUrl(item.spuMainImage)" mode="aspectFill"></image>
					<view class="goods-details">
						<text class="goods-name">{{ item.spuName }}</text>
						<text class="goods-spec" v-if="item.specs">{{ getSpecString(item.specs) }}</text>
					</view>
				</view>
				<view class="review-content">
					<view class="overall-rating">
						<text class="label">综合评价：</text>
						<text class="rating-text">{{ getRatingText(item.overallRating) }}</text>
					</view>
					<view class="review-text" v-if="item.content">
						<text>{{ item.content }}</text>
					</view>
					<view class="review-images" v-if="item.images && item.images.length > 0">
						<view class="image-list">
							<view
								v-for="(img, imgIndex) in item.images" 
								:key="imgIndex"
								class="review-image-slot"
							>
								<image
									:src="getImageUrl(img)"
									mode="aspectFill"
									class="review-image"
									@click="previewImage(item.images, imgIndex)"
								></image>
							</view>
						</view>
					</view>
					<view class="review-replies" v-if="item.replies && item.replies.length">
						<view v-for="reply in item.replies" :key="reply.id" class="review-reply-item">
							<text class="reply-label">{{ reply.senderType === 1 ? '我的回复：' : '商家回复：' }}</text>
							<text>{{ reply.content }}</text>
						</view>
					</view>
					<text v-if="item.replyStatusText" class="reply-status">{{ item.replyStatusText }}</text>
					<view v-if="item.canReply || item.canEditReply" class="reply-editor">
						<input v-model="replyDrafts[item.id]" class="reply-input" :placeholder="item.canEditReply ? '修改你的回复' : '回复商家'" maxlength="500" />
						<button
							class="reply-button"
							:loading="replyingReviewId === item.id"
							:disabled="replyingReviewId === item.id"
							@click="submitReply(item)"
						>
							{{ item.canEditReply ? '保存' : '回复' }}
						</button>
					</view>
				</view>
				<view class="divider" v-if="index < orderDetail.items.length - 1"></view>
			</view>
		</view>

		<!-- 没有评价的提示 -->
		<view class="empty-review" v-if="!orderDetail || !orderDetail.items || orderDetail.items.length === 0">
			<text class="empty-text">暂无评价信息</text>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchOrderReviewDetail, replyProductReview } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const orderId = ref('')
const orderDetail = ref(null)
const replyingReviewId = ref('')
const replyDrafts = reactive({})

function formatTime(timeStr) {
  if (!timeStr) return ''
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
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function getImageUrl(path) {
  return getStoragePreviewUrl(path) || '/static/logo.png'
}

function getSpecString(specs) {
  if (!specs || !specs.length) return ''
  return specs.map((spec) => `${spec.specName}:${spec.optName}`).join('; ')
}

function getRatingText(rating) {
  if (rating === 1) return '差评'
  if (rating === 3) return '中评'
  if (rating === 5) return '好评'
  return '未评价'
}

function previewImage(images, current) {
  const urls = images.map((img) => getImageUrl(img))
  uni.previewImage({
    urls,
    current: urls[current]
  })
}

function loadOrderReviewDetail() {
  uni.showLoading({ title: '加载中...' })
  fetchOrderReviewDetail(orderId.value)
    .then((data) => {
      orderDetail.value = {
        orderNo: data.orderNo,
        reviewTime: data.reviewTime,
        isAnonymous: data.isAnonymous,
        descriptionRating: data.descriptionRating,
        deliveryRating: data.deliveryRating,
        serviceRating: data.serviceRating,
        items: (data.items || []).map((item) => {
          const replies = item.replies || []
          const latestReply = replies[replies.length - 1]
          if (item.canEditReply && latestReply) {
            replyDrafts[item.id] = latestReply.content
          }
          return {
            ...item,
            replies,
            overallRating: item.overallRating,
            images: item.images || []
          }
        })
      }
      uni.hideLoading()
    })
    .catch((error) => {
      uni.hideLoading()
      console.error('获取订单评价详情失败', error)
      uni.showToast({
        title: '获取评价详情失败',
        icon: 'none'
      })
    })
}

async function submitReply(item) {
  const content = (replyDrafts[item.id] || '').trim()
  if (!content) {
    uni.showToast({ title: '请输入回复内容', icon: 'none' })
    return
  }
  replyingReviewId.value = item.id
  try {
    await replyProductReview({ id: item.id, replyContent: content })
    uni.showToast({ title: item.canEditReply ? '回复已修改' : '回复成功', icon: 'success' })
    loadOrderReviewDetail()
  } catch (error) {
    uni.showToast({ title: error.message || '回复失败', icon: 'none' })
  } finally {
    replyingReviewId.value = ''
  }
}

onLoad((options = {}) => {
  if (options.orderId) {
    orderId.value = options.orderId
    loadOrderReviewDetail()
  } else {
    uni.showToast({
      title: '订单参数错误',
      icon: 'none'
    })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})
</script>

<style scoped>
	.review-detail-container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 30rpx;
	}

	.order-info {
		background-color: #fff;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.order-header {
		margin-bottom: 10rpx;
	}

	.order-label {
		font-size: 28rpx;
		color: #666;
	}

	.order-value {
		font-size: 28rpx;
		color: #333;
	}

	.order-time {
		font-size: 24rpx;
		color: #999;
	}

	.order-review {
		background-color: #fff;
		padding: 20rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.header-title {
		font-size: 30rpx;
		color: #333;
		font-weight: bold;
	}

	.anonymous-tag {
		font-size: 24rpx;
		color: #999;
		background-color: #f5f5f5;
		padding: 5rpx 15rpx;
		border-radius: 15rpx;
	}

	.sub-rates {
		margin-bottom: 20rpx;
	}

	.rate-row {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.label {
		font-size: 28rpx;
		color: #333;
		margin-right: 20rpx;
		width: 140rpx;
	}

	.stars {
		display: flex;
		margin-right: 20rpx;
	}

	.star-icon {
		font-size: 36rpx;
		color: #ddd;
		margin-right: 5rpx;
	}

	.star-icon.active {
		color: #ffca3e;
	}

	.rate-score {
		font-size: 28rpx;
		color: #999;
	}

	.goods-reviews {
		background-color: #fff;
		padding-bottom: 20rpx;
	}

	.review-section-header {
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.section-title {
		font-size: 30rpx;
		color: #333;
		font-weight: bold;
	}

	.goods-review-item {
		padding: 20rpx 30rpx;
	}

	.goods-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.goods-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		background-color: #f9f9f9;
	}

	.goods-details {
		flex: 1;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.goods-spec {
		font-size: 24rpx;
		color: #999;
	}

	.review-content {
		margin-left: 140rpx;
	}

	.overall-rating {
		margin-bottom: 15rpx;
	}

	.rating-text {
		font-size: 26rpx;
		color: #ff9000;
		font-weight: bold;
	}

	.review-text {
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
	}

	.review-text text {
		font-size: 26rpx;
		color: #333;
		line-height: 1.5;
	}

	.review-images {
		margin-bottom: 20rpx;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
	}

	.review-image-slot {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
		overflow: hidden;
		background-color: #f1f1f1;
	}

	.review-image {
		width: 100%;
		height: 100%;
	}

	.review-replies {
		margin-top: 12rpx;
	}

	.review-reply-item {
		margin-top: 10rpx;
		padding: 16rpx;
		border-radius: 8rpx;
		background-color: #f5f5f5;
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
	}

	.reply-label {
		color: #333;
		font-weight: bold;
	}

	.reply-status {
		display: block;
		margin-top: 12rpx;
		font-size: 22rpx;
		color: #999;
	}

	.reply-editor {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
		padding: 12rpx;
		background-color: #f7f7f7;
		border-radius: 8rpx;
	}

	.reply-input {
		flex: 1;
		height: 60rpx;
		padding: 0 16rpx;
		background-color: #fff;
		border-radius: 6rpx;
		font-size: 24rpx;
	}

	.reply-button {
		margin-left: 12rpx;
		padding: 0 20rpx;
		font-size: 24rpx;
		line-height: 60rpx;
		color: #fff;
		background-color: #ff5000;
		border-radius: 6rpx;
	}

	.divider {
		height: 1rpx;
		background-color: #f5f5f5;
		margin: 20rpx -30rpx;
	}

	.empty-review {
		background-color: #fff;
		padding: 100rpx 30rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 50rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>
