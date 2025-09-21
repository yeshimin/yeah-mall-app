<template>
	<view class="order-confirm">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<text class="nav-back" @click="goBack"><</text>
			<text class="nav-title">确认订单</text>
			<text class="nav-refresh" @click="refreshOrderData">↻</text>
		</view>
		
		<!-- 收货地址 -->
		<view class="address-section">
			<view class="address-header">
				<text class="location-icon">📍</text>
				<text class="address-text">收货地址</text>
			</view>
			<view class="address-content" @click="selectAddress">
				<view class="address-info" v-if="selectedAddress">
					<view class="address-detail">
						<text class="name">{{ selectedAddress.name }}</text>
						<text class="phone">{{ selectedAddress.phone }}</text>
					</view>
					<view class="address-full">
						<text>{{ selectedAddress.address }}</text>
					</view>
				</view>
				<view class="no-address" v-else>
					<text>请选择收货地址</text>
				</view>
				<text class="arrow">></text>
			</view>
		</view>
		
		<!-- 商品列表（按店铺分组） -->
		<view class="goods-section" v-for="(shop, shopIndex) in groupedOrderGoods" :key="shopIndex">
			<view class="shop-header">
				<text class="shop-icon">🏪</text>
				<text class="shop-name">{{ shop.shopName }}</text>
			</view>
			
			<view v-if="loading" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<template v-else>
				<view class="goods-item" v-for="(item, itemIndex) in shop.items" :key="itemIndex">
					<image class="goods-image" :src="item.image" mode="aspectFill"></image>
					<view class="goods-info">
						<text class="goods-name">{{ item.name }}</text>
						<text class="goods-spec">{{ item.spec }}</text>
						<view class="goods-price-quantity">
							<text class="goods-price">¥{{ item.price }}</text>
							<text class="goods-quantity">x{{ item.quantity }}</text>
						</view>
					</view>
				</view>
				
				<!-- 店铺小计 -->
				<view class="shop-subtotal">
					<text>店铺小计: </text>
					<text class="subtotal-price">¥{{ calculateShopTotal(shop) }}</text>
				</view>
			</template>
		</view>
		
		<!-- 空状态提示 -->
		<view class="empty-state" v-if="!loading && groupedOrderGoods.length === 0">
			<text class="empty-text">暂无商品信息</text>
		</view>
		
		<!-- 订单金额 -->
		<view class="order-amount">
			<view class="amount-item">
				<text>商品总额</text>
				<text>¥{{ goodsTotal }}</text>
			</view>
			<view class="amount-item">
				<text>运费</text>
				<text>¥{{ shippingFee }}</text>
			</view>
			<view class="amount-item">
				<text>优惠券</text>
				<text>-¥{{ coupon }}</text>
			</view>
			<view class="total-amount">
				<text>合计:</text>
				<text class="total-price">¥{{ totalAmount }}</text>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="total-info">
				<text>合计:</text>
				<text class="total-price">¥{{ totalAmount }}</text>
			</view>
			<button class="submit-btn" @click="submitOrder">提交订单</button>
		</view>
	</view>
</template>

<script>
	import { fetchOrderPreview } from '../../utils/api.js';
	
	export default {
		data() {
			return {
				selectedAddress: {
					name: "张三",
					phone: "13800138000",
					address: "北京市朝阳区某某街道某某小区1号楼101室"
				},
				groupedOrderGoods: [], // 按店铺分组的商品
				goodsTotal: 0.00,
				shippingFee: 0.00,
				coupon: 0.00,
				loading: false,
				// 用于存储原始的请求参数，以便需要时可以重新获取数据
				requestItems: []
			}
		},
		onLoad(options) {
			// 接收从商品详情页传递过来的参数
			if (options.skuId && options.quantity) {
				console.log('接收到的SKU ID:', options.skuId);
				console.log('接收到的数量:', options.quantity);
				
				// 保存请求参数
				const requestItems = [{
					skuId: parseInt(options.skuId),
					quantity: parseInt(options.quantity)
				}];
				this.requestItems = requestItems;
				
				// 从商品详情页跳转过来，只有一个商品，调用预览接口获取完整数据
				this.fetchOrderPreviewData(requestItems);
			} else {
				// 获取从购物车页面传递的数据
				const eventChannel = this.getOpenerEventChannel();
				eventChannel.on('acceptDataFromCartPage', (data) => {
					console.log('从购物车页面接收到的数据:', data);
					if (data && data.selectedItems && data.selectedItems.length > 0) {
						// 保存请求参数
						this.requestItems = data.selectedItems;
						
						// 从购物车页面获取选中的商品ID和数量，然后请求订单预览数据
						// 注意：这里只传递必要的参数(skuId和quantity)，完整数据从服务器获取
						this.fetchOrderPreviewData(data.selectedItems);
					} else {
						// 没有商品数据
						this.loading = false;
						uni.showToast({
							title: '没有选择商品',
							icon: 'none'
						});
					}
				});
			}
		},
		computed: {
			totalAmount() {
				return (this.goodsTotal + this.shippingFee - this.coupon).toFixed(2);
			}
		},
		methods: {
			// 刷新订单数据 - 重新从服务器获取最新的订单预览数据
			refreshOrderData() {
				if (this.requestItems && this.requestItems.length > 0) {
					uni.showToast({
						title: '正在刷新数据...',
						icon: 'loading',
						duration: 500
					});
					// 使用保存的请求参数重新获取数据
					this.fetchOrderPreviewData(this.requestItems);
				} else {
					uni.showToast({
						title: '没有商品数据',
						icon: 'none'
					});
				}
			},
			
			// 获取订单预览数据
			fetchOrderPreviewData(items) {
				this.loading = true;
				uni.showLoading({
					title: '加载中...'
				});
				
				fetchOrderPreview(items)
					.then(data => {
						console.log('订单预览数据:', data);
						
						// 完全使用服务器返回的数据，不依赖本地传递的参数
						// 更新店铺分组商品数据
						this.groupedOrderGoods = data.map(shop => ({
							shopId: shop.shopId,
							shopName: shop.shopName,
							items: shop.items.map(item => ({
								id: item.skuId,
								name: item.spuName,
								spec: item.specs.map(spec => `${spec.specName}:${spec.optName}`).join(';'),
								// 严格使用服务器返回的价格和数量
								price: item.price,
								quantity: item.quantity, // 优先使用服务器返回的数量
								// 构造图片URL
								image: item.spuMainImage ? `http://localhost:8080/public/storage/preview?fileKey=${item.spuMainImage}` : ''
							}))
						}));
						
						// 计算商品总额 - 使用服务器返回的价格和数量计算
						this.goodsTotal = this.calculateTotalPrice();
					})
					.catch(error => {
						console.error('获取订单预览数据失败:', error);
						uni.showToast({
							title: '获取订单预览数据失败',
							icon: 'none'
						});
					})
					.finally(() => {
						this.loading = false;
						uni.hideLoading();
					});
			},
			
			// 计算所有商品的总价
			calculateTotalPrice() {
				return this.groupedOrderGoods
					.flatMap(shop => shop.items)
					.reduce((total, item) => total + item.price * item.quantity, 0)
					.toFixed(2);
			},
			
			// 计算每个店铺的商品总价
			calculateShopTotal(shop) {
				return shop.items
					.reduce((total, item) => total + item.price * item.quantity, 0)
					.toFixed(2);
			},
			
			goBack() {
				// 返回上一页
				uni.navigateBack();
			},
			
			selectAddress() {
				// 选择地址逻辑
				console.log("选择地址");
			},
			
			submitOrder() {
				// 提交订单逻辑
				console.log("提交订单");
				uni.showToast({
					title: "订单提交成功",
					icon: "success"
				});
			}
		}
	}
</script>

<style scoped>
	.order-confirm {
		padding-bottom: 100rpx;
		padding-top: 100rpx; /* 为顶部导航栏留出空间 */
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100rpx;
		padding: 0 20rpx;
		background-color: #fff;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
	}
	
	/* 加载状态样式 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
	}
	
	.loading-text {
		color: #999;
		font-size: 28rpx;
	}
	
	/* 空状态样式 */
	.empty-state {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
		background-color: #fff;
		margin-top: 20rpx;
		border-radius: 10rpx;
	}
	
	.empty-text {
		color: #999;
		font-size: 28rpx;
	}

	.nav-back, .nav-refresh {
		font-size: 32rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.nav-refresh {
		color: #666;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.address-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
	}

	.address-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.location-icon {
		font-size: 36rpx;
		margin-right: 10rpx;
	}

	.address-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
	}

	.address-info .name {
		font-weight: bold;
		margin-right: 20rpx;
	}

	.address-info .phone {
		color: #999;
	}

	.address-full {
		margin-top: 10rpx;
		color: #666;
	}

	.no-address {
		color: #999;
	}

	.arrow {
		font-size: 36rpx;
		color: #ccc;
	}

	/* 店铺分组样式 */
	.goods-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
	}

	.shop-header {
		display: flex;
		align-items: center;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		margin-bottom: 10rpx;
	}

	.shop-icon {
		font-size: 32rpx;
		margin-right: 10rpx;
	}

	.shop-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.shop-subtotal {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 15rpx 0;
		border-top: 1rpx dashed #eee;
		margin-top: 10rpx;
	}

	.subtotal-price {
		color: #ff4757;
		font-weight: bold;
		margin-left: 10rpx;
	}

	.goods-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #eee;
	}

	.goods-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}

	.goods-info {
		flex: 1;
	}

	.goods-name {
		font-size: 28rpx;
		display: block;
		margin-bottom: 10rpx;
	}

	.goods-spec {
		font-size: 24rpx;
		color: #999;
		display: block;
		margin-bottom: 20rpx;
	}

	.goods-price-quantity {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.goods-price {
		color: #ff4757;
		font-weight: bold;
	}

	.goods-quantity {
		color: #666;
	}

	.order-amount {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
	}

	.amount-item {
		display: flex;
		justify-content: space-between;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #eee;
	}

	.total-amount {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		font-size: 32rpx;
		font-weight: bold;
	}

	.total-price {
		color: #ff4757;
	}

	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
		border-top: 1rpx solid #eee;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.total-info .total-price {
		font-size: 36rpx;
		font-weight: bold;
		color: #ff4757;
		margin-left: 10rpx;
	}

	.submit-btn {
		width: 200rpx;
		height: 70rpx;
		line-height: 70rpx;
		background-color: #ff4757;
		color: #fff;
		border-radius: 35rpx;
		font-size: 28rpx;
	}
</style>