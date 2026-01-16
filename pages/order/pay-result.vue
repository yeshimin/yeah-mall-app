<template>
	<view class="pay-result">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<text class="back-btn" @click="goBack">&lt;</text>
			<text class="nav-title">支付结果</text>
		</view>
		
		<!-- 支付结果容器 -->
		<view class="result-container">
			<!-- 支付成功状态 -->
			<view class="result-success" v-if="payResultInfo && payResultInfo.paySuccess">
				<text class="iconfont success-icon">&#xe61e;</text>
				<text class="result-text">支付成功</text>
				<text class="result-subtext">感谢您的购买，订单已支付成功</text>
			</view>
			
			<!-- 用户取消支付状态 -->
			<view class="result-cancel" v-else-if="payResultInfo && !payResultInfo.paySuccess && payResultType === 'cancel'">
				<text class="iconfont cancel-icon">&#xe65c;</text>
				<text class="result-text">支付已取消</text>
				<text class="result-subtext">您已取消支付，可以稍后重新支付</text>
			</view>
			
			<!-- 支付失败状态 -->
			<view class="result-failed" v-else-if="payResultInfo && !payResultInfo.paySuccess && payResultType !== 'cancel'">
				<text class="iconfont failed-icon">&#xe61c;</text>
				<text class="result-text">支付失败</text>
				<text class="result-subtext">支付过程中遇到问题，请重新尝试</text>
			</view>
			
			<!-- 支付处理中状态 -->
			<view class="result-processing" v-else-if="payResultInfo && !payResultInfo.paySuccess && !payResultType">
				<text class="iconfont processing-icon">&#xe62a;</text>
				<text class="result-text">支付处理中</text>
				<text class="result-subtext">正在处理您的支付请求，请稍候...</text>
				<view class="processing-dots">
					<text class="dot"></text>
					<text class="dot"></text>
					<text class="dot"></text>
				</view>
			</view>
			
			<!-- 加载状态 -->
			<view class="loading-container" v-else>
				<text class="loading-text">加载中...</text>
			</view>
		</view>
		
		<!-- 订单信息 -->
		<view class="order-info" v-if="payResultInfo">
			<view class="info-item">
				<text class="info-label">订单号：</text>
				<text class="info-value">{{ payResultInfo.orderNo }}</text>
			</view>
			<view class="info-item" v-if="payResultInfo.paySuccessTime">
				<text class="info-label">支付时间：</text>
				<text class="info-value">{{ formatTime(payResultInfo.paySuccessTime) }}</text>
			</view>
		</view>
		
		<!-- 底部操作按钮 -->
		<view class="bottom-buttons">
			<button class="btn primary" @click="viewOrder">查看订单</button>
			<button class="btn secondary" @click="goHome">返回首页</button>
		</view>
	</view>
</template>

<script>
	import { queryPayOrderInfo, queryPayResult } from '../../utils/api.js';
	
export default {
		data() {
			return {
				orderNo: '',
				orderInfo: null,
				loading: true,
				pollingTimer: null,
				pollingCount: 0, // 轮询计数器
				maxPollingCount: 30, // 最大轮询次数（60秒/2秒 = 30次）
				payResultType: null, // 支付结果类型：success, cancel, fail
				payResultInfo: null // 支付结果信息
			}
		},
		onLoad(options) {
			// 获取订单号和支付结果类型
			this.orderNo = options.orderNo;
			this.payResultType = options.payResultType || null; // success, cancel, fail
			
			if (this.orderNo) {
				// 根据支付结果类型进行相应处理
				this.handlePayResult();
			} else {
				uni.showToast({
					title: '参数错误',
					icon: 'none'
				});
			}
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.pollingTimer) {
				clearTimeout(this.pollingTimer);
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			
			// 处理支付结果
			handlePayResult() {
				if (this.payResultType === 'success') {
					// 支付成功，直接显示成功状态
					this.fetchPayResult();
				} else if (this.payResultType === 'cancel') {
					// 用户取消支付，显示取消状态
					this.payResultInfo = {
						orderNo: this.orderNo,
						paySuccess: false,
						paySuccessTime: null
					};
					this.loading = false;
				} else {
					// 支付失败，开始轮询查询
					this.startPolling();
				}
			},
			
			// 获取支付结果
			fetchPayResult() {
				queryPayResult(this.orderNo)
					.then(data => {
						console.log('支付结果:', data);
						this.payResultInfo = data;
						this.loading = false;
						
						// 如果支付失败，开始轮询
						if (!data.paySuccess && this.payResultType !== 'success') {
							this.startPolling();
						}
					})
					.catch(error => {
						console.error('获取支付结果失败:', error);
						uni.showToast({
							title: '获取支付结果失败',
							icon: 'none'
						});
						this.loading = false;
					});
			},
			
			// 开始轮询查询支付结果
			startPolling() {
				if (this.pollingCount >= this.maxPollingCount) {
					// 轮询次数已达上限，停止轮询
					this.loading = false;
					return;
				}
				
				queryPayResult(this.orderNo)
					.then(data => {
						console.log('轮询支付结果:', data);
						this.payResultInfo = data;
						
						// 如果支付成功，停止轮询
						if (data.paySuccess) {
							this.loading = false;
							return;
						}
						
						// 继续轮询
						this.pollingCount++;
						this.pollingTimer = setTimeout(() => {
							this.startPolling();
						}, 2000); // 每2秒轮询一次
					})
					.catch(error => {
						console.error('查询支付结果失败:', error);
						// 继续轮询，直到达到最大次数
						this.pollingCount++;
						if (this.pollingCount < this.maxPollingCount) {
							this.pollingTimer = setTimeout(() => {
								this.startPolling();
							}, 2000);
						} else {
							this.loading = false;
						}
					});
			},
			
			// 格式化时间
			formatTime(timeStr) {
				if (!timeStr) return '';
				// 将时间字符串转换为Date对象
				const date = new Date(timeStr);
				// 格式化为 yyyy-MM-dd HH:mm:ss 格式
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			},
			
			// 查看订单
			viewOrder() {
				// 跳转到订单详情页面（如果有的话）
				// 这里暂时跳转到订单列表页面
				uni.navigateTo({
					url: '/pages/order/list'
				});
			},
			
			// 返回首页
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	}
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

	.pay-result {
		padding-bottom: 160rpx;
		background-color: #f7f8fa;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80rpx;
		padding: 0 20rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #f5f5f5;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-btn {
		font-size: 32rpx;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.result-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 20rpx;
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.result-success,
	.result-failed,
	.result-processing {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.success-icon {
		font-size: 160rpx;
		color: #52c41a;
		margin-bottom: 30rpx;
	}

	.failed-icon {
		font-size: 160rpx;
		color: #ff4d4f;
		margin-bottom: 30rpx;
	}

	.cancel-icon {
		font-size: 160rpx;
		color: #faad14; /* 橙色表示中性状态 */
		margin-bottom: 30rpx;
	}

	.processing-icon {
		font-size: 160rpx;
		color: #faad14;
		margin-bottom: 30rpx;
	}

	.result-text {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.result-subtext {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.processing-dots {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.processing-dots .dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		background-color: #faad14;
		margin: 0 8rpx;
		animation: dotPulse 1.4s infinite;
	}

	.processing-dots .dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.processing-dots .dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes dotPulse {
		0%, 60%, 100% {
			transform: scale(0.6);
			opacity: 0.6;
		}
		30% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}

	.loading-text {
		color: #999;
		font-size: 28rpx;
	}

	.order-info {
		padding: 20rpx;
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 28rpx;
		color: #666;
	}

	.info-value {
		font-size: 28rpx;
		color: #333;
	}

	.info-value.amount {
		color: #ff4757;
		font-weight: bold;
		font-size: 32rpx;
	}

	.bottom-buttons {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 140rpx;
		padding: 20rpx;
		box-sizing: border-box;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-top: 1rpx solid #f5f5f5;
	}

	.btn {
		width: 340rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
	}

	.btn.primary {
		background: linear-gradient(to right, #ff6b6b, #ff4757);
		color: #fff;
		box-shadow: 0 4rpx 10rpx rgba(255, 71, 87, 0.3);
	}

	.btn.primary:active {
		transform: scale(0.98);
		background: linear-gradient(to right, #ff5a5a, #ff3747);
	}

	.btn.secondary {
		background-color: #fff;
		color: #666;
		border: 2rpx solid #e0e0e0;
	}

	.btn.secondary:active {
		background-color: #f5f5f5;
	}
</style>