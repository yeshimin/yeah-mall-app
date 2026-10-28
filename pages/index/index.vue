<template>
  <view class="container" :style="{ paddingTop: navBarHeight + 'px' }">
    <!-- 自定义标题栏组件 -->
    <custom-nav-bar
      :show-search="true"
      :show-brand="true"
      background-color="#f4f6f3"
      :search-placeholder="'搜索商品'"
      @search="handleSearch"
      @brand="goToAbout"
      @height-calculated="handleNavBarHeightCalculated"
    />

    <!-- Banner滚动区域 -->
    <view class="banner-section">
      <swiper v-if="banners.length" class="banner-swiper" :autoplay="true" :interval="3000" :duration="500" :circular="true" :indicator-dots="true" :indicator-color="'rgba(255,255,255,0.5)'" :indicator-active-color="'#fff'">
        <swiper-item
          v-for="(banner, index) in banners"
          :key="banner.id || index"
          @click="handleBannerClick(banner.id)"
        >
          <image
            class="banner-image"
            :class="{ 'is-loaded': banner.imageLoaded }"
            :src="banner.image"
            mode="aspectFill"
            @load="handleBannerImageLoad(banner)"
            @error="handleBannerImageError(banner)"
          />
        </swiper-item>
      </swiper>
      <view v-else class="banner-placeholder"></view>
    </view>

    <!-- 快捷入口 -->
    <view v-if="quickLinks.length > 0" class="quick-links">
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
            :class="`quick-link-tone-${getQuickLinkTone(link)}`"
            v-for="link in row.items"
            :key="link.id"
            hover-class="none"
            @click="handleQuickLinkClick(link)"
            @longpress.stop="handleQuickLinkLongPress"
            :style="{ width: `${100 / row.maxCount}%`, boxSizing: 'border-box', padding: '0 10rpx' }"
          >
            <view class="quick-link-icon-shell">
              <view
                v-if="!quickLinksReady || (link.icon && !link.iconLoaded && !link.iconFailed)"
                class="quick-link-icon-skeleton"
              ></view>
              <image
                class="quick-link-icon quick-link-icon--fallback"
                :class="{ 'is-hidden': !quickLinksReady || (link.icon && !link.iconFailed) }"
                :src="link.fallbackIcon"
                mode="aspectFit"
                :draggable="false"
              />
              <image
                v-if="link.icon && !link.iconFailed"
                class="quick-link-icon quick-link-icon--configured"
                :class="{ 'is-loaded': link.iconLoaded }"
                :src="link.icon"
                mode="aspectFit"
                :draggable="false"
                @load="handleQuickLinkIconLoad(link)"
                @error="handleQuickLinkIconError(link)"
              />
            </view>
            <text class="quick-link-text" :user-select="false">{{ link.name }}</text>
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
      <view class="mall-section-heading">
        <view class="mall-section-title-wrap">
          <view class="mall-section-mark"></view>
          <text class="mall-section-title">精选好物</text>
        </view>
      </view>
      <scroll-view class="home-category-scroll" scroll-x :show-scrollbar="false">
        <view class="home-category-row">
          <view
            v-for="category in homeCategories"
            :key="category.id"
            class="home-category-item"
            :class="{ active: activeHomeCategory === category.id }"
            @click="selectHomeCategory(category)"
          >
            {{ category.name }}
          </view>
        </view>
      </scroll-view>
      <view v-if="hotProductsLoading && hotProducts.length === 0" class="home-product-state">
        <text>正在加载精选商品...</text>
      </view>
      <view v-else-if="hotProducts.length === 0" class="home-product-state">
        <text class="home-product-state-title">{{ hotProductsLoadFailed ? '商品加载失败' : '暂无推荐商品' }}</text>
        <text class="home-product-state-hint" @click="retryHomeData">
          {{ hotProductsLoadFailed ? '网络恢复后会自动重试 · 点击立即重试' : '商品上架后会展示在这里' }}
        </text>
      </view>
      <view v-else class="waterfall-container">
        <view class="waterfall-column">
          <view 
            class="product-item" 
            v-for="product in leftColumnProducts" 
            :key="product.id"
            @click="goToProduct(product.id)"
          >
            <view class="product-image-shell">
              <image
                v-if="product.image && !product.imageFailed"
                class="product-image"
                :src="product.image"
                mode="aspectFill"
                @error="handleProductImageError(product)"
              />
              <view v-else class="product-image-placeholder"></view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-subtitle">{{ product.subtitle }}</text>
              <view class="price-sales-container">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-sales">已售 {{ product.sales }}</text>
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
            <view class="product-image-shell">
              <image
                v-if="product.image && !product.imageFailed"
                class="product-image"
                :src="product.image"
                mode="aspectFill"
                @error="handleProductImageError(product)"
              />
              <view v-else class="product-image-placeholder"></view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-subtitle">{{ product.subtitle }}</text>
              <view class="price-sales-container">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-sales">已售 {{ product.sales }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="hotProducts.length" class="home-product-more">
        <text v-if="hotProductsLoading">正在加载更多...</text>
        <text v-else-if="!hasMore">已经到底了</text>
      </view>
    </view>

    <!-- 促销活动 -->
    <view v-if="promotions.length > 0" class="section">
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import CustomNavBar from '../../components/custom-nav-bar.vue'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { getToken } from '@/utils/auth.js'

const quickLinkFallbackIcons = {
  goToSeckill: '/static/quick/seckill-prototype-v2.png',
  goToGroupBuy: '/static/quick/group-buy-prototype-v2.png',
  goToNewArrivals: '/static/quick/new-prototype-v2.png',
  goToCoupons: '/static/quick/coupon-prototype-v2.png',
  goToCouponCenter: '/static/quick/coupon-prototype-v2.png',
  goToMember: '/static/quick/member.png',
  goToPoints: '/static/quick/points-prototype-v2.png',
  goToPointsMall: '/static/quick/points-prototype-v2.png',
  goToService: '/static/quick/service.png',
  goToSettings: '/static/quick/settings.png',
  handleCustomQuickLink: '/static/quick/default.png',
  handleDefaultQuickLink: '/static/quick/default.png'
}

const defaultQuickLinks = [
  { id: 1, name: '秒杀', action: 'goToSeckill' },
  { id: 2, name: '拼团', action: 'goToGroupBuy' },
  { id: 3, name: '新品', action: 'goToNewArrivals' },
  { id: 4, name: '优惠券', action: 'goToCoupons' },
  { id: 5, name: '会员', action: 'goToMember' },
  { id: 6, name: '积分', action: 'goToPoints' },
  { id: 7, name: '客服', action: 'goToService' },
  { id: 8, name: '设置', action: 'goToSettings' }
].map((link) => ({
  ...link,
  icon: '',
  iconFailed: false,
  iconLoaded: false,
  fallbackIcon: quickLinkFallbackIcons[link.action]
}))

const banners = ref([])
const bannersLoading = ref(false)
const quickLinks = ref([...defaultQuickLinks])
const quickLinksLoading = ref(false)
const quickLinksReady = ref(false)
const homeCategories = ref([{ id: 'recommend', name: '推荐' }])
const activeHomeCategory = ref('recommend')
const hotProducts = ref([])
const hotProductsLoading = ref(false)
const hotProductsLoadFailed = ref(false)
const promotions = ref([])
const leftColumnProducts = ref([])
const rightColumnProducts = ref([])
const scrollToken = ref(null)
const hasMore = ref(true)
const navBarHeight = ref(0)
const homeInitialized = ref(false)

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

function goToAbout() {
  uni.navigateTo({
    url: '/pages/profile/about'
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
    goToPointsMall,
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
  uni.navigateTo({ url: '/pages/profile/points' })
}

function goToPointsMall() {
  uni.navigateTo({ url: '/pages/points-mall/list' })
}

function goToService(link = {}) {
  const query = link.target ? `?shopId=${encodeURIComponent(link.target)}` : ''
  uni.navigateTo({
    url: `/pages/customer-service/index${query}`
  })
}

function goToSettings() {
  uni.navigateTo({
    url: '/pages/profile/settings'
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
  uni.navigateTo({ url: '/pages/group-buy/list' })
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

  const selectedCategory = homeCategories.value.find((item) => item.id === activeHomeCategory.value)
  const visibleProducts = activeHomeCategory.value === 'recommend'
    ? hotProducts.value
    : hotProducts.value.filter((product) => product.categoryName === selectedCategory?.name)

  visibleProducts.forEach((product, index) => {
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

  if (target === '/pages/group-buy/list') {
    return 'goToGroupBuy'
  }

  if (target === '/pages/points-mall/list') {
    return 'goToPointsMall'
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

function getQuickLinkTone(link) {
  const action = link.action
  if (action === 'goToSeckill') return 'seckill'
  if (action === 'goToGroupBuy') return 'group'
  if (action === 'goToCoupons' || action === 'goToCouponCenter') return 'coupon'
  if (action === 'goToPoints' || action === 'goToPointsMall') return 'points'
  if (action === 'goToNewArrivals') return 'new'
  return 'brand'
}

function handleDefaultQuickLink() {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

function handleQuickLinkIconError(link) {
  link.iconFailed = true
  link.iconLoaded = false
}

function handleQuickLinkIconLoad(link) {
  link.iconLoaded = true
}

function scheduleQuickLinkFallback(links) {
  links.forEach((link) => {
    if (!link.icon || link.iconLoaded) {
      return
    }
    const linkId = link.id
    const icon = link.icon
    setTimeout(() => {
      const currentLink = quickLinks.value.find((item) => item.id === linkId && item.icon === icon)
      if (currentLink && !currentLink.iconLoaded) {
        currentLink.iconFailed = true
      }
    }, 1500)
  })
}

function handleQuickLinkLongPress() {
  // 消费长按事件，避免小程序和 H5 显示原生选中高亮。
}

function handleProductImageError(product) {
  product.imageFailed = true
}

function createProductSubtitle(item) {
  const directSubtitle = item.subtitle || item.sellingPoint || item.brief
  if (directSubtitle) {
    return String(directSubtitle).trim()
  }

  const tags = item.tags || item.labelList || []
  if (tags.length) {
    return tags.slice(0, 2).join(' · ')
  }

  const detailText = String(item.detailDesc || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return detailText ? detailText.slice(0, 28) : '更多商品信息请查看详情'
}

function selectHomeCategory(category) {
  activeHomeCategory.value = category.id
  initWaterfall()
}

function syncHomeCategories() {
  const categoryNames = [...new Set(hotProducts.value
    .map((product) => product.categoryName)
    .filter(Boolean))]
  homeCategories.value = [
    { id: 'recommend', name: '推荐' },
    ...categoryNames.map((name) => ({ id: `category:${name}`, name }))
  ]
  if (!homeCategories.value.some((item) => item.id === activeHomeCategory.value)) {
    activeHomeCategory.value = 'recommend'
  }
}

function handleBannerImageError(banner) {
  banner.imageLoaded = false
  banner.imageFailed = true
}

function handleBannerImageLoad(banner) {
  banner.imageLoaded = true
  banner.imageFailed = false
}

function hasUsableBanner() {
  return banners.value.some((banner) => !banner.imageFailed)
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
  if (quickLinksLoading.value) {
    return Promise.resolve()
  }
  quickLinksLoading.value = true
  return new Promise((resolve) => {
    uni.request({
      url: `${BASE_API}/app/platQuickEntry/query`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const previousIconMap = new Map(quickLinks.value
            .filter((link) => link.icon)
            .map((link) => [link.icon, link]))
          const nextLinks = (res.data.data || []).slice(0, 10).map((link, index) => {
            const action = getActionForQuickLink(link.type, link.target)
            const icon = getStoragePreviewUrl(link.icon)
            const previousIcon = previousIconMap.get(icon)
            return {
              id: index + 1,
              name: link.name,
              icon,
              type: link.type,
              target: link.target,
              action,
              iconFailed: false,
              iconLoaded: previousIcon?.iconLoaded || false,
              fallbackIcon: quickLinkFallbackIcons[action] || quickLinkFallbackIcons.handleDefaultQuickLink
            }
          })
          quickLinks.value = nextLinks
          scheduleQuickLinkFallback(quickLinks.value)
          return
        }

        console.error('获取快捷入口失败:', res.data && res.data.message)
      },
      fail: (error) => {
        console.error('请求快捷入口失败:', error)
      },
      complete: () => {
        quickLinksLoading.value = false
        quickLinksReady.value = true
        resolve()
      }
    })
  })
}

function fetchBanners() {
  if (bannersLoading.value) {
    return Promise.resolve()
  }
  bannersLoading.value = true
  return new Promise((resolve) => {
    uni.request({
      url: `${BASE_API}/app/platBanner/query`,
      method: 'GET',
      header: createRequestHeader(),
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const previousBannerMap = new Map(banners.value.map((banner) => [banner.image, banner]))
          const nextBanners = (res.data.data || []).map((banner, index) => ({
            id: index + 1,
            image: getStoragePreviewUrl(banner.imageUrl),
            imageLoaded: previousBannerMap.get(getStoragePreviewUrl(banner.imageUrl))?.imageLoaded || false,
            imageFailed: false
          })).filter((banner) => banner.image)
          banners.value = nextBanners
          return
        }

        console.error('获取平台 Banner 失败:', res.data && res.data.message)
      },
      fail: (error) => {
        console.error('请求平台 Banner 失败:', error)
      },
      complete: () => {
        bannersLoading.value = false
        resolve()
      }
    })
  })
}

function fetchHotProducts(reset = false) {
  if ((!reset && !hasMore.value) || hotProductsLoading.value) {
    return Promise.resolve()
  }

  hotProductsLoading.value = true
  hotProductsLoadFailed.value = false
  const params = ['pageSize=10']
  if (!reset && scrollToken.value) {
    params.push(`scrollToken=${encodeURIComponent(scrollToken.value)}`)
  }

  return new Promise((resolve) => {
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
            price: Number(item.minPrice || 0).toFixed(2),
            sales: item.sales !== undefined ? item.sales : 0,
            categoryName: item.categoryName || '',
            tags: item.tags || item.labelList || [],
            subtitle: createProductSubtitle(item),
            image: getStoragePreviewUrl(item.mainImage),
            imageFailed: false
          }))

          const mergedProducts = reset
            ? productsWithDetails
            : [...hotProducts.value, ...productsWithDetails]
          hotProducts.value = [...new Map(mergedProducts.map((item) => [String(item.id), item])).values()]
          syncHomeCategories()
          initWaterfall()
          return
        }

        console.error('获取热门商品列表失败:', res.data && res.data.message)
        hotProductsLoadFailed.value = true
      },
      fail: (error) => {
        console.error('请求热门商品列表失败:', error)
        hotProductsLoadFailed.value = true
      },
      complete: () => {
        hotProductsLoading.value = false
        resolve()
      }
    })
  })
}

function retryHomeData() {
  if (!hasUsableBanner()) {
    fetchBanners()
  }
  if (!hotProducts.value.length) {
    fetchHotProducts(true)
  }
  fetchQuickLinks()
}

function handleNetworkStatusChange(status) {
  if (status.isConnected) {
    retryHomeData()
  }
}

onMounted(() => {
  fetchBanners()
  fetchQuickLinks()
  fetchHotProducts(true)
  homeInitialized.value = true
  uni.onNetworkStatusChange(handleNetworkStatusChange)
})

onShow(() => {
  if (homeInitialized.value && (!hasUsableBanner() || !hotProducts.value.length)) {
    retryHomeData()
  }
})

onPullDownRefresh(async () => {
  try {
    await Promise.all([fetchBanners(), fetchQuickLinks(), fetchHotProducts(true)])
  } finally {
    uni.stopPullDownRefresh()
  }
})

onReachBottom(() => {
  if (hasMore.value) {
    fetchHotProducts()
  }
})

onUnmounted(() => {
  uni.offNetworkStatusChange(handleNetworkStatusChange)
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

<style scoped>
.container {
  min-height: 100%;
  box-sizing: border-box;
  background: var(--ym-paper);
}

.banner-section {
  margin: 18rpx 24rpx 16rpx;
  overflow: hidden;
  border-radius: var(--ym-radius-card);
  background: #e6ebe8;
  box-shadow: none;
}

.banner-swiper {
  height: 360rpx;
  background: #e6ebe8;
}

.banner-placeholder {
  height: 360rpx;
  background: #e6ebe8;
}

.banner-image {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.banner-image.is-loaded {
  opacity: 1;
}

.quick-links {
  margin: 0;
  padding: 12rpx 18rpx 20rpx;
  border-radius: 0;
  background: var(--ym-paper);
  box-shadow: none;
}

.quick-link-row {
  margin-bottom: 0;
}

.quick-link-item {
  gap: 10rpx;
  margin-bottom: 10rpx;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.quick-link-item,
.quick-link-item view,
.quick-link-item text,
.quick-link-item image {
  -webkit-user-select: none;
  user-select: none;
}

.quick-link-icon-shell {
  position: relative;
  display: flex;
  width: 88rpx;
  height: 88rpx;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  border-radius: 24rpx;
  background: var(--ym-brand-soft);
  box-shadow: none;
}

.quick-link-icon {
  width: 48rpx;
  height: 48rpx;
  margin: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  transition: opacity 0.16s ease;
}

.quick-link-icon-skeleton {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: rgba(101, 114, 106, 0.14);
  transform: translate(-50%, -50%);
}

.quick-link-icon--fallback.is-hidden {
  opacity: 0;
}

.quick-link-icon--configured {
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
}

.quick-link-icon--configured.is-loaded {
  opacity: 1;
}

.quick-link-tone-seckill .quick-link-icon-shell {
  background: var(--ym-price-soft);
}

.quick-link-tone-group .quick-link-icon-shell {
  background: #e7f0f3;
}

.quick-link-tone-coupon .quick-link-icon-shell {
  background: #fbf0de;
}

.quick-link-tone-points .quick-link-icon-shell {
  background: #eeebf6;
}

.quick-link-tone-new .quick-link-icon-shell,
.quick-link-tone-brand .quick-link-icon-shell {
  background: var(--ym-brand-soft);
}


.quick-link-text {
  color: var(--ym-ink-secondary);
  font-size: 24rpx;
}

.section {
  margin: 0;
  background: var(--ym-surface);
}

.mall-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx 22rpx;
}

.mall-section-title-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.mall-section-mark {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  background: var(--ym-brand);
}

.mall-section-title {
  color: var(--ym-ink);
  font-size: 34rpx;
  font-weight: 700;
}

.mall-section-subtitle {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.home-category-scroll {
  width: 100%;
  box-sizing: border-box;
  padding: 0 24rpx 20rpx;
  white-space: nowrap;
}

.home-category-row {
  display: inline-flex;
  gap: 12rpx;
}

.home-category-item {
  min-width: 108rpx;
  height: 64rpx;
  box-sizing: border-box;
  padding: 0 22rpx;
  color: var(--ym-muted);
  border: 1rpx solid transparent;
  border-radius: var(--ym-radius-control);
  background: var(--ym-paper);
  font-size: 24rpx;
  line-height: 62rpx;
  text-align: center;
}

.home-category-item.active {
  color: var(--ym-brand);
  border-color: #bed1c6;
  background: var(--ym-brand-soft);
  font-weight: 700;
}

.waterfall-container {
  gap: 18rpx;
  min-height: 0;
  padding: 0 24rpx 32rpx;
}

.waterfall-column {
  width: calc(50% - 9rpx);
  margin: 0;
}

.product-item {
  margin-bottom: 18rpx;
  overflow: hidden;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  box-shadow: none;
}

.product-item:hover {
  transform: none;
  box-shadow: none;
}

.product-image-shell {
  width: 100%;
  height: 280rpx;
  overflow: hidden;
  border-bottom: 1rpx solid var(--ym-line);
  background: #edf1ee;
}

.product-image {
  display: block;
  width: 100%;
  height: 280rpx;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  background: #e6ebe8;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  display: block;
  overflow: hidden;
  margin-bottom: 10rpx;
  color: var(--ym-ink);
  font-size: 28rpx;
  line-height: 1.45;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.product-subtitle {
  display: block;
  overflow: hidden;
  min-height: 34rpx;
  color: var(--ym-muted);
  font-size: 22rpx;
  line-height: 34rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.product-price {
  color: var(--ym-price);
  font-size: 34rpx;
}

.product-sales {
  color: var(--ym-muted);
  font-size: 20rpx;
}

.home-product-state {
  display: flex;
  min-height: 260rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20rpx 24rpx 44rpx;
  color: var(--ym-muted);
  font-size: 24rpx;
}

.home-product-state-title {
  color: var(--ym-ink);
  font-size: 28rpx;
  font-weight: 700;
}

.home-product-state-hint {
  margin-top: 8rpx;
  color: var(--ym-muted);
  font-size: 22rpx;
}

.home-product-more {
  min-height: 64rpx;
  padding: 6rpx 24rpx 30rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
  line-height: 64rpx;
  text-align: center;
}
</style>
