<template>
	<view class="product-list-container">
		
		<!-- 搜索框 -->
		<view class="search-box">
			<input class="search-input" placeholder="搜索商品" v-model="searchKeyword" />
			<button class="search-btn" @click="searchProducts">搜索</button>
		</view>
		
		<!-- 排序选项 -->
		<view class="sort-options">
			<view class="sort-item default-sort" @click="sortProducts('default')">
			<text :class="{ active: currentSort === 'default-asc' || currentSort === 'default-desc' }">↑</text>
			综合
			<text :class="{ active: currentSort === 'default-asc' || currentSort === 'default-desc' }">↓</text>
		</view>
			<view class="sort-item sales-sort" @click="sortProducts('sales')">
				<text :class="{ active: currentSort === 'sales-asc' || currentSort === 'sales-desc' }">↑</text>
				销量
				<text :class="{ active: currentSort === 'sales-asc' || currentSort === 'sales-desc' }">↓</text>
			</view>
			<view class="sort-item price-sort" @click="sortProducts('price')">
				<text :class="{ active: currentSort === 'price-asc' || currentSort === 'price-desc' }">↑</text>
				价格
				<text :class="{ active: currentSort === 'price-asc' || currentSort === 'price-desc' }">↓</text>
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

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { getToken } from '@/utils/auth.js'

const categoryName = ref('')
const categoryId = ref(0)
const currentSort = ref('default-asc')
const isGridView = ref(true)
const searchKeyword = ref('')
const showFilterPopup = ref(false)
const filterOptions = reactive({
  minPrice: '',
  maxPrice: '',
  selectedBrands: [],
  shippingOption: 'all'
})
const brands = ['品牌A', '品牌B', '品牌C', '品牌D']
const products = ref([])
const scrollToken = ref(null)
const hasMore = ref(false)
const pageSize = 20

function createRequestHeader() {
  const header = {
    'Content-Type': 'application/json'
  }
  const token = getToken()
  if (token) {
    header.Authorization = `Bearer ${token}`
  }
  return header
}

function resetPagination() {
  scrollToken.value = null
  hasMore.value = false
  products.value = []
}

function showFilter() {
  showFilterPopup.value = true
}

function closeFilter() {
  showFilterPopup.value = false
}

function sortProducts(sortType) {
  if (sortType === 'sales') {
    currentSort.value = currentSort.value === 'sales-asc' ? 'sales-desc' : 'sales-asc'
  } else if (sortType === 'price') {
    currentSort.value = currentSort.value === 'price-asc' ? 'price-desc' : 'price-asc'
  } else if (sortType === 'default') {
    currentSort.value = 'default-asc'
  } else {
    currentSort.value = sortType
  }

  resetPagination()
  fetchProducts()
}

function goToProductDetail(item) {
  uni.navigateTo({
    url: `/pages/product/detail?productId=${item.id}`
  })
}

function toggleView() {
  isGridView.value = !isGridView.value
}

function searchProducts() {
  resetPagination()
  fetchProducts()
}

function toggleBrand(brand) {
  const index = filterOptions.selectedBrands.indexOf(brand)
  if (index > -1) {
    filterOptions.selectedBrands.splice(index, 1)
  } else {
    filterOptions.selectedBrands.push(brand)
  }
}

function selectShipping(option) {
  filterOptions.shippingOption = option
}

function resetFilter() {
  filterOptions.minPrice = ''
  filterOptions.maxPrice = ''
  filterOptions.selectedBrands.splice(0, filterOptions.selectedBrands.length)
  filterOptions.shippingOption = 'all'
}

function applyFilter() {
  closeFilter()
  resetPagination()
  fetchProducts()
}

function loadMore() {
  if (hasMore.value && scrollToken.value) {
    fetchProducts()
  }
}

function getSortBy() {
  switch (currentSort.value) {
    case 'sales-asc':
      return '2'
    case 'sales-desc':
      return '3'
    case 'price-asc':
      return '4'
    case 'price-desc':
      return '5'
    case 'default-desc':
      return '6'
    default:
      return '1'
  }
}

function buildQueryParams() {
  const params = [`sortBy=${getSortBy()}`, `pageSize=${pageSize}`]

  if (searchKeyword.value) {
    params.push(`keyword=${encodeURIComponent(searchKeyword.value)}`)
  }

  if (scrollToken.value) {
    params.push(`scrollToken=${encodeURIComponent(scrollToken.value)}`)
  }

  return params
}

function fetchProducts() {
  uni.request({
    url: `${BASE_API}/app/product/query?${buildQueryParams().join('&')}`,
    method: 'GET',
    header: createRequestHeader(),
    success: (res) => {
      if (res.statusCode !== 200 || res.data.code !== 0) {
        console.error('获取商品列表失败:', res.data && res.data.message)
        return
      }

      const responseData = res.data.data || {}
      const incomingProducts = (responseData.data || []).map((item) => ({
        ...item,
        price: item.minPrice !== undefined ? item.minPrice.toFixed(2) : '0.00',
        sales: item.sales !== undefined ? item.sales : 0,
        image: getStoragePreviewUrl(item.mainImage) || 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }))

      scrollToken.value = responseData.scrollToken || null
      hasMore.value = !!responseData.hasMore

      if (scrollToken.value && products.value.length > 0) {
        products.value = [...products.value, ...incomingProducts]
      } else {
        products.value = incomingProducts
      }

      if (incomingProducts.length === 0) {
        hasMore.value = false
      }
    },
    fail: (error) => {
      console.error('请求商品列表失败:', error)
    }
  })
}

onLoad((options = {}) => {
  if (options.categoryId) {
    categoryId.value = Number(options.categoryId)
  }
  if (options.categoryName) {
    categoryName.value = decodeURIComponent(options.categoryName)
  }
  if (options.searchKeyword) {
    searchKeyword.value = decodeURIComponent(options.searchKeyword)
  } else if (options.query) {
    searchKeyword.value = decodeURIComponent(options.query)
  }

  fetchProducts()
})
</script>

<style scoped>
	.product-list-container {
		height: 100vh;
		padding-top: 0;
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
