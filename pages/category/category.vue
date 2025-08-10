<template>
	<view class="category-container">
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
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentPrimaryIndex: 0,
				currentSecondaryIndex: 0,
				primaryCategories: [],
				secondaryCategories: [],
				tertiaryScrollTop: 0
			}
		},
		computed: {
			
		},
		methods: {
			selectPrimaryCategory(index) {
				this.currentPrimaryIndex = index;
				// 根据选中的一级分类更新二级分类
				const selectedCategory = this.primaryCategories[index];
				this.secondaryCategories = selectedCategory.children || [];
				// 重置二级分类选中项
				this.currentSecondaryIndex = 0;
				// 滚动到第一个二级分类
				this.$nextTick(() => {
					this.scrollToSecondary(0);
				});
			},
			selectSecondaryCategory(index) {
				this.currentSecondaryIndex = index;
				// 滚动到选中的二级分类对应的三级分类部分
				this.$nextTick(() => {
					this.scrollToSecondary(index);
				});
			},
			scrollToSecondary(index) {
				// 滚动到指定的二级分类对应的三级分类部分
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					// 获取滚动容器的位置信息
					query.select('.tertiary-category').boundingClientRect();
					// 获取目标元素的位置信息
					query.select(`#secondarySection${index}`).boundingClientRect();
					
					query.exec((res) => {
						if (res[0] && res[1]) {
							const scrollViewRect = res[0];
							const targetRect = res[1];
							// 计算目标元素相对于滚动容器的偏移量
							const offsetTop = targetRect.top - scrollViewRect.top;
							this.tertiaryScrollTop = offsetTop;
						}
					});
				});
			},
			goToProductList(item) {
				// 跳转到商品列表页面，传递三级分类ID和名称，并将分类名称作为搜索关键词
				uni.navigateTo({
					url: `/pages/product/list?categoryId=${item.id}&categoryName=${item.name}&searchKeyword=${item.name}`
				});
			}
		},
		mounted() {
			// 从API获取分类数据
			import('/utils/api.js').then((api) => {
				api.fetchProductCategoryTree().then((data) => {
					this.primaryCategories = data;
					// 初始化二级分类数据
					if (this.primaryCategories.length > 0) {
						this.secondaryCategories = this.primaryCategories[0].children || [];
					}
				}).catch((error) => {
					console.error('Failed to fetch category data:', error);
				});
			});
		}
	}
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
