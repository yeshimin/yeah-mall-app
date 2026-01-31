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
							<image 
								v-for="(img, imgIndex) in item.images" 
								:key="imgIndex" 
								:src="getImageUrl(img)" 
								mode="aspectFill" 
								class="review-image"
								@click="previewImage(item.images, imgIndex)"
							></image>
						</view>
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

<script>
	import { fetchOrderDetail } from '@/utils/api.js';
	import { BASE_API } from '@/utils/config.js';

	export default {
		data() {
			return {
				orderId: '',
				orderDetail: null
			};
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId;
				this.loadOrderReviewDetail();
			} else {
				uni.showToast({
					title: '订单参数错误',
					icon: 'none'
				});
				setTimeout(() => uni.navigateBack(), 1500);
			}
		},
		methods: {
			// 加载订单评价详情
			loadOrderReviewDetail() {
				uni.showLoading({ title: '加载中...' });
				// 这里应该调用获取订单评价详情的API
				// 暂时使用fetchOrderDetail模拟，实际项目中应该替换为专门的评价详情API
				fetchOrderDetail(this.orderId).then(data => {
					// 模拟评价数据
					this.orderDetail = {
						orderNo: data.orderNo,
						reviewTime: data.reviewTime || new Date().toISOString(),
						isAnonymous: false,
						descriptionRating: 5,
						deliveryRating: 5,
						serviceRating: 5,
						items: data.shopProducts.map(product => ({
							orderItemId: product.orderItemId,
							spuId: product.spuId,
							skuId: product.skuId,
							spuName: product.spuName,
							spuMainImage: product.spuMainImage,
							specs: product.specs,
							overallRating: 5,
							content: '商品质量很好，物流速度快，服务态度好，非常满意！',
							images: product.spuMainImage ? [product.spuMainImage] : []
						}))
					};
					uni.hideLoading();
				}).catch(err => {
					uni.hideLoading();
					console.error('获取订单评价详情失败', err);
					uni.showToast({
						title: '获取评价详情失败',
						icon: 'none'
					});
				});
			},
			// 格式化时间
			formatTime(timeStr) {
				if (!timeStr) return '';
				let formattedTimeStr = timeStr;
				if (timeStr.includes(' ') && !timeStr.includes('T')) {
					formattedTimeStr = timeStr.replace(/-/g, '/');
				}
				const date = new Date(formattedTimeStr);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}`;
			},
			// 获取图片URL
			getImageUrl(path) {
				if (!path) return 'https://via.placeholder.com/100';
				if (path.startsWith('http')) return path;
				return `${BASE_API}/public/storage/preview?fileKey=${path}`;
			},
			// 获取规格字符串
			getSpecString(specs) {
				if (!specs || !specs.length) return '';
				return specs.map(s => `${s.specName}:${s.optName}`).join('; ');
			},
			// 获取评分文本
			getRatingText(rating) {
				switch (rating) {
					case 1:
						return '差评';
					case 3:
						return '中评';
					case 5:
						return '好评';
					default:
						return '未评价';
				}
			},
			// 预览图片
			previewImage(images, current) {
				const urls = images.map(img => this.getImageUrl(img));
				uni.previewImage({
					urls: urls,
					current: urls[current]
				});
			}
		}
	};
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

	.review-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
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