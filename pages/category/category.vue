<template>
	<view class="category-container">
		<!-- 一级分类 -->
		<scroll-view class="primary-category" scroll-y>
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
		
		<!-- 二级分类 -->
		<scroll-view class="secondary-category" scroll-y>
			<view class="secondary-grid">
				<view 
					class="secondary-item" 
					v-for="(item, index) in secondaryCategories" 
					:key="index"
					@click="goToProductList(item)"
				>
					<image class="secondary-icon" :src="item.icon"></image>
					<text class="secondary-name">{{ item.name }}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentPrimaryIndex: 0,
				primaryCategories: [
					{ id: 1, name: '服装' },
					{ id: 2, name: '电子产品' },
					{ id: 3, name: '家居' },
					{ id: 4, name: '美妆' },
					{ id: 5, name: '食品' }
				],
				// 二级分类数据，按一级分类ID分组
				secondaryCategoriesData: {
					1: [
						{ id: 11, name: '男装', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 12, name: '女装', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 13, name: '童装', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 14, name: '内衣', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					2: [
						{ id: 21, name: '手机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 22, name: '电脑', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 23, name: '耳机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 24, name: '相机', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					3: [
						{ id: 31, name: '家具', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 32, name: '厨具', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 33, name: '装饰', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					4: [
						{ id: 41, name: '护肤品', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 42, name: '彩妆', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 43, name: '香水', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					],
					5: [
						{ id: 51, name: '零食', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 52, name: '饮料', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
						{ id: 53, name: '生鲜', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
					]
				},
				secondaryCategories: []
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
			},
			goToProductList(item) {
				// 跳转到商品列表页面，传递二级分类ID
				uni.navigateTo({
					url: `/pages/product/list?categoryId=${item.id}&categoryName=${item.name}`
				});
			}
		},
		mounted() {
			// 初始化二级分类数据
			this.secondaryCategories = this.secondaryCategoriesData[this.primaryCategories[0].id] || [];
		}
	}
</script>

<style scoped>
	.category-container {
		display: flex;
		height: 100vh;
		padding-top: var(--status-bar-height);
	}
	
	.primary-category {
		width: 200rpx;
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
	
	.secondary-category {
		flex: 1;
		height: 100%;
	}
	
	.secondary-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
	}
	
	.secondary-item {
		width: 33.33%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.secondary-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}
	
	.secondary-name {
		font-size: 24rpx;
	}
</style>
