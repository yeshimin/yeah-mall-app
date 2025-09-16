<template>
	<view class="product-detail-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<text class="back-btn" @click="goBack">&lt;</text>
			<text class="nav-title">商品详情</text>
			<text class="more-btn">...</text>
		</view>
		
		<scroll-view class="detail-scroll" scroll-y :show-scrollbar="false">
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
				<view class="product-tags">
					<text class="tag">品牌直营</text>
					<text class="tag">正品保证</text>
					<text class="tag">7天无理由退换</text>
				</view>
			</view>
			
			<!-- 商品详情介绍图文区域 -->
			<view class="detail-section">
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
			<view class="bar-item cart-item" @click="addToCart">
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
						<text class="popup-price">￥{{ product.minPrice }}</text>
						<text class="popup-spec">已选: {{ getSelectedSpecDesc() }}</text>
					</view>
				</view>
				<view class="spec-options" v-for="spec in specs" :key="spec.specId">
					<text class="spec-title">{{ spec.specName }}</text>
					<view class="spec-list">
						<view 
							class="spec-item" 
							:class="{ active: selectedSpecs[spec.specId] === opt.optId }"
							v-for="opt in spec.opts" 
							:key="opt.optId"
							@click="selectSpecOption(spec.specId, opt.optId)"
						>
							{{ opt.optName }}
						</view>
					</view>
				</view>
				<view class="quantity-selector">
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="control-btn" @click="decreaseQuantity">-</text>
						<text class="quantity">{{ selectedQuantity }}</text>
						<text class="control-btn" @click="increaseQuantity">+</text>
					</view>
				</view>
				<view class="confirm-btn" @click="confirmSpec">确定</view>
			</view>
		</view>
		
		<!-- 购物车弹窗 -->
		<view class="cart-popup" v-if="showCartPopup" @click="closeCartPopup">
			<view class="popup-content" @click.stop>
				<text class="close-btn" @click="closeCartPopup">×</text>
				<view class="popup-header">
					<image class="popup-image" :src="banners[0] || 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'"></image>
					<view class="popup-info">
						<text class="popup-price">￥{{ product.minPrice }}</text>
						<text class="popup-stock" v-if="stock > 0">库存: {{ stock }}件</text>
						<text class="popup-stock out-of-stock" v-else>无货</text>
					</view>
				</view>
				<view class="spec-options" v-for="spec in specs" :key="spec.specId">
					<text class="spec-title">{{ spec.specName }}</text>
					<view class="spec-list">
						<view 
							class="spec-item" 
							:class="{ active: selectedSpecs[spec.specId] === opt.optId }"
							v-for="opt in spec.opts" 
							:key="opt.optId"
							@click="selectSpecOption(spec.specId, opt.optId)"
						>
							{{ opt.optName }}
						</view>
					</view>
				</view>
				<view class="quantity-selector">
					<text class="quantity-title">数量</text>
					<view class="quantity-controls">
						<text class="control-btn" @click="decreaseQuantity">-</text>
						<text class="quantity">{{ selectedQuantity }}</text>
						<text class="control-btn" @click="increaseQuantity">+</text>
					</view>
				</view>
				<view class="confirm-btn" @click="confirmAddToCart">加入购物车</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getUserId, handleAuthFailure, authRequest } from '@/utils/auth.js'

export default {
		data() {
				return {
					showSpec: false,
					showCartPopup: false,
					product: {},
					banners: [],
					specs: [], // 商品规格数据
					selectedSpecs: {}, // 选中的规格
					isCollected: false, // 收藏状态
					selectedQuantity: 1,
					stock: 100 // 示例库存
				}
			},
		methods: {
				goBack() {
					uni.navigateBack();
				},
				fetchProductDetail(productId) {
					const baseApi = 'http://localhost:8080';
					uni.request({
						url: `${baseApi}/app/product/detail?id=${productId}`,
						method: 'GET',
						success: (res) => {
							if (res.statusCode === 200 && res.data.code === 0) {
								console.log('获取商品详情成功:', res.data.data);
								const data = res.data.data;
								this.product = data.product;
								
								// 处理banner图片URL
								this.banners = data.banners.map(item => {
									const baseApi = 'http://localhost:8080';
									return item ? (() => {
										return `${baseApi}/public/storage/preview?fileKey=${item}`;
									})() : '';
								});
								
								// 处理规格数据
								this.specs = data.specs || [];
								// 初始化选中规格
								this.initSelectedSpecs();
								
								// 获取商品详情后检查收藏状态
								this.$nextTick(() => {
									this.checkCollectStatus();
								});
							} else {
								console.error('获取商品详情失败:', res.data.message);
							}
						},
						fail: (err) => {
							console.error('请求商品详情失败:', err);
						}
					});
				},
			goToStore() {
				// 跳转到店铺页面
				uni.showToast({
					title: '跳转到店铺',
					icon: 'none'
				});
			},
			contactService() {
					// 联系客服逻辑
					uni.showToast({
						title: '联系客服',
						icon: 'none'
					});
				},
				showSpecPopup() {
				this.showSpec = true;
			},
			closeSpecPopup() {
				this.showSpec = false;
			},
			closeCartPopup() {
				this.showCartPopup = false;
			},
			addToCart() {
				// 显示购物车弹窗
				this.showCartPopup = true;
			},
			confirmAddToCart() {
				// 检查是否所有规格都已选择
				const allSpecsSelected = this.specs.every(spec => {
					return this.selectedSpecs[spec.specId] !== undefined;
				});
				
				if (!allSpecsSelected) {
					uni.showToast({
						title: '请选择完整的规格',
						icon: 'none'
					});
					return;
				}
				
				// 添加到购物车逻辑
				uni.showToast({
					title: '已添加到购物车',
					icon: 'success'
				});
				// 关闭弹窗
				this.closeCartPopup();
			},
			buyNow() {
				// 立即购买逻辑
				uni.showToast({
					title: '立即购买',
					icon: 'none'
				});
			},
			addToFavorites() {
				// 检查用户是否已登录
				const userId = getUserId()
				if (!userId) {
					// 未登录，跳转到登录页面
					handleAuthFailure()
					return
				}
				
				// 切换收藏状态
				if (this.isCollected) {
					// 取消收藏
					this.cancelCollect()
				} else {
					// 添加收藏
					this.addCollect()
				}
			},
			// 添加收藏
			addCollect() {
				const userId = getUserId()
				if (!userId) {
					handleAuthFailure()
					return
				}
				
				// 调用添加收藏的API
				authRequest({
					url: 'http://localhost:8080/app/productFavorites/add',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						id: this.product.id
					}
				}, (res) => {
					if (res.data.code === 0) {
						// 根据响应中的success字段判断操作是否成功
						if (res.data.data.success) {
							this.isCollected = true
							uni.showToast({
								title: '收藏成功',
								icon: 'success'
							})
						}
						// 如果success为false，表示已收藏或收藏失败，不提示
					} else {
						uni.showToast({
							title: res.data.message || '收藏失败',
							icon: 'none'
						})
					}
				}, (err) => {
					console.error('收藏失败', err)
					uni.showToast({
						title: '收藏失败',
						icon: 'none'
					})
				})
			},
			// 取消收藏
			cancelCollect() {
				const userId = getUserId()
				if (!userId) {
					handleAuthFailure()
					return
				}
				
				// 调用取消收藏的API
				authRequest({
					url: 'http://localhost:8080/app/productFavorites/remove',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						id: this.product.id
					}
				}, (res) => {
					if (res.data.code === 0) {
						// 根据响应中的success字段判断操作是否成功
						if (res.data.data.success) {
							this.isCollected = false
							uni.showToast({
								title: '已取消收藏',
								icon: 'success'
							})
						}
						// 如果success为false，表示未收藏或取消失败，不提示
					} else {
						uni.showToast({
							title: res.data.message || '取消收藏失败',
							icon: 'none'
						})
					}
				}, (err) => {
					console.error('取消收藏失败', err)
					uni.showToast({
						title: '取消收藏失败',
						icon: 'none'
					})
				})
			},
			// 检查是否已收藏
			checkCollectStatus() {
				const userId = getUserId();
				if (!userId) return;
				
				authRequest({
					url: '/app/collect/isCollect',
					method: 'POST',
					data: {
						spuId: this.product.id
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data.code === 0) {
							this.isCollected = res.data.data.isCollect;
						} else if (res.statusCode === 401) {
							handleAuthFailure();
						} else {
							console.error('检查收藏状态失败:', res.data.message);
						}
					},
					fail: (err) => {
						console.error('检查收藏状态请求失败:', err);
					}
				});
			},
			// 初始化选中规格
			initSelectedSpecs() {
				const selectedSpecs = {};
				this.specs.forEach(spec => {
					if (spec.opts && spec.opts.length > 0) {
						// 默认选中第一个选项
						selectedSpecs[spec.specId] = spec.opts[0].optId;
					}
				});
				this.selectedSpecs = selectedSpecs;
			},
			// 选择规格选项
			selectSpecOption(specId, optId) {
				// 如果点击已选中的选项，则取消选择
				if (this.selectedSpecs[specId] === optId) {
					delete this.selectedSpecs[specId];
				} else {
					// 使用 Vue.set 或 this.$set 确保响应式更新
					this.$set(this.selectedSpecs, specId, optId);
				}
			},
			// 获取当前选中的规格描述
			getSelectedSpecDesc() {
				const selectedSpecs = [];
				this.specs.forEach(spec => {
					const selectedOptId = this.selectedSpecs[spec.specId];
					if (selectedOptId) {
						const selectedOpt = spec.opts.find(opt => opt.optId === selectedOptId);
						if (selectedOpt) {
							selectedSpecs.push(`${spec.specName}:${selectedOpt.optName}`);
						}
					}
				});
				return selectedSpecs.join(' ');
			},
				decreaseQuantity() {
					// 减少数量逻辑
					if (this.selectedQuantity > 1) {
						this.selectedQuantity--;
					}
				},
				increaseQuantity() {
					// 增加数量逻辑
					if (this.selectedQuantity < this.stock) {
						this.selectedQuantity++;
					}
				},
				confirmSpec() {
					// 检查是否所有规格都已选择
					const allSpecsSelected = this.specs.every(spec => {
						return this.selectedSpecs[spec.specId] !== undefined;
					});
					
					if (!allSpecsSelected) {
						uni.showToast({
							title: '请选择完整的规格',
							icon: 'none'
						});
						return;
					}
					
					// 确认规格选择
					this.closeSpecPopup();
					uni.showToast({
						title: '已选择规格',
						icon: 'success'
					});
				}
			},
			// 在页面加载时获取商品详情
			mounted() {
				// 从路由参数中获取商品ID
				const productId = this.$route.query.id || 1;
				this.fetchProductDetail(productId);

				// 获取商品详情后检查收藏状态
				this.$nextTick(() => {
					if (this.product.id) {
						this.checkCollectStatus();
					}
				});
			}
		}
</script>

<style scoped>
	.product-detail-container {
		height: 100vh;
		padding-top: var(--status-bar-height);
		position: relative;
	}
	
	.top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100rpx;
		padding: 0 20rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
	}
	
	.back-btn, .more-btn {
		font-size: 32rpx;
	}
	
	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.detail-scroll {
		height: calc(100vh - 200rpx);
		margin-top: 100rpx;
		margin-bottom: 100rpx;
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
		border-bottom: 1rpx solid #f5f5f5;
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
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.product-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.product-tags {
		display: flex;
	}
	
	.tag {
		font-size: 20rpx;
		color: #ff0000;
		border: 1rpx solid #ff0000;
		border-radius: 5rpx;
		padding: 5rpx 10rpx;
		margin-right: 10rpx;
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
		display: flex;
		flex-direction: column;
		align-items: center;
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
</style>