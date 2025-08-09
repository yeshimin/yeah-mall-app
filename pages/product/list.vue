<template>
	<view class="product-list-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<text class="back-btn" @click="goBack">&lt;</text>
			<text class="nav-title">{{ categoryName }}</text>
			<text class="filter-btn" @click="showFilter">筛选</text>
		</view>
		
		<!-- 搜索框 -->
		<view class="search-box">
			<input class="search-input" placeholder="搜索商品" v-model="searchKeyword" />
			<button class="search-btn" @click="searchProducts">搜索</button>
		</view>
		
		<!-- 排序选项 -->
		<view class="sort-options">
			<view class="sort-item" :class="{ active: currentSort === 'default' }" @click="sortProducts('default')">默认</view>
			<view class="sort-item" :class="{ active: currentSort === 'sales' }" @click="sortProducts('sales')">销量</view>
			<view class="sort-item" :class="{ active: currentSort === 'price' }" @click="sortProducts('price')">价格</view>
			<view class="sort-item" :class="{ active: currentSort === 'new' }" @click="sortProducts('new')">新品</view>
			<view class="view-toggle" @click="toggleView">
				<text v-if="isGridView">单列</text>
				<text v-else>双列</text>
			</view>
		</view>
		
		<!-- 商品列表 -->
		<scroll-view class="product-list" scroll-y>
			<view class="product-grid" :class="{ 'list-view': !isGridView }">
				<view class="product-item" v-for="(item, index) in products" :key="index" @click="goToProductDetail(item)">
					<image class="product-image" :src="item.image"></image>
					<view class="product-info">
						<text class="product-name">{{ item.name }}</text>
						<text class="product-price">￥{{ item.price }}</text>
						<text class="product-sales">销量: {{ item.sales }}</text>
					</view>
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
				isGridView: true, // true为双列，false为单列
				searchKeyword: '', // 搜索关键词
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
			},
			// 切换视图（单列/双列）
			toggleView() {
				this.isGridView = !this.isGridView;
			},
			// 搜索商品
			searchProducts() {
				console.log('搜索关键词：' + this.searchKeyword);
				// 实际项目中这里会调用后端API进行搜索
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
			// 获取搜索关键词并填充到搜索框
			if (options.searchKeyword) {
				this.searchKeyword = options.searchKeyword;
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
		.search-box {
			display: flex;
			height: 80rpx;
			align-items: center;
			padding: 0 20rpx;
			background-color: #fff;
			border-bottom: 1rpx solid #eee;
			margin-top: 20rpx; /* 减少顶部边距 */
		}
		
		.search-input {
			flex: 1;
			height: 60rpx;
			border: 1rpx solid #ddd;
			border-radius: 30rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
		}
		
		.search-btn {
			width: 120rpx;
			height: 60rpx;
			margin-left: 20rpx;
			background-color: #ff0000;
			color: #fff;
			border-radius: 30rpx;
			font-size: 28rpx;
		}
		
		.sort-options {
			display: flex;
			height: 80rpx;
			align-items: center;
			justify-content: space-around;
			background-color: #fff;
			border-bottom: 1rpx solid #eee;
			margin-top: 0;
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
		
		.view-toggle {
			font-size: 28rpx;
			padding: 10rpx 20rpx;
			border-radius: 30rpx;
			background-color: #f5f5f5;
		}
		
		.product-list {
			height: calc(100vh - 180rpx); /* 调整高度计算 */
			margin-top: 20rpx; /* 减少顶部边距 */
		}
		
		.product-grid {
			display: flex;
			flex-wrap: wrap;
			padding: 10rpx; /* 减少内边距 */
		}
		
		/* 单列视图样式 */
		.product-grid.list-view {
			display: block;
		}
		
		.product-grid.list-view .product-item {
			width: 100%;
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-bottom: 10rpx; /* 减少底部边距 */
			padding: 10rpx; /* 减少内边距 */
			border-bottom: 1rpx solid #eee;
		}
		
		.product-grid.list-view .product-image {
			width: 160rpx;
			height: 160rpx;
			margin-bottom: 0;
			margin-right: 20rpx;
		}
		
		.product-grid.list-view .product-info {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		
		.product-item {
			width: 50%;
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-bottom: 20rpx; /* 减少底部边距 */
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