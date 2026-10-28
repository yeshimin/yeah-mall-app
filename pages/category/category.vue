<template>
	<view class="category-container">
		<view v-if="categoryLoading || primaryCategories.length === 0" class="category-state">
			<view class="category-state-mark">Y</view>
			<text class="category-state-title">{{ categoryLoading ? '分类加载中' : '暂无商品分类' }}</text>
			<text class="category-state-hint">{{ categoryLoading ? '正在整理商城分类，请稍候' : '分类配置完成后会显示在这里' }}</text>
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
			<scroll-view class="tertiary-category" scroll-y :scroll-top="tertiaryScrollTop" ref="tertiaryScrollView">
				<view class="tertiary-section" v-for="(secondary, sIndex) in secondaryCategories" :key="secondary.id" :id="'secondarySection' + sIndex" :ref="'secondarySection' + sIndex">
					<view class="secondary-title">{{ secondary.name }}</view>
					<view class="tertiary-grid">
						<view 
							class="tertiary-item" 
							v-for="(item, index) in secondary.children" 
							:key="item.id"
							@click="goToProductList(item)"
						>
							<image class="tertiary-icon" :src="item.icon || 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'"></image>
							<text class="tertiary-name">{{ item.name }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		</template>
	</view>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { fetchProductCategoryTree } from '../../utils/api.js'

const instance = getCurrentInstance()

const currentPrimaryIndex = ref(0)
const currentSecondaryIndex = ref(0)
const categoryLoading = ref(true)
const primaryCategories = ref([])
const secondaryCategories = ref([])
const tertiaryScrollTop = ref(0)

function selectPrimaryCategory(index) {
  currentPrimaryIndex.value = index
  const selectedCategory = primaryCategories.value[index]
  secondaryCategories.value = (selectedCategory && selectedCategory.children) || []
  currentSecondaryIndex.value = 0
  nextTick(() => {
    scrollToSecondary(0)
  })
}

function selectSecondaryCategory(index) {
  currentSecondaryIndex.value = index
  nextTick(() => {
    scrollToSecondary(index)
  })
}

function scrollToSecondary(index) {
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

function goToProductList(item) {
  uni.navigateTo({
    url: `/pages/product/list?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}&searchKeyword=${encodeURIComponent(item.name)}`
  })
}

function loadCategoryTree() {
  categoryLoading.value = true
  fetchProductCategoryTree()
    .then((data) => {
      primaryCategories.value = data || []
      if (primaryCategories.value.length > 0) {
        secondaryCategories.value = primaryCategories.value[0].children || []
      }
    })
    .catch((error) => {
      console.error('Failed to fetch category data:', error)
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
  background: var(--ym-paper);
}

.primary-item {
  position: relative;
  height: 96rpx;
  justify-content: flex-start;
  box-sizing: border-box;
  padding-left: 42rpx;
  color: var(--ym-muted);
  border-bottom: 0;
  font-size: 28rpx;
}

.primary-item.active {
  color: var(--ym-brand);
  border-left: 8rpx solid var(--ym-brand);
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
  border-bottom-color: var(--ym-line);
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
  margin: 0 8rpx;
  color: var(--ym-muted);
  font-size: 27rpx;
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
  margin-bottom: 12rpx;
}

.secondary-title {
  padding: 24rpx;
  color: var(--ym-ink);
  border-bottom-color: var(--ym-line);
  background: var(--ym-surface);
  font-size: 30rpx;
}

.tertiary-grid {
  gap: 12rpx 0;
  padding: 12rpx 16rpx 28rpx;
}

.tertiary-item {
  margin-bottom: 12rpx;
  padding: 8rpx;
  box-sizing: border-box;
}

.tertiary-icon {
  width: 116rpx;
  height: 116rpx;
  margin-bottom: 12rpx;
  border-radius: 20rpx;
  background: var(--ym-paper);
}

.tertiary-name {
  max-width: 150rpx;
  overflow: hidden;
  color: var(--ym-ink-secondary);
  font-size: 24rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
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
</style>
