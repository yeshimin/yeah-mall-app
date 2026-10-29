<template>
	<view class="category-container">
		<view v-if="categoryLoading || primaryCategories.length === 0" class="category-state">
			<view class="category-state-mark">Y</view>
			<text class="category-state-title">{{ categoryLoading ? '分类加载中' : categoryError ? '分类加载失败' : '暂无商品分类' }}</text>
			<text class="category-state-hint">{{ categoryLoading ? '正在整理商城分类，请稍候' : categoryError || '分类配置完成后会显示在这里' }}</text>
			<view v-if="categoryError" class="category-state-action" @click="loadCategoryTree">重新加载</view>
		</view>
		<template v-else>
		<!-- 一级分类 -->
		<scroll-view class="primary-category" scroll-y :showScrollbar="false">
			<view 
				class="primary-item" 
				:class="{ active: currentPrimaryIndex === index }"
				v-for="(item, index) in primaryCategories" 
				:key="item.id"
				@click="selectPrimaryCategory(index)"
			>
				{{ item.name }}
			</view>
		</scroll-view>
		
		<!-- 右侧区域 -->
		<view class="secondary-container">
			<template v-if="secondaryCategories.length">
			<!-- 二级分类 tab -->
			<view class="secondary-tabs-wrapper">
				<scroll-view 
					class="secondary-tabs" 
					scroll-x 
					:scroll-with-animation="true"
					:show-scrollbar="false"
					:enhanced="true"
				>
					<view class="secondary-tabs-content">
						<view 
							class="secondary-tab" 
							:class="{ active: currentSecondaryIndex === index }"
							v-for="(item, index) in secondaryCategories" 
							:key="item.id"
							@click="selectSecondaryCategory(index)"
						>
							{{ item.name }}
						</view>
					</view>
				</scroll-view>
			</view>
			
			<!-- 三级分类 -->
			<scroll-view class="tertiary-category" scroll-y scroll-with-animation :scroll-top="tertiaryScrollTop" @scroll="handleTertiaryScroll" ref="tertiaryScrollView">
				<view class="tertiary-section" v-for="(secondary, sIndex) in secondaryCategories" :key="secondary.id" :id="'secondarySection' + sIndex" :ref="'secondarySection' + sIndex">
					<view class="secondary-title">{{ secondary.name }}</view>
					<view v-if="secondary.children && secondary.children.length" class="tertiary-grid">
						<view 
							class="tertiary-item" 
							v-for="(item, index) in secondary.children" 
							:key="item.id"
							@click="goToProductList(item)"
						>
							<image v-if="item.image && !item.imageFailed" class="tertiary-icon" :src="item.image" mode="aspectFit" @error="handleCategoryImageError(item)"></image>
							<view v-else class="tertiary-icon-placeholder">{{ item.name.slice(0, 1) }}</view>
							<text class="tertiary-name">{{ item.name }}</text>
						</view>
					</view>
					<view v-else class="tertiary-empty">
						<text class="tertiary-empty-title">暂未配置子分类</text>
						<text class="tertiary-empty-hint">该分类下暂时没有可浏览内容</text>
					</view>
				</view>
			</scroll-view>
			</template>
			<view v-else class="secondary-empty-state">
				<text class="secondary-empty-title">暂未配置二级分类</text>
				<text class="secondary-empty-hint">该分类下暂无可浏览内容</text>
			</view>
		</view>
		</template>
	</view>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { fetchProductCategoryTree } from '../../utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const instance = getCurrentInstance()

const currentPrimaryIndex = ref(0)
const currentSecondaryIndex = ref(0)
const categoryLoading = ref(true)
const categoryError = ref('')
const primaryCategories = ref([])
const secondaryCategories = ref([])
const tertiaryScrollTop = ref(0)
const secondaryOffsets = ref([])

function selectPrimaryCategory(index) {
  currentPrimaryIndex.value = index
  const selectedCategory = primaryCategories.value[index]
  secondaryCategories.value = (selectedCategory && selectedCategory.children) || []
  currentSecondaryIndex.value = 0
	tertiaryScrollTop.value = 0
  nextTick(() => {
		updateSecondaryOffsets()
  })
}

function selectSecondaryCategory(index) {
  currentSecondaryIndex.value = index
  nextTick(() => {
    scrollToSecondary(index)
  })
}

function scrollToSecondary(index) {
	const targetOffset = secondaryOffsets.value[index]
	if (Number.isFinite(targetOffset)) {
		tertiaryScrollTop.value = targetOffset
		return
	}

  nextTick(() => {
    const query = uni.createSelectorQuery().in(instance?.proxy)
    query.select('.tertiary-category').boundingClientRect()
    query.select(`#secondarySection${index}`).boundingClientRect()

    query.exec((res) => {
      if (!res[0] || !res[1]) {
        return
      }

      tertiaryScrollTop.value = res[1].top - res[0].top
    })
  })
}

function updateSecondaryOffsets() {
	nextTick(() => {
		const query = uni.createSelectorQuery().in(instance?.proxy)
		query.selectAll('.tertiary-section').boundingClientRect()
		query.exec((res) => {
			const sections = res[0] || []
			if (!sections.length) {
				secondaryOffsets.value = []
				return
			}
			const firstTop = sections[0].top
			secondaryOffsets.value = sections.map((section) => Math.max(section.top - firstTop, 0))
		})
	})
}

function handleTertiaryScroll(event) {
	const scrollTop = event.detail.scrollTop || 0
	let activeIndex = 0
	secondaryOffsets.value.forEach((offset, index) => {
		if (scrollTop + 24 >= offset) {
			activeIndex = index
		}
	})
	currentSecondaryIndex.value = activeIndex
}

function goToProductList(item) {
  uni.navigateTo({
    url: `/pages/product/list?categoryName=${encodeURIComponent(item.name)}&searchKeyword=${encodeURIComponent(item.name)}`
  })
}

function handleCategoryImageError(item) {
	item.imageFailed = true
}

function resolveCategoryImages(nodes) {
	return (nodes || []).map((item) => ({
		...item,
		image: item.image ? getStoragePreviewUrl(item.image) : '',
		imageFailed: false,
		children: resolveCategoryImages(item.children),
	}))
}

function loadCategoryTree() {
  categoryLoading.value = true
  categoryError.value = ''
  fetchProductCategoryTree()
    .then((data) => {
      primaryCategories.value = resolveCategoryImages(data)
      if (primaryCategories.value.length > 0) {
        secondaryCategories.value = primaryCategories.value[0].children || []
			nextTick(() => {
				updateSecondaryOffsets()
			})
      }
    })
    .catch((error) => {
      console.error('Failed to fetch category data:', error)
      categoryError.value = error?.message || '请检查网络后重试'
    })
    .finally(() => {
      categoryLoading.value = false
    })
}

onMounted(() => {
  loadCategoryTree()
})
</script>

<style scoped>
	.category-container {
		display: flex;
		height: 100%;
		width: 100%;
		padding-top: var(--status-bar-height);
	}
	
	.primary-category {
		width: 20%;
		height: calc(100% - var(--status-bar-height));
		background-color: #f5f5f5;
	}
	
	.primary-item {
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		border-bottom: 1rpx solid #eee;
	}
	
	.primary-item.active {
		background-color: #fff;
		color: #ff0000;
		font-weight: bold;
		border-left: 8rpx solid #ff0000;
	}
	
	.secondary-container {
		flex: 1;
		height: calc(100% - var(--status-bar-height));
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.secondary-tabs-wrapper {
		/* height: 80rpx; */
		width: 100%;
		border-bottom: 1rpx solid #eee;
	}
	
	.secondary-tabs {
		width: 100%;
		height: 100%;
		white-space: nowrap;
	}
	
	.secondary-tabs-content {
		height: 100%;
		width: 0rpx; /* 设置任意值都行，不然左侧一级分类布局宽度会坍塌，原因未知 by yeshimin */
		white-space: nowrap;
		padding: 0 20rpx;
		/* 移除 flex 布局，使用默认布局 */
	}
	
	.secondary-tab {
		display: inline-block;
		min-width: 130rpx; /* 减小最小宽度 */
		height: 85rpx;
		line-height: 85rpx;
		font-size: 30rpx;
		position: relative;
		text-align: center; /* 文字居中 */
		margin-left: 12rpx; /* 减小左边距 */
		margin-right: 12rpx; /* 增加右边距，确保item之间有适当间距 */
	}
	
	.secondary-tab.active {
		color: #ff0000;
		font-weight: bold;
	}
	
	.secondary-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 50rpx;
		height: 6rpx;
		background-color: #ff0000;
		border-radius: 3rpx;
	}
	
	/* 隐藏滚动条 */
	::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
		background-color: transparent;
	}
	
	.tertiary-category {
		flex: 1;
		overflow: hidden;
	}
	
	.tertiary-section {
		margin-bottom: 30rpx;
	}
	
	.secondary-title {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-bottom: 1rpx solid #eee;
		color: #333;
	}
	
	.tertiary-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
		box-sizing: border-box;
	}
	
	.tertiary-item {
		width: 33.33%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 25rpx;
	}
	
	.tertiary-icon {
		width: 70rpx;
		height: 70rpx;
		margin-bottom: 8rpx;
	}
	
	.tertiary-name {
		font-size: 22rpx;
		color: #666;
	}
</style>

<style scoped>
.category-container {
  width: 100%;
  height: 100%;
  padding-top: 0;
  background: var(--ym-surface);
}

.primary-category {
  width: 176rpx;
  height: 100%;
  background: #eef2ef;
}

.primary-item {
  position: relative;
  height: 96rpx;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 12rpx;
  color: var(--ym-muted);
  border-bottom: 0;
  font-size: 28rpx;
  text-align: center;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.primary-item.active {
  color: var(--ym-brand);
  border-left: 6rpx solid var(--ym-brand);
  background: var(--ym-surface);
  font-weight: 700;
}

.secondary-container {
  width: calc(100% - 176rpx);
  height: 100%;
  background: var(--ym-surface);
}

.secondary-tabs-wrapper {
  height: 88rpx;
  border-bottom: 0;
}

.secondary-tabs-content {
  display: inline-flex;
  width: max-content;
  min-width: 100%;
  box-sizing: border-box;
  padding: 0 16rpx;
}

.secondary-tab {
  min-width: 128rpx;
  height: 88rpx;
  margin: 0 12rpx;
  color: var(--ym-muted);
  font-size: 26rpx;
  line-height: 88rpx;
}

.secondary-tab.active {
  color: var(--ym-brand);
}

.secondary-tab.active::after {
  width: 42rpx;
  height: 5rpx;
  border-radius: 3rpx;
  background: var(--ym-brand);
}

.tertiary-category {
  background: var(--ym-surface);
}

.tertiary-section {
  margin-bottom: 0;
}

.secondary-title {
  padding: 20rpx 24rpx 10rpx;
  color: var(--ym-ink);
  border: 0;
  background: transparent;
  font-size: 30rpx;
}

.tertiary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx 0;
  padding: 8rpx 16rpx 30rpx;
}

.tertiary-item {
  width: auto;
  margin: 0;
  padding: 4rpx;
  box-sizing: border-box;
}

.tertiary-icon {
  width: 128rpx;
  height: 96rpx;
  margin-bottom: 10rpx;
  border-radius: 0;
  background: transparent;
}

.tertiary-icon-placeholder {
  display: flex;
  width: 128rpx;
  height: 96rpx;
  align-items: center;
  justify-content: center;
  margin: 0 0 10rpx;
  color: var(--ym-brand);
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand-soft);
  font-size: 34rpx;
  font-weight: 700;
}

.tertiary-name {
  max-width: 160rpx;
  overflow: hidden;
  color: var(--ym-ink-secondary);
  font-size: 24rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tertiary-empty,
.secondary-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--ym-muted);
  text-align: center;
}

.tertiary-empty {
  min-height: 260rpx;
  padding-bottom: 24rpx;
}

.secondary-empty-state {
  flex: 1;
  min-height: 0;
}

.tertiary-empty-title,
.secondary-empty-title {
  color: var(--ym-ink);
  font-size: 26rpx;
  font-weight: 700;
}

.tertiary-empty-hint,
.secondary-empty-hint {
  margin-top: 8rpx;
  color: var(--ym-muted);
  font-size: 22rpx;
}

.category-state {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  padding: 40rpx;
  background: var(--ym-paper);
}

.category-state-mark {
  display: flex;
  width: 96rpx;
  height: 96rpx;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  color: #fff;
  border-radius: 24rpx;
  background: var(--ym-brand);
  font-size: 46rpx;
  font-weight: 700;
}

.category-state-title {
  color: var(--ym-ink);
  font-size: 30rpx;
  font-weight: 700;
}

.category-state-hint {
  margin-top: 10rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
}

.category-state-action {
  margin-top: 24rpx;
  padding: 14rpx 32rpx;
  border-radius: 999rpx;
  color: #fff;
  background: var(--ym-brand);
  font-size: 24rpx;
}
</style>
