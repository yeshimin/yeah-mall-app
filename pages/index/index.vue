<template>
	<view class="content">
		<!-- banner -->
		<swiper class="banner-swiper" indicator-dots autoplay interval="3000" duration="1000">
			<swiper-item>
				<image class="banner-img" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</swiper-item>
			<swiper-item>
				<image class="banner-img" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</swiper-item>
			<swiper-item>
				<image class="banner-img" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
			</swiper-item>
		</swiper>
		
		<!-- 促销活动 -->
		<view class="promotion-banner">
			<image class="promotion-img" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></image>
		</view>
		
		<!-- 热门分类 -->
		<view class="category-grid">
			<view class="category-item" v-for="(item, index) in categories" :key="index">
				<image class="category-icon" :src="item.icon"></image>
				<text class="category-text">{{ item.name }}</text>
			</view>
		</view>
		
		<!-- 热门商品 -->
		<view class="hot-products">
			<view class="section-title">热门商品</view>
			<view class="hot-products-grid">
				<view class="hot-product-item" v-for="(item, index) in hotProducts" :key="index">
					<image class="hot-product-img" :src="item.image"></image>
					<text class="hot-product-title">{{ item.title }}</text>
					<text class="hot-product-price">￥{{ item.price }}</text>
				</view>
			</view>
		</view>
		
		<!-- 品牌推荐 -->
		<view class="brands-section">
			<view class="section-title">品牌推荐</view>
			<view class="brands-grid">
				<view class="brand-item" v-for="(item, index) in brands" :key="index">
					<image class="brand-logo" :src="item.logo"></image>
					<text class="brand-name">{{ item.name }}</text>
				</view>
			</view>
		</view>
		
		<!-- 限时抢购 -->
		<view class="flash-sale">
			<view class="section-title">限时抢购</view>
			<view class="flash-sale-grid">
				<view class="flash-sale-item" v-for="(item, index) in flashSaleItems" :key="index">
					<image class="flash-sale-img" :src="item.image"></image>
					<text class="flash-sale-title">{{ item.title }}</text>
					<text class="flash-sale-price">￥{{ item.price }}</text>
					<text class="flash-sale-original-price">￥{{ item.originalPrice }}</text>
				</view>
			</view>
		</view>
		
		<!-- 推荐商品 -->
		<view class="recommend-grid">
			<view class="recommend-item" v-for="(item, index) in recommendProducts" :key="index">
				<image class="recommend-img" :src="item.image"></image>
				<text class="recommend-title">{{ item.title }}</text>
				<text class="recommend-price">￥{{ item.price }}</text>
			</view>
		</view>
		
		<!-- 底部导航栏 -->
		<view class="bottom-nav">
			<view class="nav-item" v-for="(item, index) in navItems" :key="index" @click="navigateTo(item.page)">
				<image class="nav-icon" :src="item.icon"></image>
				<text class="nav-text">{{ item.text }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				isSidebarOpen: false,
				searchQuery: '',
				sidebarItems: [
					{ text: '首页', page: '/pages/index/index' },
					{ text: '分类', page: '/pages/category/category' },
					{ text: '购物车', page: '/pages/cart/cart' },
					{ text: '我的', page: '/pages/profile/profile' },
					{ text: '设置', page: '/pages/settings/settings' },
					{ text: '帮助', page: '/pages/help/help' }
				],
				categories: [
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类1' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类2' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类3' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类4' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类5' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类6' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类7' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类8' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类9' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '分类10' }
				],
				recommendProducts: [
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '推荐商品1', price: '99.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '推荐商品2', price: '199.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '推荐商品3', price: '299.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '推荐商品4', price: '399.00' }
				],
				hotProducts: [
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '热门商品1', price: '129.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '热门商品2', price: '229.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '热门商品3', price: '329.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '热门商品4', price: '429.00' }
				],
				brands: [
					{ logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '品牌1' },
					{ logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '品牌2' },
					{ logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '品牌3' },
					{ logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: '品牌4' }
				],
				flashSaleItems: [
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '限时抢购1', price: '59.00', originalPrice: '99.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '限时抢购2', price: '89.00', originalPrice: '149.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '限时抢购3', price: '119.00', originalPrice: '199.00' },
					{ image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: '限时抢购4', price: '159.00', originalPrice: '259.00' }
				],
				navItems: [
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', text: '首页', page: '/pages/index/index' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', text: '分类', page: '/pages/category/category' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', text: '购物车', page: '/pages/cart/cart' },
					{ icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', text: '我的', page: '/pages/profile/profile' }
				]
			}
		},
		onLoad() {

		},
		methods: {
			toggleSidebar() {
				this.isSidebarOpen = !this.isSidebarOpen;
			},
			navigateTo(page) {
				uni.navigateTo({
					url: page
				})
			},
			handleSearch() {
				if (this.searchQuery.trim() !== '') {
					uni.navigateTo({
						url: `/pages/search/search?query=${this.searchQuery}`
					})
				}
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
	.sidebar {
		position: fixed;
		top: 0;
		left: -80%;
		width: 80%;
		height: 100%;
		background-color: #fff;
		z-index: 1000;
		transition: left 0.3s ease;
	}
	.sidebar-open {
		left: 0;
	}
	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 20rpx;
		border-bottom: 1rpx solid #eee;
	}
	.sidebar-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	.close-btn {
		font-size: 40rpx;
	}
	.sidebar-menu {
		display: flex;
		flex-direction: column;
	}
	.sidebar-item {
		height: 80rpx;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		border-bottom: 1rpx solid #eee;
	}
	.sidebar-text {
		font-size: 28rpx;
	}
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}
	.top-nav {
		display: flex;
		align-items: center;
		height: 100rpx;
		width: 100%;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
	}
	.menu-btn {
		font-size: 40rpx;
		margin: 0 20rpx;
	}
	.search-container {
		display: flex;
		align-items: center;
		flex: 1;
		margin: 0 20rpx;
		height: 60rpx;
		background-color: #f5f5f5;
		border-radius: 30rpx;
		padding: 0 20rpx;
	}
	.search-input {
		flex: 1;
		border: none;
		background-color: transparent;
		font-size: 28rpx;
	}
	.search-btn {
		font-size: 30rpx;
		margin-left: 10rpx;
	}
	.banner-swiper {
		width: 100%;
		height: 400rpx;
		margin-top: 100rpx;
	}
	.banner-img {
		width: 100%;
		height: 400rpx;
	}
	.promotion-banner {
		width: 100%;
		padding: 20rpx;
	}
	.promotion-img {
		width: 100%;
		height: 200rpx;
		border-radius: 10rpx;
	}
	.category-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		width: 100%;
		padding: 20rpx;
	}
	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 20%;
		margin-bottom: 20rpx;
	}
	.category-icon {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 10rpx;
	}
	.category-text {
		font-size: 24rpx;
	}
	.section-title {
		width: 100%;
		font-size: 32rpx;
		font-weight: bold;
		margin: 20rpx 0;
		padding-left: 20rpx;
	}
	.hot-products-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		width: 100%;
		padding: 0 20rpx;
	}
	.hot-product-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 50%;
		margin-bottom: 20rpx;
	}
	.hot-product-img {
		width: 150rpx;
		height: 150rpx;
		margin-bottom: 10rpx;
	}
	.hot-product-title {
		font-size: 24rpx;
		margin-bottom: 5rpx;
	}
	.hot-product-price {
		font-size: 20rpx;
		color: #ff0000;
	}
	.brands-section {
		width: 100%;
	}
	.brands-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		width: 100%;
		padding: 0 20rpx;
	}
	.brand-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 25%;
		margin-bottom: 20rpx;
	}
	.brand-logo {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}
	.brand-name {
		font-size: 20rpx;
	}
	.flash-sale {
		width: 100%;
	}
	.flash-sale-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		width: 100%;
		padding: 0 20rpx;
	}
	.flash-sale-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 50%;
		margin-bottom: 20rpx;
	}
	.flash-sale-img {
		width: 150rpx;
		height: 150rpx;
		margin-bottom: 10rpx;
	}
	.flash-sale-title {
		font-size: 24rpx;
		margin-bottom: 5rpx;
	}
	.flash-sale-price {
		font-size: 20rpx;
		color: #ff0000;
	}
	.flash-sale-original-price {
		font-size: 18rpx;
		color: #888;
		text-decoration: line-through;
	}
	.recommend-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		width: 100%;
		padding: 20rpx;
	}
	.recommend-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 50%;
		margin-bottom: 20rpx;
	}
	.recommend-img {
		width: 100rpx;
		height: 100rpx;
		margin-bottom: 10rpx;
	}
	.recommend-title {
		font-size: 24rpx;
		margin-bottom: 5rpx;
	}
	.recommend-price {
		font-size: 20rpx;
		color: #ff0000;
	}
	.bottom-nav {
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 100%;
		height: 100rpx;
		background-color: #fff;
		border-top: 1rpx solid #eee;
		position: fixed;
		bottom: 0;
		left: 0;
	}
	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.nav-icon {
		width: 40rpx;
		height: 40rpx;
		margin-bottom: 10rpx;
	}
	.nav-text {
		font-size: 20rpx;
	}
</style>
