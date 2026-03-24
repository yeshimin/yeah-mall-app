<template>
  <view class="container" :style="{ paddingTop: navBarHeight + 'px' }">
    <!-- 自定义标题栏组件 -->
    <custom-nav-bar 
      :show-search="true"
      :search-placeholder="'搜索商品'"
      @search="handleSearch"
      @height-calculated="handleNavBarHeightCalculated"
    />

    <!-- Banner滚动区域 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :autoplay="true" :interval="3000" :duration="500" :circular="true" :indicator-dots="true" :indicator-color="'rgba(255,255,255,0.5)'" :indicator-active-color="'#fff'">
        <swiper-item 
          v-for="(banner, index) in banners" 
          :key="index"
          @click="handleBannerClick(banner.id)"
        >
          <image class="banner-image" :src="banner.image" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷入口 -->
    <view 
      v-if="!quickLinksLoading && quickLinks.length > 0"
      class="quick-links" 
    >
      <!-- 快捷入口列表 -->
      <view>
        <!-- 遍历每一行 -->
        <view 
          v-for="(row, rowIndex) in quickLinkRows" 
          :key="rowIndex"
          class="quick-link-row"
          :style="{ display: 'flex', justifyContent: 'flex-start' }"
        >
          <!-- 遍历行内每个快捷入口 -->
          <view 
            class="quick-link-item" 
            v-for="link in row.items" 
            :key="link.id"
            @click="handleQuickLinkClick(link)"
            :style="{ width: `${100 / row.maxCount}%`, boxSizing: 'border-box', padding: '0 10rpx' }"
          >
            <image class="quick-link-icon" :src="link.icon" />
            <text class="quick-link-text">{{ link.name }}</text>
          </view>
          <!-- 填充空白项，确保对齐 -->
          <view 
            v-for="i in (row.maxCount - row.items.length)" 
            :key="`empty-${rowIndex}-${i}`"
            :style="{ width: `${100 / row.maxCount}%` }"
          ></view>
        </view>
      </view>
    </view>

    <!-- 热门商品 -->
    <view class="section">
      <view class="waterfall-container">
        <view class="waterfall-column">
          <view 
            class="product-item" 
            v-for="product in leftColumnProducts" 
            :key="product.id"
            @click="goToProduct(product.id)"
          >
            <image class="product-image" :src="product.image" v-if="product.image" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <!-- 标签区域 -->
              <view class="product-tags" v-if="product.tags && product.tags.length > 0">
                <text 
                  v-for="(tag, index) in product.tags.slice(0, 3)" 
                  :key="index"
                  class="product-tag"
                >{{ tag }}</text>
              </view>
              <view class="price-sales-container">
                <text class="product-price">￥{{ product.price }}</text>
                <text class="product-sales">已售{{ product.sales }}件</text>
              </view>
            </view>
          </view>
        </view>
        <view class="waterfall-column">
          <view 
            class="product-item" 
            v-for="product in rightColumnProducts" 
            :key="product.id"
            @click="goToProduct(product.id)"
          >
            <image class="product-image" :src="product.image" v-if="product.image" />
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <!-- 标签区域 -->
              <view class="product-tags" v-if="product.tags && product.tags.length > 0">
                <text 
                  v-for="(tag, index) in product.tags.slice(0, 3)" 
                  :key="index"
                  class="product-tag"
                >{{ tag }}</text>
              </view>
              <view class="price-sales-container">
                <text class="product-price">￥{{ product.price }}</text>
                <text class="product-sales">已售{{ product.sales }}件</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 促销活动 -->
    <view class="section">
      <scroll-view class="promotion-list" scroll-x>
        <view 
          class="promotion-item" 
          v-for="promotion in promotions" 
          :key="promotion.id"
        >
          <image class="promotion-image" :src="promotion.image" />
          <text class="promotion-title">{{ promotion.title }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CustomNavBar from '../../components/custom-nav-bar.vue'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { getToken } from '@/utils/auth.js'

const defaultQuickLinks = [
  { id: 1, name: '秒杀', icon: '/static/logo.png', action: 'goToSeckill' },
  { id: 2, name: '拼团', icon: '/static/logo.png', action: 'goToGroupBuy' },
  { id: 3, name: '新品', icon: '/static/logo.png', action: 'goToNewArrivals' },
  { id: 4, name: '优惠券', icon: '/static/logo.png', action: 'goToCoupons' },
  { id: 5, name: '会员', icon: '/static/logo.png', action: 'goToMember' },
  { id: 6, name: '积分', icon: '/static/logo.png', action: 'goToPoints' },
  { id: 7, name: '客服', icon: '/static/logo.png', action: 'goToService' },
  { id: 8, name: '设置', icon: '/static/logo.png', action: 'goToSettings' }
]

const banners = ref([])
const bannersLoading = ref(false)
const quickLinks = ref([...defaultQuickLinks])
const quickLinksLoading = ref(false)
const hotProducts = ref([])
const promotions = ref([])
const leftColumnProducts = ref([])
const rightColumnProducts = ref([])
const scrollToken = ref(null)
const hasMore = ref(true)
const navBarHeight = ref(0)

const quickLinkRows = computed(() => {
  const count = quickLinks.value.length
  const displayCount = Math.min(count, 10)

  if (displayCount <= 4) {
    return [{
      items: quickLinks.value.slice(0, displayCount),
      count: displayCount,
      maxCount: displayCount
    }]
  }

  const firstRowCount = Math.ceil(displayCount / 2)
  const secondRowCount = displayCount - firstRowCount
  return [{
    items: quickLinks.value.slice(0, firstRowCount),
    count: firstRowCount,
    maxCount: firstRowCount
  }, {
    items: quickLinks.value.slice(firstRowCount, displayCount),
    count: secondRowCount,
    maxCount: firstRowCount
  }]
})

function createRequestHeader() {
  const token = getToken()
  const header = {
    'Content-Type': 'application/json'
  }

  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  return header
}

function handleSearch() {
  uni.navigateTo({
    url: '/pages/product/list'
  })
}

function handleBannerClick(bannerId) {
  void bannerId
}

function handleQuickLinkClick(link) {
  const actionHandlers = {
    goToSeckill,
    goToGroupBuy,
    goToCoupons,
    goToCouponCenter,
    goToNewArrivals,
    goToMember,
    goToPoints,
    goToService,
    goToSettings,
    handleDefaultQuickLink,
    handleCustomQuickLink
  }

  const handler = actionHandlers[link.action]
  if (handler) {
    handler(link)
    return
  }

  console.warn('Action not found:', link.action)
}

function goToCoupons() {
  uni.navigateTo({
    url: '/pages/coupons/list'
  })
}

function goToMember() {
  uni.switchTab({
    url: '/pages/profile/profile'
  })
}

function goToPoints() {
  uni.showToast({
    title: '积分功能开发中',
    icon: 'none'
  })
}

function goToService(link = {}) {
  const query = link.target ? `?shopId=${encodeURIComponent(link.target)}` : ''
  uni.navigateTo({
    url: `/pages/customer-service/index${query}`
  })
}

function goToSettings() {
  uni.navigateTo({
    url: '/pages/profile/edit'
  })
}

function handleNavBarHeightCalculated(event) {
  navBarHeight.value = event.plusHeight
}

function goToProduct(productId) {
  uni.navigateTo({
    url: `/pages/product/detail?productId=${productId}`
  })
}

function goToSeckill() {
  uni.navigateTo({
    url: '/pages/seckill/list'
  })
}

function goToGroupBuy() {
  uni.navigateTo({
    url: `/pages/product/list?query=${encodeURIComponent('拼团')}`
  })
}

function goToCouponCenter() {
  uni.navigateTo({
    url: '/pages/coupons/center'
  })
}

function goToNewArrivals() {
  uni.navigateTo({
    url: `/pages/product/list?query=${encodeURIComponent('新品')}`
  })
}

function initWaterfall() {
  leftColumnProducts.value = []
  rightColumnProducts.value = []

  hotProducts.value.forEach((product, index) => {
    if (index % 2 === 0) {
      leftColumnProducts.value.push(product)
    } else {
      rightColumnProducts.value.push(product)
    }
  })
}

function getActionForQuickLink(type, target) {
  if (target === '/pages/coupons/center') {
    return 'goToCouponCenter'
  }

  if (target === '/pages/coupons/list') {
    return 'goToCoupons'
  }

  if (target === '/pages/seckill/list') {
    return 'goToSeckill'
  }

  switch (type) {
    case 1:
      return 'goToSeckill'
    case 2:
      return 'goToGroupBuy'
    case 3:
      return 'goToNewArrivals'
    case 4:
      return 'goToCouponCenter'
    case 5:
      return 'goToMember'
    case 6:
      return 'goToPoints'
    case 7:
      return 'goToService'
    case 8:
      return 'goToSettings'
    default:
      return target ? 'handleCustomQuickLink' : 'handleDefaultQuickLink'
  }
}

function handleDefaultQuickLink() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

function handleCustomQuickLink(link) {
  if (link.target && link.target.startsWith('/pages/')) {
    uni.navigateTo({
      url: link.target
    })
    return
  }

  handleDefaultQuickLink()
}

function fetchQuickLinks() {
  quickLinksLoading.value = true
  uni.request({
    url: `${BASE_API}/app/platQuickEntry/query`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 0) {
        quickLinks.value = (res.data.data || []).slice(0, 10).map((link, index) => ({
          id: index + 1,
          name: link.name,
          icon: getStoragePreviewUrl(link.icon),
          type: link.type,
          target: link.target,
          action: getActionForQuickLink(link.type, link.target)
        }))
        return
      }

      console.error('获取快捷入口失败:', res.data && res.data.message)
    },
    fail: (error) => {
      console.error('请求快捷入口失败:', error)
    },
    complete: () => {
      quickLinksLoading.value = false
    }
  })
}

function fetchBanners() {
  bannersLoading.value = true
  uni.request({
    url: `${BASE_API}/app/platBanner/query`,
    method: 'GET',
    header: createRequestHeader(),
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 0) {
        banners.value = (res.data.data || []).map((banner, index) => ({
          id: index + 1,
          image: getStoragePreviewUrl(banner.imageUrl)
        }))
        return
      }

      console.error('获取平台 Banner 失败:', res.data && res.data.message)
    },
    fail: (error) => {
      console.error('请求平台 Banner 失败:', error)
    },
    complete: () => {
      bannersLoading.value = false
    }
  })
}

function fetchHotProducts() {
  if (!hasMore.value) {
    return
  }

  const params = ['pageSize=10']
  if (scrollToken.value) {
    params.push(`scrollToken=${encodeURIComponent(scrollToken.value)}`)
  }

  uni.request({
    url: `${BASE_API}/app/product/queryHot?${params.join('&')}`,
    method: 'GET',
    header: createRequestHeader(),
    success: (res) => {
      if (res.statusCode === 200 && res.data.code === 0) {
        const responseData = res.data.data || {}
        scrollToken.value = responseData.scrollToken || null
        hasMore.value = !!responseData.hasMore

        const productsWithDetails = (responseData.data || []).map((item) => ({
          ...item,
          id: item.id,
          name: item.name,
          price: item.minPrice !== undefined ? item.minPrice.toFixed(2) : '0.00',
          sales: item.sales !== undefined ? item.sales : 0,
          tags: item.tags || item.labelList || [],
          image: getStoragePreviewUrl(item.mainImage)
        }))

        hotProducts.value = [...hotProducts.value, ...productsWithDetails]
        initWaterfall()
        return
      }

      console.error('获取热门商品列表失败:', res.data && res.data.message)
    },
    fail: (error) => {
      console.error('请求热门商品列表失败:', error)
    }
  })
}

onMounted(() => {
  fetchBanners()
  fetchQuickLinks()
  fetchHotProducts()
})
</script>

<style scoped>
/* 推荐商家样式 */
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  padding: 30rpx 20rpx 20rpx;
  background-color: #fff;
  margin-top: 20rpx;
  border-bottom: 1rpx solid #eee;
  color: #333;
}

.shop-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120rpx, 1fr));
  gap: 30rpx;
  padding: 20rpx 20rpx 30rpx;
  background-color: #fff;
}

/* Removed shop-list::after as it's no longer needed for grid layout */

/* Removed shop-list::-webkit-scrollbar as it's no longer needed for grid layout */

.shop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
  cursor: pointer;
}

/* Removed shop-item:last-child as margin is now handled by grid gap */

.shop-item:hover {
  transform: translateY(-10rpx);
}

.shop-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid #fff;
  box-sizing: border-box;
}

.shop-name {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120rpx;
  text-align: center;
  line-height: 1.4;
  margin-top: 5rpx;
}

/* 商品分类样式 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120rpx, 1fr));
  gap: 30rpx;
  padding: 30rpx 20rpx;
  background-color: #fff;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #f5f5f5;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.category-name {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100rpx;
  text-align: center;
}

/* 热门商品样式 */
.waterfall-container {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  min-height: 800rpx; /* 设置最小高度确保两列显示 */
  height: auto; /* 使用自动高度 */
  overflow-y: visible; /* 禁用垂直滚动 */
}

.waterfall-column {
  flex: 1;
  margin: 0 10rpx;
  width: 50%; /* 确保每列占据50%宽度 */
}

.waterfall-column:first-child {
  margin-left: 0;
}

.waterfall-column:last-child {
  margin-right: 0;
}

.product-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
  margin-bottom: 24rpx;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-item:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.12);
}

.product-image {
  width: 100%;
  height: auto;
  aspect-ratio: 100 / 80;
  border-bottom: 1rpx solid #f5f5f5;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #000;
  margin-bottom: 12rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-tags {
  display: flex;
  margin-bottom: 14rpx;
  flex-wrap: wrap;
}

.product-tag {
  font-size: 18rpx;
  color: #ff6b6b;
  background-color: #fff0f0;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  margin-right: 10rpx;
  margin-bottom: 8rpx;
  border: 1rpx solid #ffecec;
}

.price-sales-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.product-price {
  color: #e4393c;
  font-size: 28rpx;
  font-weight: bold;
}

.product-sales {
  color: #999;
  font-size: 20rpx;
}

/* 促销活动样式 */
.promotion-list {
  display: flex;
  overflow-x: auto;
  padding: 20rpx;
  background-color: #fff;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
}

.promotion-list::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.promotion-item {
  width: 350rpx;
  height: 180rpx;
  background-color: #f5f5f5;
  border-radius: 15rpx;
  margin-right: 30rpx;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.promotion-image {
  width: 100%;
  height: 100%;
  border-radius: 15rpx;
}

.promotion-title {
  position: absolute;
  bottom: 15rpx;
  left: 15rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

/* Banner滚动区域样式 */
.banner-section {
  margin: 20rpx;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.banner-swiper {
  width: 100%;
  height: 300rpx;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 快捷入口样式 */
.quick-links {
  padding: 20rpx 0 10rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin: 20rpx;
}

.quick-link-row {
  margin-bottom: 15rpx;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20rpx;
  box-sizing: border-box;
  padding: 0 10rpx;
}

.quick-link-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.quick-link-text {
  font-size: 26rpx;
  color: #333;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  width: 100%;
  font-size: 28rpx;
  color: #999;
}
</style>
