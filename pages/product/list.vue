<template>
	<view class="product-list-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<text class="back-btn" @click="goBack">&lt;</text>
			<text class="nav-title">{{ categoryName }}</text>
			<text class="filter-btn" @click="showFilter">筛选</text>
		</view>
		
		<!-- 排序选项 -->
		<view class="sort-options">
			<view class="sort-item" :class="{ active: currentSort === 'default' }" @click="sortProducts('default')">默认</view>
			<view class="sort-item" :class="{ active: currentSort === 'sales' }" @click="sortProducts('sales')">销量</view>
			<view class="sort-item" :class="{ active: currentSort === 'price' }" @click="sortProducts('price')">价格</view>
			<view class="sort-item" :class="{ active: currentSort === 'new' }" @click="sortProducts('new')">新品</view>
		</view>
		
		<!-- 商品列表 -->
		<scroll-view class="product-list" scroll-y>
			<view class="product-grid">
				<view class="product-item" v-for="(item, index) in products" :key="index" @click="goToProductDetail(item)">
					<image class="product-image" :src="item.image"></image>
					<text class="product-name">{{ item.name }}</text>
					<text class="product-price">￥{{ item.price }}</text>
					<text class="product-sales">销量: {{ item.sales }}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				categoryName: '',
				categoryId: 0,
				currentSort: 'default',
				products: [
					// 示例商品数据
					{ id: 1, name: '商品1', price: 99.00, sales: 123, image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
					{ id: 2, name: '商品2', price: 199.00, sales: 456, image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
					{ id: 3, name: '商品3', price: 299.00, sales: 789, image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
					{ id: 4, name: '商品4', price: 399.00, sales: 101, image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
					{ id: 5, name: '商品5', price: 499.00, sales: 202, image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
					{ id: 6, name: '商品6', price: 599.00, sales: 303, image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
				]
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			showFilter() {
				// 显示筛选弹窗
				console.log('显示筛选弹窗');
			},
			sortProducts(sortType) {
				this.currentSort = sortType;
				// 根据排序类型对商品进行排序
				console.log('按' + sortType + '排序');
			},
			goToProductDetail(item) {
				// 跳转到商品详情页面
				uni.navigateTo({
					url: `/pages/product/detail?id=${item.id}`
				});
			}
		},
		onLoad(options) {
			// 获取分类ID和名称
			if (options.categoryId) {
				this.categoryId = options.categoryId;
			}
			if (options.categoryName) {
				this.categoryName = options.categoryName;
			}
		}
	}
</script>

<style scoped>
	.product-list-container {
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
	
	.back-btn, .filter-btn {
		font-size: 32rpx;
	}
	
	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.sort-options {
		display: flex;
		height: 80rpx;
		align-items: center;
		justify-content: space-around;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		margin-top: 100rpx;
	}
	
	.sort-item {
		font-size: 28rpx;
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
	}
	
	.sort-item.active {
		background-color: #ff0000;
		color: #fff;
	}
	
	.product-list {
		height: calc(100vh - 180rpx);
		margin-top: 180rpx;
	}
	
	.product-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
	}
	
	.product-item {
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.product-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 10rpx;
	}
	
	.product-name {
		font-size: 24rpx;
		margin-bottom: 10rpx;
	}
	
	.product-price {
		font-size: 28rpx;
		color: #ff0000;
		margin-bottom: 5rpx;
	}
	
	.product-sales {
		font-size: 20rpx;
		color: #888;
	}
</style>