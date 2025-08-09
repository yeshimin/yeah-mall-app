<template>
	<view class="category-container">
		<!-- 一级分类 -->
		<scroll-view class="primary-category" scroll-y :showScrollbar="false">
			<view 
				class="primary-item" 
				:class="{ active: currentPrimaryIndex === index }"
				v-for="(item, index) in primaryCategories" 
				:key="index"
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
							:key="index"
							@click="selectSecondaryCategory(index)"
						>
							{{ item.name }}
						</view>
					</view>
				</scroll-view>
			</view>
			
			<!-- 三级分类 -->
			<scroll-view class="tertiary-category" scroll-y>
				<view class="tertiary-grid">
					<view 
						class="tertiary-item" 
						v-for="(item, index) in tertiaryCategories" 
						:key="index"
						@click="goToProductList(item)"
					>
						<image class="tertiary-icon" :src="item.icon"></image>
						<text class="tertiary-name">{{ item.name }}</text>
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
				primaryCategories: [
					{ id: 1, name: '服装' },
					{ id: 2, name: '电子产品' },
					{ id: 3, name: '家居' },
					{ id: 4, name: '美妆' },
					{ id: 5, name: '食品' },
					{ id: 114, name: '美妆' },
					{ id: 224, name: '美妆' },
					{ id: 334, name: '美妆' },
					{ id: 444, name: '美妆' },
					{ id: 554, name: '美妆' },
					{ id: 664, name: '美妆' },
					{ id: 774, name: '美妆' },
					{ id: 884, name: '美妆' },
					{ id: 994, name: '美妆' },
					{ id: 914, name: '美妆' },
					{ id: 924, name: '美妆' }
				],
				// 二级分类数据，按一级分类ID分组
				secondaryCategoriesData: {
					1: [
						{ id: 11, name: '男装' },
						{ id: 12, name: '女装' },
						{ id: 13, name: '童装' },
						{ id: 14, name: '内衣' },
						{ id: 15, name: '运动装' },
						{ id: 115, name: '运动装2' },
						{ id: 215, name: '运动装3' },
						{ id: 315, name: '运动装4' }
					],
					2: [
						{ id: 21, name: '手机' },
						{ id: 22, name: '电脑' },
						{ id: 23, name: '耳机' },
						{ id: 24, name: '相机' }
					],
					3: [
						{ id: 31, name: '家具' },
						{ id: 32, name: '厨具' },
						{ id: 33, name: '装饰' }
					],
					4: [
						{ id: 41, name: '护肤品' },
						{ id: 42, name: '彩妆' },
						{ id: 43, name: '香水' }
					],
					5: [
						{ id: 51, name: '零食' },
						{ id: 52, name: '饮料' },
						{ id: 53, name: '生鲜' }
					]
				},
				secondaryCategories: [],
				// 三级分类数据，按二级分类ID分组
				tertiaryCategoriesData: {
					11: [
						{ id: 111, name: 'T恤', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 112, name: '衬衫', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 113, name: '裤子', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					12: [
						{ id: 121, name: '连衣裙', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 122, name: '半身裙', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 123, name: '外套', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					13: [
						{ id: 131, name: '上衣', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 132, name: '裤子', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 133, name: '鞋子', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					14: [
						{ id: 141, name: '文胸', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 142, name: '内裤', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					15: [
						{ id: 151, name: '运动鞋', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 152, name: '运动服', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					115: [
						{ id: 1151, name: '跑步装备', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 1152, name: '健身器材', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					215: [
						{ id: 2151, name: '户外装备', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 2152, name: '骑行用品', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					315: [
						{ id: 3151, name: '球类运动', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 3152, name: '游泳用品', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					21: [
						{ id: 211, name: '智能手机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 212, name: '功能手机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					22: [
						{ id: 221, name: '笔记本电脑', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 222, name: '台式电脑', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					23: [
						{ id: 231, name: '有线耳机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 232, name: '无线耳机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					24: [
						{ id: 241, name: '单反相机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 242, name: '微单相机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					31: [
						{ id: 311, name: '沙发', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 312, name: '床', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					32: [
						{ id: 321, name: '锅具', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 322, name: '餐具', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					33: [
						{ id: 331, name: '壁画', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 332, name: '摆件', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					41: [
						{ id: 411, name: '面霜', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 412, name: '精华', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					42: [
						{ id: 421, name: '口红', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 422, name: '粉底', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					43: [
						{ id: 431, name: '淡香水', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 432, name: '浓香水', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					51: [
						{ id: 511, name: '坚果', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 512, name: '糖果', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					52: [
						{ id: 521, name: '碳酸饮料', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 522, name: '果汁', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					53: [
						{ id: 531, name: '蔬菜', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 532, name: '水果', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					]
				},
				tertiaryCategories: []
			}
		},
		computed: {
			
		},
		methods: {
			selectPrimaryCategory(index) {
				this.currentPrimaryIndex = index;
				// 根据选中的一级分类更新二级分类
				const primaryId = this.primaryCategories[index].id;
				this.secondaryCategories = this.secondaryCategoriesData[primaryId] || [];
				// 重置二级分类选中项
				this.currentSecondaryIndex = 0;
				// 根据选中的二级分类更新三级分类
				if (this.secondaryCategories.length > 0) {
					const secondaryId = this.secondaryCategories[0].id;
					this.tertiaryCategories = this.tertiaryCategoriesData[secondaryId] || [];
				} else {
					this.tertiaryCategories = [];
				}
			},
			selectSecondaryCategory(index) {
				this.currentSecondaryIndex = index;
				// 根据选中的二级分类更新三级分类
				const secondaryId = this.secondaryCategories[index].id;
				this.tertiaryCategories = this.tertiaryCategoriesData[secondaryId] || [];
			},
			goToProductList(item) {
				// 跳转到商品列表页面，传递三级分类ID和名称，并将分类名称作为搜索关键词
				uni.navigateTo({
					url: `/pages/product/list?categoryId=${item.id}&categoryName=${item.name}&searchKeyword=${item.name}`
				});
			}
		},
		mounted() {
			// 初始化二级分类数据
			this.secondaryCategories = this.secondaryCategoriesData[this.primaryCategories[0].id] || [];
			// 初始化三级分类数据
			if (this.secondaryCategories.length > 0) {
				this.tertiaryCategories = this.tertiaryCategoriesData[this.secondaryCategories[0].id] || [];
			}
		}
	}
</script>

<style scoped>
	.category-container {
		display: flex;
		height: 100%;
		width: 100%;
		padding-top: var(--status-bar-height);
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}
	
	.primary-category {
		width: 20%;
		height: 100%;
		background-color: #f5f5f5;
	}
	
	.primary-item {
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		border-bottom: 1rpx solid #eee;
	}
	
	.primary-item.active {
		background-color: #fff;
		color: #ff0000;
		font-weight: bold;
		border-left: 6rpx solid #ff0000;
	}
	
	.secondary-container {
		flex: 1;
		height: 100%;
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
		min-width: 120rpx; /* 减小最小宽度 */
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		position: relative;
		text-align: center; /* 文字居中 */
		margin-left: 10rpx; /* 减小左边距 */
		margin-right: 10rpx; /* 增加右边距，确保item之间有适当间距 */
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
		width: 40rpx;
		height: 4rpx;
		background-color: #ff0000;
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
		margin-bottom: 30rpx;
	}
	
	.tertiary-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}
	
	.tertiary-name {
		font-size: 24rpx;
	}
</style>
