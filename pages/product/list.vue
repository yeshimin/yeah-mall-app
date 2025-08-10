<template>
	<view class="product-list-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<text class="back-btn" @click="goBack">&lt;</text>
			<text class="nav-title">{{ categoryName }}</text>
		</view>
		
		<!-- 搜索框 -->
		<view class="search-box">
			<input class="search-input" placeholder="搜索商品" v-model="searchKeyword" />
			<button class="search-btn" @click="searchProducts">搜索</button>
		</view>
		
		<!-- 排序选项 -->
		<view class="sort-options">
			<view class="sort-item" :class="{ active: currentSort === 'default' }" @click="sortProducts('default')">综合</view>
			<view class="sort-item" :class="{ active: currentSort === 'sales' }" @click="sortProducts('sales')">销量</view>
			<view class="sort-item" :class="{ active: currentSort === 'price' }" @click="sortProducts('price')">价格</view>
			<!-- View toggle: ⬜ for grid view, ▤ for list view -->
			<view class="view-toggle" @click="toggleView">
				<text v-if="isGridView">⬜</text>
				<text v-else>▤</text>
			</view>
			<view class="filter-btn" @click="showFilter">
				🔍筛选
			</view>
		</view>
		
		<!-- 筛选弹窗 -->
		<view class="filter-popup" :class="{ show: showFilterPopup }" v-if="showFilterPopup">
			<view class="filter-overlay" @click="closeFilter"></view>
			<view class="filter-content">
				<view class="filter-header">
					<text class="filter-title">筛选</text>
					<text class="filter-close" @click="closeFilter">×</text>
				</view>
				<view class="filter-body">
					<view class="filter-section">
						<text class="filter-section-title">价格区间</text>
						<view class="price-range">
							<input class="price-input" placeholder="最低价" v-model="filterOptions.minPrice" />
							<text class="price-divider">-</text>
							<input class="price-input" placeholder="最高价" v-model="filterOptions.maxPrice" />
						</view>
					</view>
					
					<view class="filter-section">
						<text class="filter-section-title">品牌</text>
						<view class="brand-list">
							<view class="brand-item" v-for="(brand, index) in brands" :key="index" 
								:class="{ active: filterOptions.selectedBrands.includes(brand) }"
								@click="toggleBrand(brand)">
								{{ brand }}
							</view>
						</view>
					</view>
					
					<view class="filter-section">
						<text class="filter-section-title">发货</text>
						<view class="shipping-options">
							<view class="shipping-item" 
								:class="{ active: filterOptions.shippingOption === 'all' }"
								@click="selectShipping('all')">
								全部
							</view>
							<view class="shipping-item" 
								:class="{ active: filterOptions.shippingOption === 'free' }"
								@click="selectShipping('free')">
								包邮
							</view>
							<view class="shipping-item" 
								:class="{ active: filterOptions.shippingOption === 'fast' }"
								@click="selectShipping('fast')">
								24小时内发货
							</view>
						</view>
					</view>
				</view>
				<view class="filter-footer">
					<button class="filter-reset" @click="resetFilter">重置</button>
					<button class="filter-confirm" @click="applyFilter">确定</button>
				</view>
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
				showFilterPopup: false, // 是否显示筛选弹窗
				filterOptions: {
					minPrice: '',
					maxPrice: '',
					selectedBrands: [],
					shippingOption: 'all' // all, free, fast
				},
				brands: ['品牌A', '品牌B', '品牌C', '品牌D'],
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
				this.showFilterPopup = true;
			},
			closeFilter() {
				// 关闭筛选弹窗
				this.showFilterPopup = false;
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
			},
			// 筛选相关方法
			toggleBrand(brand) {
				const index = this.filterOptions.selectedBrands.indexOf(brand);
				if (index > -1) {
					// 如果已选中，则移除
					this.filterOptions.selectedBrands.splice(index, 1);
				} else {
					// 如果未选中，则添加
					this.filterOptions.selectedBrands.push(brand);
				}
			},
			selectShipping(option) {
				this.filterOptions.shippingOption = option;
			},
			resetFilter() {
				// 重置筛选条件
				this.filterOptions.minPrice = '';
				this.filterOptions.maxPrice = '';
				this.filterOptions.selectedBrands = [];
				this.filterOptions.shippingOption = 'all';
			},
			applyFilter() {
				// 应用筛选条件
				console.log('应用筛选条件:', this.filterOptions);
				// 实际项目中这里会调用后端API进行筛选
				this.closeFilter();
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
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
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
			padding: 0 30rpx;
			font-size: 28rpx;
			background-color: #f5f5f5;
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
			justify-content: space-between;
			padding: 0 20rpx;
			background-color: #fff;
			border-bottom: 1rpx solid #eee;
			margin-top: 0;
		}
		
		.sort-item {
			font-size: 28rpx;
			padding: 10rpx 20rpx;
			border-radius: 30rpx;
			margin-right: 20rpx;
			background-color: #f5f5f5;
			transition: all 0.3s ease;
		}
		
		.sort-item.active {
			background-color: #ff0000;
			color: #fff;
		}
		
		.sort-item:hover {
			background-color: #e0e0e0;
		}
		
		.sort-item.active:hover {
			background-color: #e60000;
		}
		
		.view-toggle, .filter-btn {
			font-size: 28rpx;
			padding: 10rpx 20rpx;
			border-radius: 30rpx;
			background-color: #f5f5f5;
			min-width: 80rpx;
			text-align: center;
			transition: all 0.3s ease;
		}
		
		.view-toggle:hover, .filter-btn:hover {
			background-color: #e0e0e0;
		}
		
		.product-list {
			height: calc(100vh - 180rpx); /* 调整高度计算 */
			margin-top: 100rpx; /* 为顶部导航和排序选项留出空间 */
		}
		
		/* 筛选弹窗样式 */
		.filter-popup {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1000;
			transition: opacity 0.3s ease;
		}
		
		.filter-overlay {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			transition: opacity 0.3s ease;
			opacity: 0;
		}
		
		.filter-popup.show .filter-overlay {
			opacity: 1;
		}
		
		.filter-content {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			background-color: #fff;
			border-top-left-radius: 20rpx;
			border-top-right-radius: 20rpx;
			padding: 0 30rpx 30rpx 30rpx;
			max-height: 80%;
			overflow-y: auto;
			transition: transform 0.3s ease;
			transform: translateY(100%);
		}
		
		.filter-popup.show .filter-content {
			transform: translateY(0);
		}
		
		.filter-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			border-bottom: 1rpx solid #eee;
			padding-bottom: 20rpx;
			background-color: #f8f8f8;
			margin: -30rpx -30rpx 30rpx -30rpx;
			padding: 20rpx 30rpx;
		}
		
		.filter-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.filter-close {
			font-size: 40rpx;
			color: #999;
			transition: color 0.3s ease;
		}
		
		.filter-close:hover {
			color: #333;
		}
		
		.filter-section {
			margin-bottom: 30rpx;
		}
		
		.filter-section-title {
			font-size: 28rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
			display: block;
			color: #333;
			border-left: 8rpx solid #ff0000;
			padding-left: 10rpx;
		}
		
		.price-range {
			display: flex;
			align-items: center;
		}
		
		.price-input {
			flex: 1;
			height: 60rpx;
			border: 1rpx solid #ddd;
			border-radius: 10rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			background-color: #f5f5f5;
			transition: all 0.3s ease;
		}
		
		.price-input:focus {
			background-color: #fff;
			border-color: #ff0000;
		}
		
		.price-divider {
			margin: 0 20rpx;
		}
		
		.brand-list {
			display: flex;
			flex-wrap: wrap;
		}
		
		.brand-item {
			padding: 10rpx 20rpx;
			border: 1rpx solid #ddd;
			border-radius: 30rpx;
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			font-size: 24rpx;
			background-color: #f5f5f5;
			transition: all 0.3s ease;
		}
		
		.brand-item.active {
			background-color: #ff0000;
			color: #fff;
			border-color: #ff0000;
		}
		
		.brand-item:hover {
			background-color: #e0e0e0;
			border-color: #ccc;
		}
		
		.brand-item.active:hover {
			background-color: #e60000;
			border-color: #e60000;
		}
		
		.shipping-options {
			display: flex;
		}
		
		.shipping-item {
			padding: 10rpx 20rpx;
			border: 1rpx solid #ddd;
			border-radius: 30rpx;
			margin-right: 20rpx;
			font-size: 24rpx;
			background-color: #f5f5f5;
			transition: all 0.3s ease;
		}
		
		.shipping-item.active {
			background-color: #ff0000;
			color: #fff;
			border-color: #ff0000;
		}
		
		.shipping-item:hover {
			background-color: #e0e0e0;
			border-color: #ccc;
		}
		
		.shipping-item.active:hover {
			background-color: #e60000;
			border-color: #e60000;
		}
		
		.filter-footer {
			display: flex;
			justify-content: space-between;
			margin-top: 30rpx;
		}
		
		.filter-reset, .filter-confirm {
			flex: 1;
			height: 80rpx;
			border-radius: 10rpx;
			font-size: 28rpx;
			transition: all 0.3s ease;
		}
		
		.filter-reset {
			background-color: #f5f5f5;
			margin-right: 20rpx;
		}
		
		.filter-reset:hover {
			background-color: #e0e0e0;
		}
		
		.filter-confirm {
			background-color: #ff0000;
			color: #fff;
		}
		
		.filter-confirm:hover {
			background-color: #e60000;
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