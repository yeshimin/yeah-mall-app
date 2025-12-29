<template>
	<view class="order-list">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-back" @click="goBack">
				<text class="iconfont">&#xe60e;</text>
			</view>
			<text class="nav-title">我的订单</text>
		</view>
		
		<!-- 订单状态筛选Tab -->
		<view class="status-tabs">
			<view 
				v-for="tab in statusTabs" 
				:key="tab.value"
				class="tab-item"
				:class="{ active: activeTab === tab.value }"
				@click="switchTab(tab.value)"
			>
				<text>{{ tab.label }}</text>
			</view>
		</view>
		
		<!-- 订单列表 -->
		<view class="order-content">
			<view v-if="loading" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<template v-else>
				<!-- 订单为空状态 -->
				<view class="empty-state" v-if="orders.length === 0">
					<text class="iconfont empty-icon">&#xe64d;</text>
					<text class="empty-text">暂无订单</text>
					<button class="go-shop-btn" @click="goToShop">去逛逛</button>
				</view>
				
				<!-- 订单列表 -->
				<view class="order-item" v-for="order in orders" :key="order.id">
					<!-- 订单头部：店铺信息 -->
					<view class="order-header">
						<view class="shop-info">
							<text class="iconfont shop-icon">&#xe60c;</text>
							<text class="shop-name">{{ order.shopName }}</text>
						</view>
						<text class="order-status">{{ order.statusText }}</text>
					</view>
					
					<!-- 订单商品列表 -->
					<view class="order-goods" v-for="(goods, idx) in order.goods" :key="idx" @click="goToDetail(order.id)">
						<image class="goods-image" :src="goods.image" mode="aspectFill"></image>
						<view class="goods-info">
							<text class="goods-name">{{ goods.name }}</text>
							<text class="goods-spec">{{ goods.spec }}</text>
							<view class="goods-price-quantity">
								<text class="goods-price">¥{{ goods.price }}</text>
								<text class="goods-quantity">x{{ goods.quantity }}</text>
							</view>
						</view>
					</view>
					
					<!-- 订单金额 -->
					<view class="order-amount">
						<text>共{{ order.totalQuantity }}件商品 合计：</text>
						<text class="total-price">¥{{ order.totalPrice }}</text>
						<text class="shipping-fee" v-if="order.shippingFee > 0"> (含运费¥{{ order.shippingFee }})</text>
					</view>
					
					<!-- 订单操作按钮 -->
					<view class="order-actions">
						<button 
							v-for="action in getOrderActions(order.status)" 
							:key="action.value"
							class="action-btn"
							:class="action.type"
							@click="handleOrderAction(action.value, order)"
						>
							{{ action.label }}
						</button>
					</view>
				</view>
			</template>
		</view>
	</view>
</template>

<script>
	import { fetchOrderCounts } from '../../utils/api.js';
		export default {
		data() {
			return {
				// 订单状态筛选Tab
				statusTabs: [
					{ label: '全部', value: 0 },
					{ label: '待付款', value: 1 },
					{ label: '待发货', value: 2 },
					{ label: '待收货', value: 3 },
					{ label: '退款/售后', value: 4 },
					{ label: '评价', value: 5 }
				],
				// 当前激活的Tab
				activeTab: 0,
				// 订单数据
				orders: [],
				// 加载状态
				loading: false,
				// 订单状态与文本映射
				statusMap: {
					1: '待付款',
					2: '待发货',
					3: '待收货',
					4: '待评价',
					5: '已完成',
					6: '已取消',
					7: '退款中',
					8: '已退款'
				}
			};
		},
		onLoad(options) {
			// 如果从其他页面跳转过来并指定了订单状态，则切换到对应Tab
			if (options.status) {
				this.activeTab = parseInt(options.status);
			}
			// 获取订单数据
			this.fetchOrders();
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 跳转到店铺首页
			goToShop() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			},
			
			// 跳转到订单详情
			goToDetail(orderId) {
				// 这里可以跳转到订单详情页，目前项目中没有，所以先打印
				console.log('查看订单详情:', orderId);
				uni.showToast({
					title: '订单详情功能待实现',
					icon: 'none'
				});
			},
			
			// 切换订单状态Tab
			switchTab(value) {
				this.activeTab = value;
				// 重新获取对应状态的订单数据
				this.fetchOrders();
			},
			
			// 获取订单数据
			fetchOrders() {
				this.loading = true;
				// 模拟API请求，实际项目中应该调用真实接口
				setTimeout(() => {
					this.loading = false;
					// 模拟不同状态的订单数据
					this.orders = this.generateMockOrders();
				}, 1000);
				
				// 实际项目中应该调用真实接口
				// fetchOrders(this.activeTab)
				// 	.then(data => {
					// 		this.orders = data;
					// 		this.loading = false;
					// 	})
				// 	.catch(error => {
					// 		console.error('获取订单列表失败:', error);
					// 		this.loading = false;
					// 		uni.showToast({
						// 			title: '获取订单失败',
						// 			icon: 'none'
						// 		});
					// 	});
			},
			
			// 生成模拟订单数据
			generateMockOrders() {
				const mockOrders = [
					{
						id: 1,
						shopId: 1,
						shopName: '时尚精品店',
						status: 1,
						statusText: '待付款',
						totalPrice: 199.00,
						totalQuantity: 2,
						shippingFee: 10.00,
						createTime: '2025-12-22 14:30:00',
						goods: [
							{
								id: 101,
								name: '时尚连衣裙',
								spec: '颜色:红色;尺码:M',
								price: 99.50,
								quantity: 2,
								image: 'https://via.placeholder.com/100'
							}
						]
					},
					{
						id: 2,
						shopId: 2,
						shopName: '数码商城',
						status: 2,
						statusText: '待发货',
						totalPrice: 2999.00,
						totalQuantity: 1,
						shippingFee: 0.00,
						createTime: '2025-12-21 10:15:00',
						goods: [
							{
								id: 201,
								name: '智能手表',
								spec: '颜色:黑色;版本:42mm',
								price: 2999.00,
								quantity: 1,
								image: 'https://via.placeholder.com/100'
							}
						]
					},
					{
						id: 3,
						shopId: 3,
						shopName: '家居生活馆',
						status: 3,
						statusText: '待收货',
						totalPrice: 399.00,
						totalQuantity: 3,
						shippingFee: 15.00,
						createTime: '2025-12-20 16:45:00',
						goods: [
							{
								id: 301,
								name: '纯棉毛巾',
								spec: '颜色:蓝色;规格:3条装',
								price: 39.00,
								quantity: 1,
								image: 'https://via.placeholder.com/100'
							},
							{
								id: 302,
								name: '舒适枕头',
								spec: '材质:记忆棉;规格:单个装',
								price: 180.00,
								quantity: 2,
								image: 'https://via.placeholder.com/100'
							}
						]
					},
					{
						id: 4,
						shopId: 1,
						shopName: '时尚精品店',
						status: 4,
						statusText: '待评价',
						totalPrice: 159.00,
						totalQuantity: 1,
						shippingFee: 0.00,
						createTime: '2025-12-19 09:30:00',
						goods: [
							{
								id: 102,
								name: '潮流运动鞋',
								spec: '颜色:白色;尺码:42',
								price: 159.00,
								quantity: 1,
								image: 'https://via.placeholder.com/100'
							}
						]
					},
					{
						id: 5,
						shopId: 4,
						shopName: '美食特产店',
						status: 7,
						statusText: '退款中',
						totalPrice: 89.00,
						totalQuantity: 2,
						shippingFee: 8.00,
						createTime: '2025-12-18 14:20:00',
						goods: [
							{
								id: 401,
								name: '特色小吃',
								spec: '口味:原味;规格:200g',
								price: 44.50,
								quantity: 2,
								image: 'https://via.placeholder.com/100'
							}
						]
					}
				];
				
				// 根据当前激活的Tab筛选订单
				if (this.activeTab === 0) {
					// 全部订单
					return mockOrders;
				} else if (this.activeTab === 1) {
					// 待付款
					return mockOrders.filter(order => order.status === 1);
				} else if (this.activeTab === 2) {
					// 待发货
					return mockOrders.filter(order => order.status === 2);
				} else if (this.activeTab === 3) {
					// 待收货
					return mockOrders.filter(order => order.status === 3);
				} else if (this.activeTab === 4) {
					// 退款/售后
					return mockOrders.filter(order => [6, 7, 8].includes(order.status));
				} else if (this.activeTab === 5) {
					// 待评价
					return mockOrders.filter(order => order.status === 4);
				}
				
				return mockOrders;
			},
			
			// 根据订单状态获取操作按钮
			getOrderActions(status) {
				const actionMap = {
					1: [ // 待付款
						{ label: '取消订单', value: 'cancel', type: 'default' },
						{ label: '立即付款', value: 'pay', type: 'primary' }
					],
					2: [ // 待发货
						{ label: '提醒发货', value: 'remind', type: 'default' },
						{ label: '查看详情', value: 'detail', type: 'primary' }
					],
					3: [ // 待收货
						{ label: '查看物流', value: 'logistics', type: 'default' },
						{ label: '确认收货', value: 'confirm', type: 'primary' }
					],
					4: [ // 待评价
						{ label: '删除订单', value: 'delete', type: 'default' },
						{ label: '去评价', value: 'comment', type: 'primary' }
					],
					5: [ // 已完成
						{ label: '删除订单', value: 'delete', type: 'default' },
						{ label: '再次购买', value: 'rebuy', type: 'primary' }
					],
					6: [ // 已取消
						{ label: '删除订单', value: 'delete', type: 'default' },
						{ label: '再次购买', value: 'rebuy', type: 'primary' }
					],
					7: [ // 退款中
						{ label: '查看退款', value: 'refundDetail', type: 'primary' }
					],
					8: [ // 已退款
						{ label: '删除订单', value: 'delete', type: 'default' },
						{ label: '再次购买', value: 'rebuy', type: 'primary' }
					]
				};
				
				return actionMap[status] || [];
			},
			
			// 处理订单操作
			handleOrderAction(action, order) {
				console.log('订单操作:', action, order);
				
				switch (action) {
					case 'cancel':
						// 取消订单
						uni.showModal({
							title: '取消订单',
							content: '确定要取消该订单吗？',
							confirmText: '确定',
							cancelText: '取消',
							success: (res) => {
								if (res.confirm) {
									// 这里应该调用取消订单接口
									uni.showToast({
										title: '订单已取消',
										icon: 'success'
									});
									// 重新获取订单列表
									this.fetchOrders();
								}
							}
						});
						break;
					case 'pay':
						// 立即付款
						uni.showToast({
							title: '付款功能待实现',
							icon: 'none'
						});
						break;
					case 'remind':
						// 提醒发货
						uni.showToast({
							title: '已提醒商家发货',
							icon: 'success'
						});
						break;
					case 'detail':
						// 查看详情
						this.goToDetail(order.id);
						break;
					case 'logistics':
						// 查看物流
						uni.showToast({
							title: '物流查询功能待实现',
							icon: 'none'
						});
						break;
					case 'confirm':
						// 确认收货
						uni.showModal({
							title: '确认收货',
							content: '请确认您已收到商品',
							confirmText: '确认',
							cancelText: '取消',
							success: (res) => {
								if (res.confirm) {
									// 这里应该调用确认收货接口
									uni.showToast({
										title: '已确认收货',
										icon: 'success'
									});
									// 重新获取订单列表
									this.fetchOrders();
								}
							}
						});
						break;
					case 'delete':
						// 删除订单
						uni.showModal({
							title: '删除订单',
							content: '确定要删除该订单吗？',
							confirmText: '确定',
							cancelText: '取消',
							success: (res) => {
								if (res.confirm) {
									// 这里应该调用删除订单接口
									this.orders = this.orders.filter(item => item.id !== order.id);
									uni.showToast({
										title: '订单已删除',
										icon: 'success'
									});
								}
							}
						});
						break;
					case 'comment':
						// 去评价
						uni.showToast({
							title: '评价功能待实现',
							icon: 'none'
						});
						break;
					case 'rebuy':
						// 再次购买
						uni.showToast({
							title: '再次购买功能待实现',
							icon: 'none'
						});
						break;
					case 'refundDetail':
						// 查看退款
						uni.showToast({
							title: '退款详情功能待实现',
							icon: 'none'
						});
						break;
					default:
						break;
				}
			}
		}
	};
</script>

<style scoped>
	/* 全局样式重置 */
	page {
		background-color: #f8f8f8;
	}

	/* 订单列表容器 */
	.order-list {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	/* 顶部导航栏 */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80rpx;
		padding: 0 20rpx;
		background-color: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
	}

	.nav-back, .nav-refresh {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.nav-back:active, .nav-refresh:active {
		background-color: #f5f5f5;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	/* 订单状态筛选Tab */
	.status-tabs {
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 80rpx;
		background-color: #fff;
		margin-top: 80rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 80rpx;
		z-index: 90;
	}

	.tab-item {
		flex: 1;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #3cc51f;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 40rpx;
		height: 4rpx;
		background-color: #3cc51f;
		border-radius: 2rpx;
	}

	/* 订单内容区域 */
	.order-content {
		padding: 20rpx;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;
	}

	.loading-text {
		color: #999;
		font-size: 28rpx;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
		background-color: #fff;
		border-radius: 12rpx;
	}

	.empty-icon {
		font-size: 120rpx;
		color: #ddd;
		margin-bottom: 30rpx;
	}

	.empty-text {
		color: #999;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}

	.go-shop-btn {
		width: 200rpx;
		height: 60rpx;
		line-height: 60rpx;
		background-color: #3cc51f;
		color: #fff;
		border-radius: 30rpx;
		font-size: 28rpx;
		border: none;
	}

	/* 订单项 */
	.order-item {
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	/* 订单头部 */
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.shop-info {
		display: flex;
		align-items: center;
	}

	.shop-icon {
		font-size: 32rpx;
		margin-right: 10rpx;
		color: #3cc51f;
	}

	.shop-name {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.order-status {
		font-size: 28rpx;
		color: #ff4757;
		font-weight: 500;
	}

	/* 订单商品 */
	.order-goods {
		display: flex;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		cursor: pointer;
	}

	.goods-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		margin-right: 20rpx;
		background-color: #f9f9f9;
	}

	.goods-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.goods-spec {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.goods-price-quantity {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.goods-price {
		font-size: 30rpx;
		font-weight: bold;
		color: #ff4757;
	}

	.goods-quantity {
		color: #666;
		font-size: 26rpx;
	}

	/* 订单金额 */
	.order-amount {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		font-size: 28rpx;
		color: #666;
	}

	.total-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff4757;
		margin: 0 10rpx;
	}

	.shipping-fee {
		font-size: 24rpx;
		color: #999;
	}

	/* 订单操作按钮 */
	.order-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 20rpx;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.action-btn {
		width: 140rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 30rpx;
		font-size: 26rpx;
		border: 1rpx solid #ddd;
		background-color: #fff;
		color: #666;
	}

	.action-btn.primary {
		background-color: #3cc51f;
		color: #fff;
		border: 1rpx solid #3cc51f;
	}

	.action-btn.default {
		background-color: #fff;
		color: #666;
		border: 1rpx solid #ddd;
	}

	/* 图标字体 */
	.iconfont {
		font-family: 'iconfont' !important;
		font-size: 32rpx;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>