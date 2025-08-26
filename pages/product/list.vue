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
			<view class="sort-item default-sort">
			<text :class="{ active: currentSort === 'default-asc' }" @click="toggleSort('default', 'asc')">↑</text>
			综合
			<text :class="{ active: currentSort === 'default-desc' }" @click="toggleSort('default', 'desc')">↓</text>
		</view>
			<view class="sort-item sales-sort">
				<text :class="{ active: currentSort === 'sales-asc' }" @click="toggleSort('sales', 'asc')">↑</text>
				销量
				<text :class="{ active: currentSort === 'sales-desc' }" @click="toggleSort('sales', 'desc')">↓</text>
			</view>
			<view class="sort-item price-sort">
				<text :class="{ active: currentSort === 'price-asc' }" @click="toggleSort('price', 'asc')">↑</text>
				价格
				<text :class="{ active: currentSort === 'price-desc' }" @click="toggleSort('price', 'desc')">↓</text>
			</view>
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
				<scroll-view class="product-list" scroll-y @scrolltolower="loadMore">
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
					
					<!-- 加载更多提示 -->
				<view class="loading-more" v-if="hasMore">
					<text>加载中...</text>
				</view>
				<view class="loading-more" v-else-if="products.length > 0 && scrollToken">
					<text>没有更多商品了</text>
				</view>
				<!-- 无数据提示 -->
				<view class="no-data" v-if="products.length === 0 && !hasMore">
					<text>暂无商品数据</text>
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
					currentSort: 'default-asc',
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
					products: [],
					scrollToken: null, // 滚动分页token
					hasMore: false // 是否还有更多数据
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
				// 实际项目中这里会调用后端API进行排序
				this.scrollToken = null; // 重置滚动分页token
						this.hasMore = false; // 重置更多数据标志
						this.products = []; // 清空商品列表
						this.fetchProducts();
			},
			// 切换排序方式
			toggleSort(sortType, direction) {
				// 如果传递了方向参数，直接使用；否则根据当前状态切换
				let newSortType;
				if (direction) {
					newSortType = sortType + '-' + direction;
				} else {
					// 根据当前排序状态切换排序方式
					newSortType = sortType + '-asc'; // 默认为正序
					
					// 如果当前已经是该类型的正序，则切换为倒序
					if (this.currentSort === sortType + '-asc') {
						newSortType = sortType + '-desc';
					} else if (this.currentSort === sortType + '-desc') {
						// 如果当前是倒序，则切换回默认排序
						newSortType = 'default-asc';
					}
				}
				
				this.currentSort = newSortType;
				console.log('按' + newSortType + '排序');
				
				// 重置分页相关状态
				this.scrollToken = null;
				this.hasMore = false;
				this.products = [];
				
				// 重新获取商品列表
				this.fetchProducts();
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
				this.scrollToken = null; // 重置滚动分页token
				this.hasMore = false; // 重置更多数据标志
				this.products = []; // 清空商品列表
				this.fetchProducts();
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
					},
					
					// 加载更多商品
					loadMore() {
						// 如果还有更多数据且当前不在加载中，则加载更多
						if (this.hasMore && this.scrollToken) {
							console.log('加载更多商品...');
							this.fetchProducts();
						}
					},
					
					// 获取商品列表
					fetchProducts() {
				// 构建API请求URL
				let url = 'http://localhost:8080/app/product/query';
				
				// 构建查询参数
				let params = [];
				
				// 添加排序参数
				let sortBy = '1'; // 默认综合正序
				if (this.currentSort === 'sales-asc') {
					sortBy = '2'; // 销量正序
				} else if (this.currentSort === 'sales-desc') {
					sortBy = '3'; // 销量倒序
				} else if (this.currentSort === 'price-asc') {
					sortBy = '4'; // 价格正序
				} else if (this.currentSort === 'price-desc') {
					sortBy = '5'; // 价格倒序
				} else if (this.currentSort === 'default-desc') {
					sortBy = '6'; // 综合倒序
				}
				params.push('sortBy=' + sortBy);
				
				// 添加关键词参数
				if (this.searchKeyword) {
					params.push('keyword=' + encodeURIComponent(this.searchKeyword));
				}
				
				// 添加分页参数
				params.push('pageSize=20'); // 设置每页大小
				
				// 添加滚动分页token
				if (this.scrollToken) {
					params.push('scrollToken=' + encodeURIComponent(this.scrollToken));
				}
				
				// 拼接完整URL
				url += '?' + params.join('&');
				
				uni.request({
					url: url,
					method: 'GET',
					header: {
						'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiaWF0IjoxNzU0ODMxOTI0LCJzdWIiOiJhcHAiLCJ0ZXJtIjoiYXBwIiwiaWF0TXMiOjE3NTQ4MzE5MjQ5NjksImV4cE1zIjoxNzU0ODM1NTI0OTY5fQ.T5UGHYy6ThASbwIae6aM1tJue15rJaAFnyXI945UhSk',
						'Content-Type': 'application/json'
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data.code === 0) {
							// 处理返回的商品数据
							const responseData = res.data.data;
							
							// 更新滚动分页相关变量
							this.scrollToken = responseData.scrollToken || null;
							this.hasMore = responseData.hasMore || false;
							
							// 处理商品数据，添加价格和销量的模拟值
							const productsWithDetails = responseData.data.map(item => ({
								...item,
								price: item.minPrice !== undefined ? item.minPrice.toFixed(2) : (Math.random() * 1000).toFixed(2),
								sales: item.sales !== undefined ? item.sales : Math.floor(Math.random() * 1000),
								image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
							}));
							
							// 如果是加载更多，追加到现有商品列表；否则替换商品列表
							if (this.scrollToken && this.products.length > 0) {
								this.products = [...this.products, ...productsWithDetails];
							} else {
								this.products = productsWithDetails;
							}
							
							// 如果返回的数据为空，表示没有更多数据了，停止显示"加载中"
							if (productsWithDetails.length === 0) {
								this.hasMore = false;
							}
						} else {
							console.error('获取商品列表失败:', res.data.message);
						}
					},
					fail: (err) => {
						console.error('请求商品列表失败:', err);
					}
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
			// 获取搜索关键词并填充到搜索框
			if (options.searchKeyword) {
				this.searchKeyword = options.searchKeyword;
			}
			
			// 调用接口获取商品列表
			this.fetchProducts();
		},
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
		
		.default-sort, .sales-sort, .price-sort {
			display: flex;
			align-items: center;
			gap: 5rpx;
			position: relative;
		}
		
		.default-sort text, .sales-sort text, .price-sort text {
			font-size: 20rpx;
			color: #999;
			cursor: pointer;
			line-height: 1;
		}
		
		.default-sort text.active, .sales-sort text.active, .price-sort text.active {
			color: #ff0000;
			font-weight: bold;
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
		
		/* 加载更多提示样式 */
		.loading-more {
			text-align: center;
			padding: 20rpx;
			font-size: 24rpx;
			color: #888;
		}
		
		/* 无数据提示样式 */
		.no-data {
			text-align: center;
			padding: 40rpx;
			font-size: 28rpx;
			color: #888;
		}
</style>