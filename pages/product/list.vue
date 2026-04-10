<template>
  <view class="search-page">
    <view class="search-header">
      <view class="search-shell">
        <view class="search-input-wrap">
          <text class="search-icon">⌕</text>
          <input
            class="search-input"
            placeholder="搜索商品、品牌、分类"
            v-model="searchKeyword"
            confirm-type="search"
            @confirm="searchProducts"
          />
        </view>
        <button class="search-submit" @click="searchProducts">搜索</button>
      </view>

      <view class="toolbar-row">
        <view
          class="tool-pill"
          :class="{ active: currentSort === 'default-asc' || currentSort === 'default-desc' }"
          @click="sortProducts('default')"
        >
          <text class="pill-label">综合</text>
          <text class="pill-arrow">↕</text>
        </view>
        <view
          class="tool-pill"
          :class="{ active: currentSort === 'sales-asc' || currentSort === 'sales-desc' }"
          @click="sortProducts('sales')"
        >
          <text class="pill-label">销量</text>
          <text class="pill-arrow">{{ currentSort === 'sales-desc' ? '↓' : '↑' }}</text>
        </view>
        <view
          class="tool-pill"
          :class="{ active: currentSort === 'price-asc' || currentSort === 'price-desc' }"
          @click="sortProducts('price')"
        >
          <text class="pill-label">价格</text>
          <text class="pill-arrow">{{ currentSort === 'price-desc' ? '↓' : '↑' }}</text>
        </view>
        <view class="tool-pill alt" @click="toggleView">
          <text class="pill-label">{{ isGridView ? '双列' : '列表' }}</text>
          <text class="pill-arrow">{{ isGridView ? '◫' : '☰' }}</text>
        </view>
      </view>

      <view class="active-filter-row" v-if="activeFilterTags.length">
        <view class="filter-chip" v-for="tag in activeFilterTags" :key="tag">
          <text>{{ tag }}</text>
        </view>
      </view>
    </view>

    <view class="filter-popup" :class="{ show: showFilterPopup }" v-if="showFilterPopup">
      <view class="filter-overlay" @click="closeFilter"></view>
      <view class="filter-content">
        <view class="filter-header">
          <text class="filter-kicker">搜索筛选</text>
          <text class="filter-title">收窄结果范围</text>
          <text class="filter-close" @click="closeFilter">×</text>
        </view>
        <view class="filter-body">
          <view class="filter-section">
            <text class="filter-section-title">价格区间</text>
            <view class="price-range">
              <input class="price-input" placeholder="最低价" v-model="filterOptions.minPrice" />
              <text class="price-divider">至</text>
              <input class="price-input" placeholder="最高价" v-model="filterOptions.maxPrice" />
            </view>
          </view>

          <view class="filter-section">
            <text class="filter-section-title">品牌</text>
            <view class="brand-list">
              <view
                class="brand-item"
                v-for="brand in brands"
                :key="brand"
                :class="{ active: filterOptions.selectedBrands.includes(brand) }"
                @click="toggleBrand(brand)"
              >
                {{ brand }}
              </view>
            </view>
          </view>

          <view class="filter-section">
            <text class="filter-section-title">发货速度</text>
            <view class="shipping-options">
              <view
                class="shipping-item"
                :class="{ active: filterOptions.shippingOption === 'all' }"
                @click="selectShipping('all')"
              >
                全部
              </view>
              <view
                class="shipping-item"
                :class="{ active: filterOptions.shippingOption === 'free' }"
                @click="selectShipping('free')"
              >
                包邮
              </view>
              <view
                class="shipping-item"
                :class="{ active: filterOptions.shippingOption === 'fast' }"
                @click="selectShipping('fast')"
              >
                24小时内发货
              </view>
            </view>
          </view>
        </view>
        <view class="filter-footer">
          <button class="filter-reset" @click="resetFilter">重置</button>
          <button class="filter-confirm" @click="applyFilter">应用筛选</button>
        </view>
      </view>
    </view>

    <scroll-view class="results-scroll" scroll-y @scrolltolower="loadMore">
      <view class="results-content">
        <view class="state-card loading-card" v-if="loadingProducts && !hasLoadedOnce">
          <text class="state-title">正在加载搜索结果</text>
          <text class="state-desc">正在根据当前关键词和排序条件拉取商品列表</text>
        </view>

        <template v-else>
          <view v-if="isGridView" class="waterfall-container">
            <view class="waterfall-column">
              <view class="product-item" v-for="item in leftColumnProducts" :key="item.id" @click="goToProductDetail(item)">
                <image class="product-image" :src="item.image" mode="aspectFill"></image>
                <view class="product-info">
                  <text class="product-name">{{ item.name }}</text>
                  <view class="price-sales-container">
                    <text class="product-price">￥{{ item.price }}</text>
                    <text class="product-sales">已售{{ item.sales }}件</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="waterfall-column">
              <view class="product-item" v-for="item in rightColumnProducts" :key="item.id" @click="goToProductDetail(item)">
                <image class="product-image" :src="item.image" mode="aspectFill"></image>
                <view class="product-info">
                  <text class="product-name">{{ item.name }}</text>
                  <view class="price-sales-container">
                    <text class="product-price">￥{{ item.price }}</text>
                    <text class="product-sales">已售{{ item.sales }}件</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view v-else class="result-list">
            <view class="result-row" v-for="item in products" :key="item.id" @click="goToProductDetail(item)">
              <image class="result-row-image" :src="item.image" mode="aspectFill"></image>
              <view class="result-row-body">
                <text class="result-row-name">{{ item.name }}</text>
                <view class="result-row-meta">
                  <text class="result-row-price">￥{{ item.price }}</text>
                  <text class="result-row-sales">销量 {{ item.sales }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="state-card empty-card" v-if="hasLoadedOnce && products.length === 0 && !loadingProducts">
            <text class="state-title">没有找到匹配商品</text>
            <text class="state-desc">换个关键词试试，或者放宽筛选条件。</text>
          </view>

          <view class="list-footer" v-if="products.length > 0">
            <text v-if="loadingProducts" class="footer-text">继续加载中...</text>
            <text v-else-if="!hasMore" class="footer-text muted">没有更多结果了</text>
            <text v-else class="footer-text muted">上滑加载更多</text>
          </view>
        </template>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
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
const loadingProducts = ref(false)
const hasLoadedOnce = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  if (filterOptions.minPrice) count += 1
  if (filterOptions.maxPrice) count += 1
  if (filterOptions.selectedBrands.length) count += 1
  if (filterOptions.shippingOption !== 'all') count += 1
  return count
})

const activeFilterTags = computed(() => {
  const tags = []
  if (filterOptions.minPrice || filterOptions.maxPrice) {
    tags.push(`价格 ${filterOptions.minPrice || '0'}-${filterOptions.maxPrice || '不限'}`)
  }
  if (filterOptions.selectedBrands.length) {
    tags.push(`品牌 ${filterOptions.selectedBrands.join(' / ')}`)
  }
  if (filterOptions.shippingOption === 'free') {
    tags.push('包邮')
  } else if (filterOptions.shippingOption === 'fast') {
    tags.push('24小时内发货')
  }
  return tags
})

const leftColumnProducts = computed(() => {
  return products.value.filter((_, index) => index % 2 === 0)
})

const rightColumnProducts = computed(() => {
  return products.value.filter((_, index) => index % 2 === 1)
})

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
  hasLoadedOnce.value = false
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
  if (hasMore.value && scrollToken.value && !loadingProducts.value) {
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
  loadingProducts.value = true
  uni.request({
    url: `${BASE_API}/app/product/query?${buildQueryParams().join('&')}`,
    method: 'GET',
    header: createRequestHeader(),
    success: (res) => {
      if (res.statusCode !== 200 || res.data.code !== 0) {
        console.error('获取商品列表失败:', res.data && res.data.message)
        hasLoadedOnce.value = true
        loadingProducts.value = false
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
      hasLoadedOnce.value = true
      loadingProducts.value = false
    },
    fail: (error) => {
      console.error('请求商品列表失败:', error)
      hasLoadedOnce.value = true
      loadingProducts.value = false
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
.search-page {
  --search-surface: #ffffff;
  --search-surface-soft: #fafafa;
  --search-text: #111111;
  --search-muted: #7a7a7a;
  --search-border: rgba(17, 17, 17, 0.08);
  --search-border-strong: rgba(17, 17, 17, 0.16);
  --search-accent: #111111;
  --search-accent-soft: #f2f2f2;
  --search-shadow: 0 8rpx 24rpx rgba(17, 17, 17, 0.04);
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 20rpx 20rpx 16rpx;
  background: rgba(245, 245, 245, 0.96);
  border-bottom: 1rpx solid var(--search-border);
}

.search-shell {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: var(--search-shadow);
}

.search-input-wrap {
  flex: 1;
  min-width: 0;
  height: 68rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 20rpx;
  border-radius: 14rpx;
  background: var(--search-surface);
  border: 1rpx solid var(--search-border);
}

.search-icon {
  color: var(--search-muted);
  font-size: 38rpx;
  font-weight: 600;
}

.search-input {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: var(--search-text);
}

.search-submit {
  width: 128rpx;
  height: 68rpx;
  line-height: 68rpx;
  border-radius: 14rpx;
  border: none;
  background: #111111;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
}

.toolbar-row {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.tool-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-width: 0;
  min-height: 64rpx;
  padding: 0 12rpx;
  border-radius: 14rpx;
  background: var(--search-surface);
  border: 1rpx solid var(--search-border);
  color: var(--search-text);
  box-shadow: none;
}

.tool-pill.active {
  border-color: var(--search-text);
  color: var(--search-text);
}

.tool-pill.alt {
  background: var(--search-surface-soft);
}

.pill-label {
  font-size: 24rpx;
  font-weight: 500;
}

.pill-arrow {
  font-size: 22rpx;
  color: var(--search-muted);
}

.pill-badge {
  min-width: 34rpx;
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #111111;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 34rpx;
  text-align: center;
}

.active-filter-row {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 16rpx;
}

.filter-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: var(--search-surface);
  color: var(--search-muted);
  font-size: 22rpx;
  border: 1rpx solid var(--search-border);
}

.results-scroll {
  flex: 1;
  min-height: 0;
}

.results-content {
  padding: 20rpx 20rpx 40rpx;
}

.state-card {
  border-radius: 18rpx;
  padding: 34rpx 30rpx;
  background: var(--search-surface);
  border: 1rpx solid var(--search-border);
  box-shadow: var(--search-shadow);
}

.state-title {
  display: block;
  font-size: 32rpx;
  color: var(--search-text);
  font-weight: 600;
}

.state-desc {
  display: block;
  margin-top: 12rpx;
  line-height: 1.6;
  font-size: 25rpx;
  color: var(--search-muted);
}

.empty-card {
  margin-top: 24rpx;
  text-align: center;
}

.waterfall-container {
  display: flex;
  justify-content: space-between;
  padding: 4rpx 0 0;
}

.waterfall-column {
  flex: 1;
  width: 50%;
}

.waterfall-column:first-child {
  margin-right: 8rpx;
}

.waterfall-column:last-child {
  margin-left: 8rpx;
}

.product-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 24rpx;
}

.product-image {
  width: 100%;
  height: auto;
  aspect-ratio: 100 / 80;
  border-bottom: 1rpx solid #f5f5f5;
  background: #f0f0f0;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  min-height: 76rpx;
  line-height: 1.4;
  font-size: 28rpx;
  font-weight: bold;
  color: #000;
}

.price-sales-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.product-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #e4393c;
}

.product-sales {
  font-size: 20rpx;
  color: #999;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.result-row {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border-radius: 14rpx;
  background: #fff;
  border: 1rpx solid var(--search-border);
  box-shadow: var(--search-shadow);
}

.result-row-image {
  width: 230rpx;
  height: 230rpx;
  flex-shrink: 0;
  background: #f0f0f0;
}

.result-row-body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  padding: 18rpx 18rpx 20rpx;
}

.result-row-name {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  min-height: 72rpx;
  line-height: 1.4;
  font-size: 26rpx;
  color: var(--search-text);
}

.result-row-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12rpx;
  margin-top: 18rpx;
}

.result-row-price {
  font-size: 32rpx;
  font-weight: 700;
  color: #111111;
}

.result-row-sales {
  font-size: 22rpx;
  color: var(--search-muted);
}

.list-footer {
  padding: 28rpx 0 10rpx;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: var(--search-text);
}

.footer-text.muted {
  color: var(--search-muted);
}

.filter-popup {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.filter-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 17, 17, 0.36);
}

.filter-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 82%;
  padding: 30rpx 24rpx 24rpx;
  border-top-left-radius: 22rpx;
  border-top-right-radius: 22rpx;
  background: var(--search-surface);
  box-shadow: 0 -12rpx 36rpx rgba(17, 17, 17, 0.12);
}

.filter-header {
  position: relative;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid var(--search-border);
}

.filter-kicker {
  display: block;
  font-size: 22rpx;
  color: var(--search-muted);
  letter-spacing: 2rpx;
}

.filter-title {
  display: block;
  margin-top: 8rpx;
  font-size: 34rpx;
  color: var(--search-text);
  font-weight: 600;
}

.filter-close {
  position: absolute;
  top: 0;
  right: 6rpx;
  font-size: 40rpx;
  color: var(--search-muted);
}

.filter-body {
  padding-top: 14rpx;
}

.filter-section {
  margin-top: 24rpx;
}

.filter-section-title {
  display: block;
  margin-bottom: 18rpx;
  font-size: 26rpx;
  color: var(--search-text);
  font-weight: 600;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.price-input {
  flex: 1;
  height: 72rpx;
  padding: 0 22rpx;
  border-radius: 14rpx;
  background: var(--search-surface-soft);
  border: 1rpx solid var(--search-border);
  font-size: 26rpx;
  color: var(--search-text);
}

.price-divider {
  color: var(--search-muted);
  font-size: 24rpx;
}

.brand-list,
.shipping-options {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.brand-item,
.shipping-item {
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: var(--search-surface-soft);
  border: 1rpx solid var(--search-border);
  color: var(--search-muted);
  font-size: 24rpx;
}

.brand-item.active,
.shipping-item.active {
  background: #111111;
  border-color: #111111;
  color: #ffffff;
}

.filter-footer {
  display: flex;
  gap: 18rpx;
  margin-top: 34rpx;
}

.filter-reset,
.filter-confirm {
  flex: 1;
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 14rpx;
  border: none;
  font-size: 28rpx;
}

.filter-reset {
  background: var(--search-surface-soft);
  border: 1rpx solid var(--search-border);
  color: var(--search-text);
}

.filter-confirm {
  background: #111111;
  color: #ffffff;
}

@media (max-width: 380px) {
  .search-shell {
    gap: 10rpx;
    padding: 12rpx;
  }

  .search-submit {
    width: 112rpx;
  }

  .toolbar-row {
    gap: 10rpx;
  }

  .tool-pill {
    padding: 0 8rpx;
  }

  .result-row-image {
    width: 200rpx;
  }
}
</style>
