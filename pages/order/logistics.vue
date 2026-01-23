<template>
	<view class="logistics-page">
		<!-- 物流信息内容 -->
		<view class="logistics-content">
			<view class="loading-container" v-if="loading">
				<text class="loading-text">加载中...</text>
			</view>
			
			<view class="error-container" v-else-if="error">
				<text class="error-text">{{ error }}</text>
				<button class="retry-btn" @click="fetchLogisticsInfo">重试</button>
			</view>
			
			<view v-else>
				<view class="logistics-info" v-if="logisticsInfo.result && logisticsInfo.result.list">
					<!-- 物流公司信息 -->
					<view class="logistics-header">
						<text class="logistics-company">{{ logisticsInfo.result.company }} {{ logisticsInfo.result.no }}</text>
						<text class="logistics-status" :class="logisticsInfo.result.status === '1' ? 'status-signed' : 'status-transit'">
							{{ logisticsInfo.result.status === '1' ? '已签收' : '运输中' }}
						</text>
					</view>
					
					<!-- 物流跟踪记录 -->
					<view class="logistics-timeline">
						<view class="timeline-item" v-for="(item, index) in logisticsInfo.result.list" :key="index">
							<view class="timeline-dot" :class="index === 0 ? 'active' : ''"></view>
							<view class="timeline-line" v-if="index < logisticsInfo.result.list.length - 1"></view>
							<view class="timeline-content">
								<text class="timeline-remark">{{ item.remark }}</text>
								<text class="timeline-datetime">{{ item.datetime }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="no-logistics" v-else>
					<text>暂无物流信息</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { queryTracking } from '../../utils/api.js';

export default {
		data() {
			return {
				// 加载状态
				loading: true,
				// 错误信息
				error: '',
				// 物流信息
				logisticsInfo: {},
				// 订单号
				orderNo: '',
				// 订单ID
				orderId: '',
				// 物流单号
				trackingNo: ''
			};
		},
		onLoad(options) {
			// 获取订单号和物流单号
			if (options.orderId) {
				this.orderId = options.orderId;
				this.fetchLogisticsInfo();
			} else if (options.orderNo) {
				this.orderNo = options.orderNo;
				this.fetchLogisticsInfo();
			} else if (options.trackingNo) {
				// 如果只有trackingNo，也可以调用接口获取物流信息
				// 这里暂时使用trackingNo作为订单ID参数
				this.trackingNo = options.trackingNo;
				this.fetchLogisticsInfo();
			} else {
				this.error = '订单号或物流单号不能为空';
				this.loading = false;
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 获取物流信息
			async fetchLogisticsInfo() {
				this.loading = true;
				this.error = '';
				try {
					// 调用物流信息查询接口
					// 优先使用orderId，其次是orderNo或trackingNo作为orderId参数
					const logisticsData = await queryTracking(this.orderId || this.orderNo || this.trackingNo);
					this.logisticsInfo = logisticsData;
				} catch (err) {
					console.error('获取物流信息失败:', err);
					this.error = '获取物流信息失败，请稍后重试';
				} finally {
					this.loading = false;
				}
			}
		}
	};
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

	/* 页面容器 */
	.logistics-page {
		background-color: #f8f8f8;
		min-height: 100vh;
	}



	/* 物流内容 */
	.logistics-content {
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

	/* 错误状态 */
	.error-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;
		text-align: center;
	}

	.error-text {
		color: #ff4757;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}

	.retry-btn {
		width: 200rpx;
		height: 60rpx;
		line-height: 60rpx;
		background-color: #3cc51f;
		color: #fff;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: none;
	}

	/* 物流信息 */
	.logistics-info {
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	/* 物流公司信息 */
	.logistics-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
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

	/* 物流时间线 */
	.logistics-timeline {
		position: relative;
		padding-left: 20rpx;
		padding: 20rpx 30rpx;
	}

	.timeline-item {
		display: flex;
		position: relative;
		margin-bottom: 30rpx;
	}

	/* 时间线圆点 */
	.timeline-dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background-color: #e0e0e0;
		margin-right: 20rpx;
		z-index: 2;
		position: relative;
		top: 8rpx;
	}

	.timeline-dot.active {
		background-color: #3cc51f;
		border: 4rpx solid #e8f5e8;
		box-sizing: border-box;
	}

	/* 时间线连线 */
	.timeline-line {
		position: absolute;
		left: 9rpx;
		top: 28rpx;
		bottom: -30rpx;
		width: 2rpx;
		background-color: #e0e0e0;
		z-index: 1;
	}

	/* 时间线内容 */
	.timeline-content {
		flex: 1;
		padding-bottom: 30rpx;
	}

	.timeline-remark {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
		line-height: 1.4;
	}

	.timeline-datetime {
		display: block;
		font-size: 24rpx;
		color: #999;
	}

	/* 无物流信息 */
	.no-logistics {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 40rpx;
		text-align: center;
		color: #999;
		font-size: 28rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}
</style>