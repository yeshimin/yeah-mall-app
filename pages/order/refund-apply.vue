<template>
	<view class="refund-apply">
		<!-- 退款原因 -->
		<view class="refund-section">
			<text class="section-title">退款原因</text>
			<view class="reason-list">
				<view 
					v-for="(reason, idx) in refundReasons" 
					:key="idx"
					class="reason-item"
					:class="{ active: selectedReason === reason.value }"
					@click="selectReason(reason.value)"
				>
					<text class="reason-text">{{ reason.label }}</text>
					<text class="reason-icon" v-if="selectedReason === reason.value">✓</text>
				</view>
			</view>
		</view>
		
		<!-- 退款说明 -->
		<view class="refund-section">
			<text class="section-title">退款说明</text>
			<textarea 
				class="refund-description"
				v-model="refundDescription"
				placeholder="请输入退款说明（选填）"
				placeholder-style="color: #999"
				maxlength="200"
			></textarea>
			<text class="description-count">{{ refundDescription.length }}/200</text>
		</view>
		
		<!-- 提交按钮 -->
		<view class="submit-section">
			<button 
				class="submit-btn"
				:disabled="!selectedReason"
				@click="submitRefund"
			>
				提交申请
			</button>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-overlay">
			<view class="loading-content">
				<text class="loading-text">处理中...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { applyRefund } from '../../utils/api.js';
	
	export default {
		data() {
			return {
				// 订单ID
				orderId: '',
				// 加载状态
				loading: false,
				// 选中的退款原因
				selectedReason: '',
				// 退款说明
				refundDescription: '',
				// 退款原因列表（参考淘宝）
				refundReasons: [
					{ label: '不想要了', value: '不想要了' },
					{ label: '拍错了', value: '拍错了' },
					{ label: '多拍了', value: '多拍了' },
					{ label: '商品无货', value: '商品无货' },
					{ label: '商品信息与描述不符', value: '商品信息与描述不符' },
					{ label: '商品质量问题', value: '商品质量问题' },
					{ label: '商家发错货', value: '商家发错货' },
					{ label: '物流问题', value: '物流问题' },
					{ label: '其他原因', value: '其他原因' }
				]
			};
		},
		onLoad(options) {
			// 获取订单ID
			if (options.orderId) {
				this.orderId = options.orderId;
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 选择退款原因
			selectReason(reason) {
				this.selectedReason = reason;
			},
			
			// 提交退款申请
			async submitRefund() {
				if (!this.selectedReason) {
					uni.showToast({
						title: '请选择退款原因',
						icon: 'none'
					});
					return;
				}
				
				if (!this.orderId) {
					uni.showToast({
						title: '订单信息错误',
						icon: 'none'
					});
					return;
				}
				
				this.loading = true;
				try {
					// 调用退款申请接口
					await applyRefund(this.orderId, this.selectedReason + (this.refundDescription ? `：${this.refundDescription}` : ''));
					
					// 申请成功
					uni.showToast({
						title: '退款申请已提交',
						icon: 'success'
					});
					
					// 延迟返回上一页
					setTimeout(() => {
						// 返回订单列表页面
						uni.redirectTo({
							url: '/pages/order/list'
						});
					}, 1500);
				} catch (error) {
					console.error('申请退款失败:', error);
					uni.showToast({
						title: error.message || '申请退款失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			}
		}
	};
</script>

<style scoped>
	/* 页面容器 */
	.refund-apply {
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	

	
	/* 退款原因 */
	.refund-section {
		background-color: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		margin-top: 20rpx;
	}
	
	.section-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.reason-list {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.reason-item {
		flex: none;
		padding: 15rpx 25rpx;
		border: 1rpx solid #ddd;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: #666;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 180rpx;
		text-align: center;
	}
	
	.reason-item.active {
		border-color: #3cc51f;
		color: #3cc51f;
		background-color: #f0f9ff;
	}
	
	.reason-icon {
		margin-left: 10rpx;
		font-size: 20rpx;
		font-weight: bold;
	}
	
	/* 退款说明 */
	.refund-description {
		width: 100%;
		height: 150rpx;
		border: 1rpx solid #ddd;
		border-radius: 8rpx;
		padding: 15rpx;
		font-size: 26rpx;
		color: #333;
		background-color: #f9f9f9;
		resize: none;
		box-sizing: border-box;
	}
	
	.description-count {
		font-size: 24rpx;
		color: #999;
		text-align: right;
		margin-top: 10rpx;
	}
	
	/* 提交按钮 */
	.submit-section {
		padding: 30rpx 20rpx;
		background-color: #fff;
		margin-top: 30rpx;
	}
	
	.submit-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		background-color: #3cc51f;
		color: #fff;
		font-size: 32rpx;
		border: none;
		border-radius: 45rpx;
	}
	
	.submit-btn:disabled {
		background-color: #ccc;
	}
	
	/* 加载状态 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}
	
	.loading-content {
		background-color: #fff;
		padding: 30rpx 50rpx;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #333;
	}
	
	/* 适配不同屏幕 */
	@media (max-width: 375px) {
		.reason-item {
			min-width: 160rpx;
			font-size: 24rpx;
			padding: 12rpx 20rpx;
		}
	}
</style>