<template>
	<view class="reviews-container">
		<!-- 评价统计头部 -->
		<view class="reviews-header">
			<view class="tags-row">
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'all' }"
					@click="switchType('all')"
				>全部 {{ total }}</view>
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'pic' }"
					@click="switchType('pic')"
				>有图 {{ picCount }}</view>
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'good' }"
					@click="switchType('good')"
				>好评 {{ goodCount }}</view>
			</view>
		</view>

		<!-- 评价列表 -->
		<scroll-view 
			scroll-y 
			class="reviews-list" 
			@scrolltolower="loadMore"
		>
			<view class="review-item" v-for="(item, index) in list" :key="index">
				<view class="user-info">
					<image 
						class="avatar" 
						:src="item.userAvatar || 'https://via.placeholder.com/60'" 
						mode="aspectFill"
					></image>
					<view class="user-detail">
						<text class="nickname">{{ item.userName || '匿名用户' }}</text>
						<view class="stars">
							<text 
								v-for="n in 5" 
								:key="n" 
								class="star-icon" 
								:class="{ active: n <= item.rate }"
							>★</text>
						</view>
					</view>
					<text class="time">{{ item.createTime }}</text>
				</view>
				
				<view class="review-content">
					<text>{{ item.content || '此用户没有填写评价。' }}</text>
				</view>
				
				<view class="review-images" v-if="item.images && item.images.length">
					<image 
						v-for="(img, imgIndex) in item.images" 
						:key="imgIndex"
						:src="img"
						mode="aspectFill"
						class="review-img"
						@click="previewImage(item.images, imgIndex)"
					></image>
				</view>
				
				<view class="sku-info" v-if="item.skuInfo">
					<text>{{ item.skuInfo }}</text>
				</view>

				<view class="merchant-reply" v-if="item.reply">
					<text class="reply-label">商家回复：</text>
					<text class="reply-content">{{ item.reply }}</text>
				</view>
			</view>
			
			<view class="loading-more">
				<text v-if="loading">加载中...</text>
				<text v-else-if="noMore">没有更多评价了</text>
				<text v-else></text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { fetchProductReviews } from '@/utils/api.js';

	export default {
		data() {
			return {
				productId: '',
				currentType: 'all',
				list: [],
				total: 0,
				picCount: 0,
				goodCount: 0,
				page: 1,
				loading: false,
				noMore: false
			};
		},
		onLoad(options) {
			if (options.productId) {
				this.productId = options.productId;
				this.loadData(true);
			}
		},
		methods: {
			switchType(type) {
				if (this.currentType === type) return;
				this.currentType = type;
				this.loadData(true);
			},
			loadData(refresh = false) {
				if (refresh) {
					this.page = 1;
					this.list = [];
					this.noMore = false;
				}
				
				if (this.loading || this.noMore) return;
				
				this.loading = true;
				
				fetchProductReviews(this.productId, {
					page: this.page,
					type: this.currentType
				}).then(res => {
					this.loading = false;
					this.total = res.total || 0;
					// 模拟一些统计数据，实际应由后端返回
					this.picCount = Math.floor(this.total * 0.3);
					this.goodCount = Math.floor(this.total * 0.95);
					
					if (res.list && res.list.length > 0) {
						this.list = [...this.list, ...res.list];
						this.page++;
					} else {
						this.noMore = true;
					}
				}).catch(err => {
					this.loading = false;
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
				});
			},
			loadMore() {
				this.loadData();
			},
			previewImage(urls, current) {
				uni.previewImage({
					urls: urls,
					current: current
				});
			}
		}
	}
</script>

<style scoped>
	.reviews-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.reviews-header {
		background-color: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		position: sticky;
		top: 0;
		z-index: 10;
		border-bottom: 1rpx solid #eee;
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
	}

	.tag-item {
		padding: 10rpx 24rpx;
		background-color: #ffe4e1;
		color: #333;
		border-radius: 30rpx;
		font-size: 24rpx;
		margin-right: 20rpx;
		margin-bottom: 10rpx;
		transition: all 0.3s;
	}

	.tag-item.active {
		background-color: #ff5000;
		color: #fff;
	}

	.reviews-list {
		flex: 1;
		height: 0; /* Important for scroll-view in flex layout */
	}

	.review-item {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #eee;
	}

	.user-detail {
		flex: 1;
	}

	.nickname {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 6rpx;
		display: block;
	}

	.stars {
		display: flex;
	}

	.star-icon {
		font-size: 24rpx;
		color: #ddd;
		margin-right: 4rpx;
	}

	.star-icon.active {
		color: #ffca3e;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.review-content {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		margin-bottom: 20rpx;
	}

	.review-images {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 10rpx;
	}

	.review-img {
		width: 220rpx;
		height: 220rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
		border-radius: 8rpx;
		background-color: #f9f9f9;
	}
    
    .review-img:nth-child(3n) {
        margin-right: 0;
    }

	.sku-info {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.merchant-reply {
		background-color: #f5f5f5;
		padding: 20rpx;
		border-radius: 8rpx;
		font-size: 26rpx;
		line-height: 1.4;
	}

	.reply-label {
		color: #333;
		font-weight: bold;
	}

	.reply-content {
		color: #666;
	}
	
	.loading-more {
		text-align: center;
		padding: 30rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>
