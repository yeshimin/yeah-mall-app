<template>
	<view class="container">
		<view class="coupon-list">
			<view class="coupon-item" v-for="coupon in availableCoupons" :key="coupon.id" @click="selectCoupon(coupon)">
				<view class="coupon-left">
					<text class="coupon-amount">¥{{ coupon.amount }}</text>
					<text class="coupon-condition" v-if="coupon.minAmount > 0">满{{ coupon.minAmount }}元可用</text>
					<text class="coupon-condition" v-else>无门槛</text>
				</view>
				<view class="coupon-right">
					<text class="coupon-name">{{ coupon.name }}</text>
					<text class="coupon-time">有效期至: {{ formatDate(coupon.endTime) }}</text>
					<view class="coupon-range">
						<text class="range-text" v-if="coupon.useRange === 1">指定店铺</text>
						<text class="range-text" v-else-if="coupon.useRange === 2">指定商品</text>
						<text class="range-text" v-else-if="coupon.useRange === 3">指定分类</text>
					</view>
				</view>
			</view>
			
			<view class="empty-state" v-if="availableCoupons.length === 0 && !loading">
				<text class="empty-text">暂无可用优惠券</text>
			</view>
		</view>
		
		<view class="bottom-tip">
			<text>点击优惠券即可使用</text>
		</view>
	</view>
</template>

<script>
	import { BASE_API } from '@/utils/config.js';

	export default {
		data() {
			return {
				availableCoupons: [],
				loading: false
			};
		},
		onLoad() {
			this.fetchAvailableCoupons();
		},
		methods: {
			fetchAvailableCoupons() {
				this.loading = true;
				uni.showLoading({ title: '加载中...' });
				
				uni.request({
					url: `${BASE_API}/app/coupon/availableList`,
					method: 'GET',
					header: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${uni.getStorageSync('token')}`
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data.code === 0) {
							this.availableCoupons = res.data.data || [];
						} else {
							uni.showToast({ title: '获取优惠券失败', icon: 'none' });
						}
					},
					fail: () => {
						uni.showToast({ title: '网络错误', icon: 'none' });
					},
					complete: () => {
						this.loading = false;
						uni.hideLoading();
					}
				});
			},
			
			selectCoupon(coupon) {
				uni.setStorageSync('selectedCoupon', coupon);
				uni.navigateBack();
			},
			
			formatDate(dateStr) {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				return `${year}-${month}-${day}`;
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-bottom: 60rpx;
	}

	.coupon-list {
		padding: 20rpx;
	}

	.coupon-item {
		display: flex;
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.coupon-left {
		flex: 0 0 180rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-right: 30rpx;
		border-right: 1rpx dashed #eee;
	}

	.coupon-amount {
		font-size: 48rpx;
		font-weight: bold;
		color: #ff4757;
		margin-bottom: 10rpx;
	}

	.coupon-condition {
		font-size: 24rpx;
		color: #999;
	}

	.coupon-right {
		flex: 1;
		padding-left: 30rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.coupon-name {
		font-size: 28rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 15rpx;
	}

	.coupon-time {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 10rpx;
	}

	.coupon-range {
		display: flex;
		align-items: center;
	}

	.range-text {
		font-size: 20rpx;
		color: #4CAF50;
		background-color: #f0f9ff;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.bottom-tip {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 60rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		border-top: 1rpx solid #f5f5f5;
	}

	.bottom-tip text {
		font-size: 24rpx;
		color: #666;
	}
</style>
