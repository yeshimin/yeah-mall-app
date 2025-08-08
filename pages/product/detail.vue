<template>
	<view class="product-detail-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<text class="back-btn" @click="goBack">&lt;</text>
			<text class="nav-title">商品详情</text>
			<text class="more-btn">...</text>
		</view>
		
		<!-- 商品图片轮播 -->
		<swiper class="product-swiper" indicator-dots autoplay>
			<swiper-item>
				<image class="swiper-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</swiper-item>
			<swiper-item>
				<image class="swiper-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</swiper-item>
			<swiper-item>
				<image class="swiper-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</swiper-item>
		</swiper>
		
		<!-- 商品信息 -->
		<view class="product-info">
			<text class="product-name">商品名称商品名称商品名称商品名称商品名称</text>
			<view class="product-price-section">
				<text class="current-price">￥199.00</text>
				<text class="original-price">￥299.00</text>
			</view>
			<view class="product-sales">销量: 1234</view>
		</view>
		
		<!-- 选择规格 -->
		<view class="spec-section" @click="showSpecPopup">
			<text>选择规格</text>
			<text class="arrow">&gt;</text>
		</view>
		
		<!-- 商品详情 -->
		<view class="detail-section">
			<text class="section-title">商品详情</text>
			<view class="detail-content">
				<image class="detail-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
				<image class="detail-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
				<image class="detail-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="bar-item" @click="addToCart">
				<text class="icon">🛒</text>
				<text>购物车</text>
			</view>
			<view class="bar-item" @click="buyNow">
				<text class="buy-now">立即购买</text>
			</view>
			<view class="bar-item" @click="addToFavorites">
				<text class="icon">❤️</text>
				<text>收藏</text>
			</view>
		</view>
		
		<!-- 规格选择弹窗 -->
		<view class="spec-popup" v-if="showSpec" @click="closeSpecPopup">
			<view class="popup-content" @click.stop>
				<text class="close-btn" @click="closeSpecPopup">×</text>
				<view class="popup-header">
					<image class="popup-image" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
					<view class="popup-info">
						<text class="popup-price">￥199.00</text>
						<text class="popup-spec">已选: 规格1</text>
					</view>
				</view>
				<view class="spec-options">
					<text class="spec-title">规格</text>
					<view class="spec-list">
						<view class="spec-item active">规格1</view>
						<view class="spec-item">规格2</view>
						<view class="spec-item">规格3</view>
					</view>
				</view>
				<view class="quantity-selector">
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="control-btn" @click="decreaseQuantity">-</text>
						<text class="quantity">1</text>
						<text class="control-btn" @click="increaseQuantity">+</text>
					</view>
				</view>
				<view class="confirm-btn" @click="confirmSpec">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showSpec: false
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			showSpecPopup() {
				this.showSpec = true;
			},
			closeSpecPopup() {
				this.showSpec = false;
			},
			addToCart() {
				// 添加到购物车逻辑
				uni.showToast({
					title: '已添加到购物车',
					icon: 'success'
				});
			},
			buyNow() {
				// 立即购买逻辑
				uni.showToast({
					title: '立即购买',
					icon: 'none'
				});
			},
			addToFavorites() {
				// 添加到收藏逻辑
				uni.showToast({
					title: '已收藏',
					icon: 'success'
				});
			},
			decreaseQuantity() {
				// 减少数量逻辑
				console.log('减少数量');
			},
			increaseQuantity() {
				// 增加数量逻辑
				console.log('增加数量');
			},
			confirmSpec() {
				// 确认规格选择
				this.closeSpecPopup();
				uni.showToast({
					title: '已选择规格',
					icon: 'success'
				});
			}
		}
	}
</script>

<style scoped>
	.product-detail-container {
		height: 100vh;
		padding-top: var(--status-bar-height);
	}
	
	.top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100rpx;
		padding: 0 20rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
	}
	
	.back-btn, .more-btn {
		font-size: 32rpx;
	}
	
	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.product-swiper {
		height: 500rpx;
		margin-top: 100rpx;
	}
	
	.swiper-image {
		width: 100%;
		height: 100%;
	}
	
	.product-info {
		padding: 20rpx;
		background-color: #fff;
		border-bottom: 10rpx solid #f5f5f5;
	}
	
	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.product-price-section {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}
	
	.current-price {
		font-size: 36rpx;
		color: #ff0000;
		margin-right: 20rpx;
	}
	
	.original-price {
		font-size: 24rpx;
		color: #888;
		text-decoration: line-through;
	}
	
	.product-sales {
		font-size: 24rpx;
		color: #888;
	}
	
	.spec-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background-color: #fff;
		border-bottom: 10rpx solid #f5f5f5;
	}
	
	.arrow {
		font-size: 28rpx;
		color: #888;
	}
	
	.detail-section {
		padding: 20rpx;
		background-color: #fff;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.detail-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.detail-image {
		width: 100%;
		height: 400rpx;
		margin-bottom: 20rpx;
	}
	
	.bottom-bar {
		display: flex;
		height: 100rpx;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #fff;
		border-top: 1rpx solid #eee;
	}
	
	.bar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.icon {
		font-size: 40rpx;
		margin-bottom: 5rpx;
	}
	
	.buy-now {
		background-color: #ff0000;
		color: #fff;
		padding: 15rpx 40rpx;
		border-radius: 50rpx;
	}
	
	.spec-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 200;
		display: flex;
		justify-content: center;
		align-items: flex-end;
	}
	
	.popup-content {
		width: 100%;
		background-color: #fff;
		padding: 20rpx;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		position: relative;
	}
	
	.close-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		font-size: 40rpx;
	}
	
	.popup-header {
		display: flex;
		margin-bottom: 30rpx;
	}
	
	.popup-image {
		width: 150rpx;
		height: 150rpx;
		margin-right: 20rpx;
	}
	
	.popup-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	
	.popup-price {
		font-size: 36rpx;
		color: #ff0000;
		margin-bottom: 10rpx;
	}
	
	.popup-spec {
		font-size: 24rpx;
		color: #888;
	}
	
	.spec-options {
		margin-bottom: 30rpx;
	}
	
	.spec-title {
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.spec-list {
		display: flex;
		flex-wrap: wrap;
	}
	
	.spec-item {
		padding: 10rpx 20rpx;
		border: 1rpx solid #eee;
		border-radius: 10rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.spec-item.active {
		border-color: #ff0000;
		color: #ff0000;
	}
	
	.quantity-selector {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.quantity-title {
		font-size: 28rpx;
		font-weight: bold;
	}
	
	.quantity-controls {
		display: flex;
		align-items: center;
	}
	
	.control-btn {
		padding: 10rpx 20rpx;
		border: 1rpx solid #eee;
	}
	
	.quantity {
		padding: 10rpx 30rpx;
		border-top: 1rpx solid #eee;
		border-bottom: 1rpx solid #eee;
	}
	
	.confirm-btn {
		background-color: #ff0000;
		color: #fff;
		padding: 20rpx;
		text-align: center;
		border-radius: 10rpx;
	}
</style>