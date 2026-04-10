<template>
	<view class="product-detail-container">
		<!-- 自定义标题栏组件 -->
		<custom-nav-bar 
			:show-back="true"
			:show-search="false"
			:title="''"
			:transparent="true"
			:background-color="'#ffffff'"
			:background-opacity="tabsOpacity"
			@height-calculated="handleNavBarHeightCalculated"
			@back="goBack"
		/>

		<view
			class="floating-section-tabs"
			:style="{
				top: `${navBarHeight}px`,
				opacity: tabsOpacity,
				pointerEvents: tabsOpacity > 0.1 ? 'auto' : 'none'
			}"
		>
			<view
				v-for="tab in detailTabs"
				:key="tab.key"
				class="floating-tab-item"
				:class="{ active: currentSection === tab.key }"
				@click="scrollToSection(tab.key)"
			>
				<text>{{ tab.label }}</text>
			</view>
		</view>
		
		<scroll-view
			class="detail-scroll"
			scroll-y
			scroll-with-animation
			:show-scrollbar="false"
			:scroll-into-view="scrollIntoView"
			@scroll="handleDetailScroll"
		>
			<view id="section-base" class="base-section">
			<!-- 商品图片轮播 -->
			<swiper class="product-swiper" indicator-dots autoplay>
				<swiper-item v-for="(banner, index) in banners" :key="index">
					<image class="swiper-image" :src="banner"></image>
				</swiper-item>
			</swiper>
			
			<!-- 价格区域 -->
			<view class="price-section">
				<text class="current-price">￥{{ product.minPrice }}</text>
				<text class="original-price">￥{{ product.maxPrice }}</text>
				<view class="sales-info">
					<text class="sales-count">销量: {{ product.sales }}</text>
					<text class="collect-count">收藏: 567</text>
				</view>
			</view>
			
			<!-- 商品名称区域 -->
			<view class="name-section">
				<text class="product-name">{{ product.name }}</text>
			</view>
			</view>
            
			<!-- 评价区域 -->
            <view id="section-review" class="review-section">
                <view class="review-header">
                    <view class="review-title">
                        <text class="title-text">评价 ({{ reviewSummary.totalCount }})</text>
                        <text class="good-rate">好评度 {{ reviewSummary.goodRate }}%</text>
                    </view>
                </view>
                
                <view class="review-list" v-if="reviewSummary.totalCount > 0">
                    <view class="review-item" v-for="(item, index) in reviewSummary.topReviews" :key="index">
                        <view class="rp-user">
                            <image :src="item.userAvatar || '/static/logo.png'" class="rp-avatar"></image>
                            <text class="rp-name">{{ item.userName }}</text>
                            <text class="rp-time">{{ item.createTime }}</text>
                        </view>
                        <view class="rp-content">
                            {{ item.content }}
                        </view>
                    </view>
                </view>
				<view v-else class="review-empty">
					<text>暂无评价内容</text>
				</view>
            </view>
			
			<!-- 商品详情介绍图文区域 -->
			<view id="section-detail" class="detail-section">
				<text class="section-title">商品详情</text>
				<view class="detail-content">
					<rich-text :nodes="product.detailDesc"></rich-text>
				</view>
				<view class="end-of-content">
					<text class="end-text">-- 已经到底了 --</text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="bar-item" @click="goToStore">
				<text class="icon">🏠</text>
				<text>店铺</text>
			</view>
			<view class="bar-item" @click="contactService">
				<text class="icon">💬</text>
				<text>客服</text>
			</view>
			<view class="bottom-bar-item" @click="addToFavorites">
							<text class="icon">{{ isCollected ? '❤️' : '🤍' }}</text>
							<text class="bottom-bar-text">{{ isCollected ? '已收藏' : '收藏' }}</text>
						</view>
			<view class="bar-item cart-item" @click="addToCart" v-if="scene !== 'seckill'">
				<text class="cart-text">加入购物车</text>
			</view>
			<view class="bar-item buy-item" @click="buyNow">
				<text class="buy-text">购买</text>
			</view>
		</view>
		
		<!-- 规格选择弹窗 -->
		<view class="spec-popup" v-if="showSpec" @click="closeSpecPopup">
			<view class="popup-content" @click.stop>
				<text class="close-btn" @click="closeSpecPopup">×</text>
				<view class="popup-header">
					<image class="popup-image" :src="banners[0] || 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'"></image>
					<view class="popup-info">
						<text class="popup-price">￥{{ getCurrentSkuInfo().price !== null ? getCurrentSkuInfo().price : '无价格' }}</text>
						<text class="popup-stock" v-if="getCurrentSkuInfo().stock > 0">库存: {{ getCurrentSkuInfo().stock }}件</text>
						<text class="popup-stock out-of-stock" v-else>无货</text>
						<text class="popup-spec" v-if="scene !== 'seckill'">已选: {{ getSelectedSpecDesc() }}</text>
						<text class="popup-spec" v-else>已选: {{ selectedSku ? selectedSku.name : '请选择规格' }}</text>
					</view>
				</view>
				
				<!-- 普通场景：规格选择 -->
				<view v-if="scene !== 'seckill'">
					<view class="spec-options" v-for="spec in specs" :key="spec.specId">
						<text class="spec-title">{{ spec.specName }}</text>
						<view class="spec-list">
							<view 
									class="spec-item" 
									:class="{ 
										active: selectedSpecs[spec.specId] === opt.optId,
										disabled: isOptionDisabled(spec.specId, opt.optId)
									}"
									v-for="opt in spec.opts" 
									:key="opt.optId"
									@click="selectSpecOption(spec.specId, opt.optId)"
								>
									{{ opt.optName }}
								</view>
						</view>
					</view>
				</view>
				
				<!-- 秒杀场景：直接展示SKU列表 -->
				<view v-else-if="scene === 'seckill'" class="sku-list">
					<text class="spec-title">选择规格</text>
					<view class="sku-items">
						<view 
							class="sku-item" 
							:class="{ active: selectedSku && selectedSku.id === sku.id }"
							v-for="sku in skus" 
							:key="sku.id"
							@click="selectSku(sku)"
						>
							<view class="sku-image-container">
								<image class="sku-image" :src="sku.mainImage || '/static/logo.png'"
								     style="width: 40px; height: 40px; border-radius: 4px;"></image>
							</view>
							<view class="sku-info">
						<text class="sku-name">{{ sku.name }}</text>
					</view>
						</view>
					</view>
				</view>
				
				<view class="quantity-selector" v-if="scene !== 'seckill'">
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="control-btn" @click="decreaseQuantity">-</text>
						<text class="quantity">{{ selectedQuantity }}</text>
						<text class="control-btn" @click="increaseQuantity">+</text>
					</view>
				</view>
				
				<!-- 秒杀场景：固定数量为1 -->
				<view class="quantity-selector" v-else>
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="quantity">1</text>
					</view>
				</view>
				<view class="confirm-btn" @click="confirmSpec">{{ scene === 'seckill' ? '秒杀' : '确定' }}</view>
			</view>
		</view>
		
		<!-- 购物车弹窗 -->
		<view class="cart-popup" v-if="showCartPopup" @click="closeCartPopup">
			<view class="popup-content" @click.stop>
				<text class="close-btn" @click="closeCartPopup">×</text>
				<view class="popup-header">
					<image class="popup-image" :src="banners[0] || 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'"></image>
					<view class="popup-info">
						<text class="popup-price">￥{{ getCurrentSkuInfo().price !== null ? getCurrentSkuInfo().price : '无价格' }}</text>
						<text class="popup-stock" v-if="getCurrentSkuInfo().stock > 0">库存: {{ getCurrentSkuInfo().stock }}件</text>
						<text class="popup-stock out-of-stock" v-else>无货</text>
						<text class="popup-spec" v-if="scene !== 'seckill'">已选: {{ getSelectedSpecDesc() }}</text>
						<text class="popup-spec" v-else>已选: {{ selectedSku ? selectedSku.name : '请选择规格' }}</text>
					</view>
				</view>
				
				<!-- 普通场景：规格选择 -->
				<view v-if="scene !== 'seckill'">
					<view class="spec-options" v-for="spec in specs" :key="spec.specId">
						<text class="spec-title">{{ spec.specName }}</text>
						<view class="spec-list">
							<view 
								class="spec-item" 
								:class="{ 
									active: selectedSpecs[spec.specId] === opt.optId,
									disabled: isOptionDisabled(spec.specId, opt.optId)
								}"
								v-for="opt in spec.opts" 
								:key="opt.optId"
								@click="selectSpecOption(spec.specId, opt.optId)"
							>
								{{ opt.optName }}
							</view>
						</view>
					</view>
				</view>
				
				<!-- 秒杀场景：直接展示SKU列表 -->
				<view v-else-if="scene === 'seckill'" class="sku-list">
					<text class="spec-title">选择规格</text>
					<view class="sku-items">
						<view 
							class="sku-item" 
							:class="{ active: selectedSku && selectedSku.id === sku.id }"
							v-for="sku in skus" 
							:key="sku.id"
							@click="selectSku(sku)"
						>
							<view class="sku-image-container">
								<image class="sku-image" :src="sku.mainImage || '/static/logo.png'"
								     style="width: 40px; height: 40px; border-radius: 4px;"></image>
							</view>
							<view class="sku-info">
						<text class="sku-name">{{ sku.name }}</text>
					</view>
						</view>
					</view>
				</view>
				
				<view class="quantity-selector" v-if="scene !== 'seckill'">
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="control-btn" @click="decreaseQuantity">-</text>
						<text class="quantity">{{ selectedQuantity }}</text>
						<text class="control-btn" @click="increaseQuantity">+</text>
					</view>
				</view>
				
				<!-- 秒杀场景：固定数量为1 -->
				<view class="quantity-selector" v-else>
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="quantity">1</text>
					</view>
				</view>
				<view class="confirm-btn" @click="confirmAddToCart">{{ purchaseMode === 'buy' ? '立即购买' : '加入购物车' }}</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import CustomNavBar from '../../components/custom-nav-bar.vue'
import { fetchReviewSummary } from '@/utils/api.js'
import { authRequest, getToken, getUserId, handleAuthFailure } from '@/utils/auth.js'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'

const instance = getCurrentInstance()

const showSpec = ref(false)
const showCartPopup = ref(false)
const purchaseMode = ref('cart')
const product = ref({})
const banners = ref([])
const specs = ref([])
const skuOptIds = ref([])
const skus = ref([])
const selectedSpecs = reactive({})
const selectedSku = ref(null)
const isCollected = ref(false)
const selectedQuantity = ref(1)
const reviewSummary = reactive({
  totalCount: 0,
  goodRate: 100,
  topReviews: []
})
const shop = ref({})
const scene = ref('')
const activityBeginTime = ref('')
const activityEndTime = ref('')
const activityId = ref('')
const navBarHeight = ref(0)
const scrollIntoView = ref('')
const currentSection = ref('base')
const detailScrollTop = ref(0)
const sectionOffsets = reactive({
  base: 0,
  review: 0,
  detail: 0
})

const detailTabs = [
  { key: 'base', label: '宝贝' },
  { key: 'review', label: '评价' },
  { key: 'detail', label: '详情' }
]

const tabsOpacity = computed(() => {
  const start = 80
  const end = 220
  const progress = (detailScrollTop.value - start) / (end - start)
  return Math.max(0, Math.min(progress, 1))
})

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

function buildAuthHeader() {
  const header = {
    'Content-Type': 'application/json'
  }
  const token = getToken()

  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  return header
}

function processRichText(html) {
  if (!html) return ''

  html = html.replace(/<img/gi, '<img style="max-width:100%;height:auto;width:100%;display:block;"')
  html = html.replace(/<p/gi, '<p style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<div/gi, '<div style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<span/gi, '<span style="max-width:100%;word-break:break-word;overflow-wrap:break-word;"')
  html = html.replace(/<h1/gi, '<h1 style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<h2/gi, '<h2 style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<h3/gi, '<h3 style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<h4/gi, '<h4 style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<h5/gi, '<h5 style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<h6/gi, '<h6 style="max-width:100%;word-break:break-word;overflow-wrap:break-word;line-height:1.5;"')
  html = html.replace(/<table/gi, '<table style="max-width:100%;width:100%;table-layout:fixed;"')
  html = html.replace(/<td/gi, '<td style="word-break:break-word;overflow-wrap:break-word;padding:8px;font-size:12px;"')
  html = html.replace(/<th/gi, '<th style="word-break:break-word;overflow-wrap:break-word;padding:8px;font-size:12px;"')
  html = html.replace(/<pre/gi, '<pre style="max-width:100%;word-break:break-word;overflow-wrap:break-word;font-size:12px;"')
  html = html.replace(/<code/gi, '<code style="max-width:100%;word-break:break-word;overflow-wrap:break-word;font-size:12px;"')

  return html
}

function goBack() {
  uni.navigateBack()
}

function handleNavBarHeightCalculated(event) {
  navBarHeight.value = event.plusHeight
  nextTick(() => {
    measureSections()
  })
}

async function loadReviewSummary(productId) {
  try {
    const data = await fetchReviewSummary(productId)
    reviewSummary.totalCount = data.totalCount || 0
    reviewSummary.goodRate = data.goodRate || 0
    reviewSummary.topReviews = data.topReviews || []
    nextTick(() => {
      measureSections()
    })
  } catch (error) {
    console.error('获取商品评价概览失败:', error)
  }
}

function measureSections() {
  const query = uni.createSelectorQuery().in(instance?.proxy)
  query.select('.detail-scroll').boundingClientRect()
  query.select('#section-base').boundingClientRect()
  query.select('#section-review').boundingClientRect()
  query.select('#section-detail').boundingClientRect()
  query.exec((res) => {
    const scrollRect = res[0]
    const baseRect = res[1]
    const reviewRect = res[2]
    const detailRect = res[3]

    if (!scrollRect || !baseRect || !reviewRect || !detailRect) {
      return
    }

    sectionOffsets.base = baseRect.top - scrollRect.top + detailScrollTop.value
    sectionOffsets.review = reviewRect.top - scrollRect.top + detailScrollTop.value
    sectionOffsets.detail = detailRect.top - scrollRect.top + detailScrollTop.value
    updateCurrentSection(detailScrollTop.value)
  })
}

function updateCurrentSection(scrollTop) {
  const marker = scrollTop + navBarHeight.value + 90
  if (marker >= sectionOffsets.detail - 20) {
    currentSection.value = 'detail'
  } else if (marker >= sectionOffsets.review - 20) {
    currentSection.value = 'review'
  } else {
    currentSection.value = 'base'
  }
}

function handleDetailScroll(event) {
  detailScrollTop.value = event.detail.scrollTop || 0
  updateCurrentSection(detailScrollTop.value)
}

function scrollToSection(sectionKey) {
  currentSection.value = sectionKey
  scrollIntoView.value = `section-${sectionKey}`
  setTimeout(() => {
    scrollIntoView.value = ''
  }, 300)
}

function initSelectedSpecs() {
  Object.keys(selectedSpecs).forEach((key) => {
    delete selectedSpecs[key]
  })

  specs.value.forEach((spec) => {
    if (spec.opts && spec.opts.length > 0) {
      selectedSpecs[spec.specId] = spec.opts[0].optId
    }
  })
}

async function fetchProductDetail(productId, sceneValue) {
  const url = sceneValue === 'seckill'
    ? `${BASE_API}/app/seckill/queryProductDetail?id=${productId}`
    : `${BASE_API}/app/product/detail?id=${productId}`

  try {
    const res = await request({
      url,
      method: 'GET',
      header: buildAuthHeader()
    })

    if (res.statusCode !== 200 || res.data.code !== 0) {
      console.error('获取商品详情失败:', res.data && res.data.message)
      return
    }

    const data = res.data.data || {}
    product.value = data.product || {}

    if (product.value.detailDesc) {
      product.value.detailDesc = processRichText(product.value.detailDesc)
    }

    banners.value = (data.banners || []).map((item) => getStoragePreviewUrl(item)).filter(Boolean)
    specs.value = data.specs || []
    skuOptIds.value = data.skuOptIds || []
    skus.value = (data.skus || []).map((sku) => ({
      ...sku,
      mainImage: getStoragePreviewUrl(sku.mainImage)
    }))
    shop.value = data.shop || {}
    selectedSku.value = null
    selectedQuantity.value = 1

    initSelectedSpecs()

    if (product.value.id) {
      checkCollectStatus()
      loadReviewSummary(product.value.id)
    }

    nextTick(() => {
      measureSections()
    })
  } catch (error) {
    console.error('请求商品详情失败:', error)
  }
}

function goToStore() {
  if (shop.value && shop.value.shopId) {
    uni.navigateTo({
      url: `/pages/shop/detail?shopId=${shop.value.shopId}&shopName=${encodeURIComponent(shop.value.shopName || '店铺')}`
    })
    return
  }

  uni.showToast({
    title: '暂无店铺信息',
    icon: 'none'
  })
}

async function contactService() {
  const token = getToken()
  if (!token) {
    handleAuthFailure()
    return
  }

  const shopId = shop.value.shopId || '1'
  const mchId = shop.value.mchId || '1'

  uni.showLoading({ title: '初始化会话...' })
  try {
    const res = await request({
      url: `${BASE_API}/app/csConversation/init`,
      method: 'POST',
      header: buildAuthHeader(),
      data: {
        shopId
      }
    })

    uni.hideLoading()
    if (res.statusCode === 200 && res.data.code === 0) {
      const conversationId = res.data.data.id
      uni.navigateTo({
        url: `/pages/customer-service/index?shopId=${shopId}&mchId=${mchId}&conversationId=${conversationId}`
      })
      return
    }

    console.error('初始化会话失败:', res.data && res.data.message)
    uni.showToast({
      title: '初始化会话失败，请重试',
      icon: 'none'
    })
  } catch (error) {
    uni.hideLoading()
    console.error('请求初始化会话失败:', error)
    uni.showToast({
      title: '网络错误，请检查网络连接',
      icon: 'none'
    })
  }
}

function closeSpecPopup() {
  showSpec.value = false
}

function closeCartPopup() {
  showCartPopup.value = false
}

function hasCompleteSpecSelection() {
  if (scene.value === 'seckill') {
    return !!selectedSku.value
  }

  return specs.value.every((spec) => selectedSpecs[spec.specId] !== undefined)
}

function validateCurrentSelection() {
  if (scene.value === 'seckill' && !isWithinActivityTime()) {
    uni.showToast({
      title: '当前不在秒杀活动时间范围内',
      icon: 'none'
    })
    return false
  }

  if (!hasCompleteSpecSelection()) {
    uni.showToast({
      title: scene.value === 'seckill' ? '请选择商品规格' : '请选择完整的规格',
      icon: 'none'
    })
    return false
  }

  const currentSkuInfo = getCurrentSkuInfo()
  if (!currentSkuInfo.id) {
    uni.showToast({
      title: '未找到有效的商品规格',
      icon: 'none'
    })
    return false
  }

  if (scene.value !== 'seckill' && selectedQuantity.value > currentSkuInfo.stock) {
    uni.showToast({
      title: '购买数量超过库存',
      icon: 'none'
    })
    return false
  }

  return true
}

function addToCart() {
  if (scene.value === 'seckill' && !isWithinActivityTime()) {
    uni.showToast({
      title: '当前不在秒杀活动时间范围内',
      icon: 'none'
    })
    return
  }

  purchaseMode.value = 'cart'
  showCartPopup.value = true
}

function navigateToOrderConfirm(skuId, quantity, previewData) {
  const params = [
    `skuId=${skuId}`,
    `quantity=${quantity}`
  ]

  if (previewData) {
    params.push(`orderPreview=${encodeURIComponent(JSON.stringify(previewData))}`)
    params.push(`scene=${scene.value}`)
  }

  uni.navigateTo({
    url: `/pages/order/confirm?${params.join('&')}`
  })
}

async function requestSeckillPreview(skuId, quantity) {
  const res = await request({
    url: `${BASE_API}/app/order/previewForSeckill`,
    method: 'POST',
    header: buildAuthHeader(),
    data: {
      items: [{
        skuId,
        quantity
      }]
    }
  })

  if (res.statusCode === 200 && res.data.code === 0) {
    return res.data.data
  }

  throw new Error((res.data && res.data.message) || '获取订单信息失败')
}

async function requestSeckillOrder(skuId) {
  const res = await request({
    url: `${BASE_API}/app/order/seckill`,
    method: 'POST',
    header: buildAuthHeader(),
    data: {
      skuId,
      activityId: activityId.value || ''
    }
  })

  if (res.statusCode === 200 && res.data.code === 0 && res.data.data && res.data.data.success) {
    return res.data.data
  }

  throw new Error((res.data && res.data.data && res.data.data.message) || (res.data && res.data.message) || '秒杀失败')
}

async function confirmAddToCart() {
  if (!validateCurrentSelection()) {
    return
  }

  const currentSkuInfo = getCurrentSkuInfo()
  const quantity = scene.value === 'seckill' ? 1 : selectedQuantity.value

  if (purchaseMode.value === 'buy') {
    closeCartPopup()
    navigateToOrderConfirm(currentSkuInfo.id, quantity)
    return
  }

  authRequest({
    url: `${BASE_API}/app/cartItem/create`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      skuId: currentSkuInfo.id,
      quantity
    }
  }, (res) => {
    if (res.data.code === 0) {
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success'
      })
      closeCartPopup()
      return
    }

    uni.showToast({
      title: res.data.message || '添加购物车失败',
      icon: 'none'
    })
  }, (error) => {
    console.error('加入购物车请求失败:', error)
    uni.showToast({
      title: '请求失败，请稍后重试',
      icon: 'none'
    })
  })
}

function buyNow() {
  purchaseMode.value = 'buy'
  showSpec.value = true
}

function addToFavorites() {
  const userId = getUserId()
  if (!userId) {
    handleAuthFailure()
    return
  }

  if (isCollected.value) {
    cancelCollect()
  } else {
    addCollect()
  }
}

function addCollect() {
  authRequest({
    url: `${BASE_API}/app/productFavorites/add`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      id: product.value.id
    }
  }, (res) => {
    if (res.data.code === 0 && res.data.data && res.data.data.success) {
      isCollected.value = true
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      })
      return
    }

    if (res.data.code === 401) {
      handleAuthFailure()
      return
    }

    uni.showToast({
      title: res.data.message || '收藏失败',
      icon: 'none'
    })
  }, (error) => {
    console.error('收藏失败', error)
    uni.showToast({
      title: '收藏失败',
      icon: 'none'
    })
  })
}

function cancelCollect() {
  authRequest({
    url: `${BASE_API}/app/productFavorites/remove`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      id: product.value.id
    }
  }, (res) => {
    if (res.data.code === 0 && res.data.data && res.data.data.success) {
      isCollected.value = false
      uni.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
      return
    }

    if (res.data.code === 401) {
      handleAuthFailure()
      return
    }

    uni.showToast({
      title: res.data.message || '取消收藏失败',
      icon: 'none'
    })
  }, (error) => {
    console.error('取消收藏失败', error)
    uni.showToast({
      title: '取消收藏失败',
      icon: 'none'
    })
  })
}

function checkCollectStatus() {
  if (!getUserId() || !product.value.id) {
    return
  }

  authRequest({
    url: `${BASE_API}/app/productFavorites/status?spuId=${product.value.id}`,
    method: 'GET'
  }, (res) => {
    if (res.statusCode === 200 && res.data.code === 0) {
      isCollected.value = !!res.data.data.result
    } else if (res.statusCode === 401) {
      handleAuthFailure()
    } else {
      console.error('检查收藏状态失败:', res.data && res.data.message)
    }
  }, (error) => {
    console.error('检查收藏状态请求失败:', error)
  })
}

function selectSpecOption(specId, optId) {
  if (selectedSpecs[specId] === optId) {
    delete selectedSpecs[specId]
    return
  }

  selectedSpecs[specId] = optId
}

function selectSku(sku) {
  selectedSku.value = sku
}

function isWithinActivityTime() {
  if (scene.value !== 'seckill') {
    return true
  }

  if (!activityBeginTime.value || !activityEndTime.value) {
    return true
  }

  const beginTime = new Date(activityBeginTime.value)
  const endTime = new Date(activityEndTime.value)
  if (Number.isNaN(beginTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return true
  }

  const now = new Date()
  return now >= beginTime && now <= endTime
}

function getSelectedSpecDesc() {
  const selected = []
  specs.value.forEach((spec) => {
    const selectedOptId = selectedSpecs[spec.specId]
    if (!selectedOptId) {
      return
    }

    const selectedOpt = (spec.opts || []).find((opt) => opt.optId === selectedOptId)
    if (selectedOpt) {
      selected.push(`${spec.specName}:${selectedOpt.optName}`)
    }
  })

  return selected.join(' ')
}

function getCurrentSkuInfo() {
  if (scene.value === 'seckill') {
    if (!selectedSku.value) {
      return { id: null, price: null, stock: 0 }
    }

    return {
      id: selectedSku.value.id,
      price: selectedSku.value.price,
      stock: selectedSku.value.stock
    }
  }

  const selectedOptIds = Object.values(selectedSpecs).filter(Boolean).map((id) => id.toString()).sort()
  if (!Array.isArray(skus.value)) {
    return { id: null, price: null, stock: 0 }
  }

  const matchedSku = skus.value.find((sku) => {
    if (!sku.specCode) {
      return false
    }

    const skuOptIdsSorted = sku.specCode.split('-').sort()
    return selectedOptIds.length === skuOptIdsSorted.length && selectedOptIds.every((id) => skuOptIdsSorted.includes(id))
  })

  if (!matchedSku) {
    return { id: null, price: null, stock: 0 }
  }

  return {
    id: matchedSku.id,
    price: matchedSku.price,
    stock: matchedSku.stock
  }
}

function isOptionDisabled(specId, optId) {
  if (scene.value === 'seckill') {
    return false
  }

  const tempSelectedSpecs = { ...selectedSpecs, [specId]: optId }
  const selectedOptIds = Object.values(tempSelectedSpecs).filter(Boolean).map((id) => id.toString()).sort()

  if (!Array.isArray(skus.value) || skus.value.length === 0) {
    return false
  }

  const hasMatchingSku = skus.value.some((sku) => {
    if (!sku.specCode) {
      return false
    }

    const skuOptIdsSorted = sku.specCode.split('-').sort()
    return selectedOptIds.every((id) => skuOptIdsSorted.includes(id))
  })

  return !hasMatchingSku
}

function decreaseQuantity() {
  if (selectedQuantity.value > 1) {
    selectedQuantity.value -= 1
  }
}

function increaseQuantity() {
  const currentStock = getCurrentSkuInfo().stock
  if (selectedQuantity.value < currentStock) {
    selectedQuantity.value += 1
  }
}

async function confirmSpec() {
  if (!validateCurrentSelection()) {
    return
  }

  const currentSkuInfo = getCurrentSkuInfo()
  const quantity = scene.value === 'seckill' ? 1 : selectedQuantity.value

  closeSpecPopup()

  if (purchaseMode.value !== 'buy') {
    uni.showToast({
      title: '已选择规格',
      icon: 'success'
    })
    return
  }

  if (scene.value === 'seckill') {
    uni.showLoading({ title: '正在抢购...' })
    try {
      await requestSeckillOrder(currentSkuInfo.id)
      uni.showLoading({ title: '加载订单信息...' })
      const previewData = await requestSeckillPreview(currentSkuInfo.id, quantity)
      uni.hideLoading()
      navigateToOrderConfirm(currentSkuInfo.id, quantity, previewData)
    } catch (error) {
      uni.hideLoading()
      console.error('秒杀流程失败:', error)
      uni.showToast({
        title: error.message || '秒杀失败',
        icon: 'none'
      })
    }
    return
  }

  navigateToOrderConfirm(currentSkuInfo.id, quantity)
}

onLoad((options = {}) => {
  const productId = options.productId || options.id
  const sceneValue = options.scene || ''
  scene.value = sceneValue

  if (sceneValue === 'seckill') {
    activityBeginTime.value = options.activityBeginTime ? decodeURIComponent(options.activityBeginTime) : ''
    activityEndTime.value = options.activityEndTime ? decodeURIComponent(options.activityEndTime) : ''
    activityId.value = options.activityId || ''
  }

  fetchProductDetail(productId, sceneValue)
})

onReady(() => {
  nextTick(() => {
    measureSections()
  })
})
</script>

<style scoped>
	.product-detail-container {
		height: 100vh;
		position: relative;
	}

	.floating-section-tabs {
		position: fixed;
		left: 0;
		right: 0;
		z-index: 120;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 24rpx;
		background-color: rgba(255, 255, 255, 0.96);
		border-bottom: 1rpx solid #f1f1f1;
		transition: opacity 0.2s ease;
	}

	.floating-tab-item {
		position: relative;
		padding: 10rpx 28rpx 14rpx;
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}

	.floating-tab-item.active {
		color: #111;
		font-weight: 600;
	}

	.floating-tab-item.active::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: 42rpx;
		height: 4rpx;
		border-radius: 999rpx;
		background-color: #111;
	}
	
	.detail-scroll {
		height: 100vh;
		margin-bottom: 100rpx;
		padding-top: 0;
	}

	.base-section {
		background-color: #fff;
	}
	
	.product-swiper {
		height: 500rpx;
	}
	
	.swiper-image {
		width: 100%;
		height: 100%;
	}
	
	.price-section {
		padding: 20rpx;
		background-color: #fff;
	}
	
	.current-price {
		font-size: 40rpx;
		color: #ff0000;
		font-weight: bold;
		margin-right: 20rpx;
	}
	
	.original-price {
		font-size: 28rpx;
		color: #888;
		text-decoration: line-through;
	}
	
	.sales-info {
		display: flex;
		margin-top: 10rpx;
	}
	
	.sales-count, .collect-count {
		font-size: 24rpx;
		color: #888;
		margin-right: 20rpx;
	}
	
	.name-section {
		padding: 20rpx;
		background-color: #fff;
	}
	
	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 0;
	}
    
    .review-section {
        margin-top: 20rpx;
        padding: 20rpx;
        background-color: #fff;
    }
    
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;
    }
    
    .review-title {
        display: flex;
        align-items: center;
    }
    
    .title-text {
        font-size: 30rpx;
        font-weight: bold;
        margin-right: 20rpx;
    }
    
    .good-rate {
        font-size: 24rpx;
        color: #ff5000;
        background-color: #fff1eb;
        padding: 2rpx 10rpx;
        border-radius: 20rpx;
    }
    
    .review-more {
        font-size: 24rpx;
        color: #999;
        display: flex;
        align-items: center;
    }
    
    .arrow {
        margin-left: 6rpx;
    }
    
    .rp-user {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
    }
    
    .rp-avatar {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        margin-right: 10rpx;
        background-color: #eee;
    }
    
    .rp-name {
        font-size: 24rpx;
        color: #666;
    }
    
    .rp-content {
        font-size: 26rpx;
        color: #333;
        line-height: 1.4;
    }

	.review-empty {
		padding: 20rpx 0 10rpx;
		font-size: 26rpx;
		color: #999;
	}
    
    .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
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
		width: 100%;
		padding: 0 20rpx;
		box-sizing: border-box;
	}
	
	.detail-content rich-text {
		width: 100%;
	}
	
	.detail-image {
		width: 100%;
		height: 400rpx;
		margin-bottom: 20rpx;
	}
	
	.detail-text {
		font-size: 28rpx;
		line-height: 40rpx;
		margin-bottom: 20rpx;
		padding: 0 20rpx;
	}
	
	.end-of-content {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx 0;
	}
	
	.end-text {
		font-size: 24rpx;
		color: #888;
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
		z-index: 100;
	}
	
	.bar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.cart-item {
		flex: 2;
		background-color: #ff9900;
		color: #fff;
	}
	
	.buy-item {
		flex: 2;
		background-color: #ff0000;
		color: #fff;
	}
	
	.icon {
		font-size: 40rpx;
		margin-bottom: 5rpx;
	}
	
	.cart-text, .buy-text {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.buy-text {
		color: #fff;
	}
	
	.spec-popup, .cart-popup {
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
	
	.popup-stock {
		font-size: 24rpx;
		color: #333;
	}
	
	.popup-stock.out-of-stock {
		color: #ff0000;
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
	
	.spec-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: #e0e0e0; /* 加深的灰色背景 */
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
			
			/* 秒杀场景下的SKU列表样式 */
			.sku-list {
				margin-bottom: 30rpx;
			}
			
			.sku-items {
				display: flex;
				flex-direction: column;
				gap: 15rpx;
			}
			
			.sku-item {
				display: flex;
				padding: 20rpx;
				border: 1rpx solid #eee;
				border-radius: 10rpx;
				align-items: center;
			}
			
			.sku-item.active {
				border-color: #ff0000;
				background-color: #fff5f5;
			}
			
			.sku-image-container {
				margin-right: 20rpx;
			}
			
			.sku-image {
				width: 120rpx;
				height: 120rpx;
				border-radius: 8rpx;
			}
			
			.sku-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 10rpx;
			}
			
			.sku-name {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
			}
			
			.sku-price {
				font-size: 32rpx;
				color: #ff0000;
				font-weight: bold;
			}
			
			.sku-stock {
				font-size: 24rpx;
				color: #888;
			}
			
			.sku-stock.out-of-stock {
				color: #ff0000;
			}
</style>
