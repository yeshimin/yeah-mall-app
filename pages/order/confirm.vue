<template>
	<view class="order-confirm">
		
		<!-- 收货地址 -->
		<view class="address-section">
			<view class="address-header">
				<text class="iconfont location-icon">&#xe611;</text>
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
				<text class="iconfont arrow">&#xe65f;</text>
			</view>
		</view>
		
		<!-- 商品列表（按店铺分组） -->
		<view class="goods-section" v-for="(shop, shopIndex) in groupedOrderGoods" :key="shopIndex">
			<view class="shop-header">
				<text class="iconfont shop-icon">&#xe60c;</text>
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
			<text class="iconfont empty-icon">&#xe64d;</text>
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
				<text class="discount-price">-¥{{ coupon }}</text>
			</view>
			<view class="total-amount">
				<text>合计:</text>
				<text class="total-price">¥{{ totalAmount }}</text>
			</view>
			<view class="blank">
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="total-info">
				<text class="total-label">合计:</text>
				<text class="total-price">¥{{ totalAmount }}</text>
			</view>
			<button class="submit-btn" @click="payOrder">付款</button>
		</view>
	</view>
</template>

<script>
	import { fetchOrderPreview, submitOrder, queryPayOrderInfo, queryAddressList } from '../../utils/api.js';
	import { BASE_API } from '@/utils/config.js';
	
	export default {
		data() {
		return {
			selectedAddress: null,
			addressLoading: false,
			groupedOrderGoods: [], // 按店铺分组的商品
			goodsTotal: 0.00,
			shippingFee: 0.00,
			coupon: 0.00,
			loading: false,
			// 用于存储原始的请求参数，以便需要时可以重新获取数据
			requestItems: [],
			// 订单来源：1-商品详情页，2-购物车页面
			orderSource: 1
		}
	},
		onLoad(options) {
			// 获取默认地址
			this.fetchDefaultAddress();
			
			// 接收从商品详情页传递过来的参数
			if (options.skuId && options.quantity) {
				console.log('接收到的SKU ID:', options.skuId);
				console.log('接收到的数量:', options.quantity);
				
				// 设置订单来源为商品详情页
				this.orderSource = 1;
				
				// 保存请求参数
				const requestItems = [{
					skuId: parseInt(options.skuId),
					quantity: parseInt(options.quantity)
				}];
				this.requestItems = requestItems;
				
				// 从商品详情页跳转过来，只有一个商品，调用预览接口获取完整数据
				this.fetchOrderPreviewData(requestItems);
			} else {
				// 获取事件通道
				const eventChannel = this.getOpenerEventChannel();
				// 获取从购物车页面传递的数据
				eventChannel.on('acceptDataFromCartPage', (data) => {
					console.log('从购物车页面接收到的数据:', data);
					if (data && data.selectedItems && data.selectedItems.length > 0) {
						// 设置订单来源为购物车页面
						this.orderSource = 2;
						
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
		onShow() {
			console.log('Order confirm onShow called');
			// 页面显示时，检查是否有选中的地址需要更新
			const selectedAddr = uni.getStorageSync('selectedAddress');
			console.log('Retrieved address from localStorage:', selectedAddr);
			if (selectedAddr) {
				this.selectedAddress = selectedAddr;
				console.log('Selected address updated:', this.selectedAddress);
				// 清除临时存储的地址
				uni.removeStorageSync('selectedAddress');
				console.log('LocalStorage cleared');
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
								image: item.spuMainImage ? `${BASE_API}/public/storage/preview?fileKey=${item.spuMainImage}` : ''
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
			
			// 获取默认地址
			fetchDefaultAddress() {
				this.addressLoading = true;
				queryAddressList({ isDefault: true })
					.then(data => {
						if (data && data.length > 0) {
							this.selectedAddress = {
								id: data[0].id,
								name: data[0].name,
								phone: data[0].contact,
								address: data[0].fullAddress,
								provinceCode: data[0].provinceCode,
								cityCode: data[0].cityCode,
								districtCode: data[0].districtCode,
								isDefault: data[0].isDefault
							};
						}
					})
					.catch(error => {
						console.error('获取默认地址失败:', error);
					})
					.finally(() => {
						this.addressLoading = false;
					});
			},
			
			// 选择地址
			selectAddress() {
				// 跳转到地址选择页面
				uni.navigateTo({
					url: '/pages/address/list?fromOrder=true',
					eventChannel: this.getOpenerEventChannel()
				});
			},
			
			payOrder() {
				// 支付订单逻辑
				console.log("支付订单");
				
				// 检查是否有商品
				if (!this.groupedOrderGoods || this.groupedOrderGoods.length === 0) {
					uni.showToast({
						title: "没有可支付的商品",
						icon: "none"
					});
					return;
				}
				
				// 检查是否选择了收货地址
				if (!this.selectedAddress) {
					uni.showToast({
						title: "请选择收货地址",
						icon: "none"
					});
					return;
				}
				
				// 显示加载提示
				uni.showLoading({
					title: '处理中...'
				});
				
				// 构造第一个店铺的订单项（这里简化处理，只支持单个店铺的订单）
				const shop = this.groupedOrderGoods[0];
				const items = shop.items.map(item => ({
					skuId: item.id,
					quantity: item.quantity
				}));

				// 构造请求数据
				const data = {
					items: items
				};
				
				// 如果是从购物车下单，则添加scene参数
				if (this.orderSource === 2) {
					data.scene = 2; // 订单场景，2表示从购物车下单
				}
				
					// 调用提交订单接口
				submitOrder(data)
					.then(result => {
						console.log("订单提交成功:", result);
						
						// 直接从下单接口返回结果中获取订单号和支付信息
						// 支付信息直接在result.data中，与genPayInfo接口返回格式一致
						const orderNo = result.data.orderNo;
						const paymentData = result.data;
						console.log("订单号:", orderNo);
						console.log("支付信息:", paymentData);
						
						// 转换支付参数为uni.requestPayment所需格式
						const payParams = {
							provider: 'wxpay',
							// 微信小程序支付必需参数
							timeStamp: paymentData.timestamp, // 秒级时间戳
							nonceStr: paymentData.nonceStr, // 随机字符串
							package: paymentData.packageStr, // 预支付交易会话标识
							signType: paymentData.signType, // 签名类型
							paySign: paymentData.paySign // 签名
						};
						
						// 打印支付参数
						console.log('微信支付请求参数:', payParams);
						
						// 检查uni.requestPayment是否存在
						if (typeof uni.requestPayment === 'function') {
							// 发起微信支付
							uni.requestPayment({
								...payParams,
								success: (res) => {
									// 支付成功处理
									console.log('支付成功', res);
									uni.hideLoading();
									// 跳转到支付结果页面，传递支付成功状态
									uni.navigateTo({
										url: `/pages/order/pay-result?orderNo=${orderNo}&payResultType=success`
									});
								},
								fail: (err) => {
									// 支付失败处理
									console.log('支付失败', err);
									uni.hideLoading();
									// 根据错误类型判断支付结果
									if (err.errMsg === 'requestPayment:fail cancel') {
										// 用户取消支付
										uni.navigateTo({
											url: `/pages/order/pay-result?orderNo=${orderNo}&payResultType=cancel`
										});
									} else {
										// 支付失败，启动轮询
										uni.navigateTo({
											url: `/pages/order/pay-result?orderNo=${orderNo}&payResultType=fail`
										});
									}
								}
							});
						} else {
							console.error('uni.requestPayment is not a function');
							uni.hideLoading();
							uni.showToast({
								title: '当前环境不支持微信支付',
								icon: 'none'
							});
						}
					})
					.catch(error => {
						console.error("支付处理失败:", error);
						uni.hideLoading();
						uni.showToast({
							title: error.message || "支付处理失败",
							icon: "none"
						});
					});
			}
		}
	}
</script>

<style scoped>
	/* 图标字体 */
	@font-face {
		font-family: "iconfont";
		src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAAVMAAsAAAAACkQAAAT+AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqHVIYnATYCJAMUCwwABCAFhGcHSRvSCFGUTk6Q7CtsynAvFKKiUBQVK6okqrb39mhve0MwPPH9fvzOvXOfmUkyCZJookmkkyYxkUQoJEKlE6Lh/2ua/QFbYauha6OmdRXRVZTVRKpkZa7Di6ScvDk5OW8+Jy/xEqF4Eo1EIiRCIiRC8TQaiRBCJEQjEbKZZO7p3wHEADYDGwxsa6C2FjGIZlsTBGDhf66ZXpIWTdvs5uTmXuGKqvCrAqsAq8IqcEX1c3wNqMrfNy9fZCpgo6Dw1r6z5mzk7QvvU3oK/xOkADfnB7jjQAFtgAGxUOhdBgdl2zAMXcapYQwk2xEo9sX4+5T3Ke9T3qe+T/3/E0yAJILjv3hAodAQG4SoQVQBCu8zZfApJYYvIFPhC0ZU+EISDb4QRIsvJCnhCwkKQJYCQDvAeYBYA0jfIbehCBSxsYsJm1AwmJycpNFIJHK5RKlUqHQ6rVar0WrVcrlMJpOKRCIez+dZLHqnU+/z6QIBfTCo93iMJpPBYNB7vSa73RwO2+Nxe0+PY3DQNTLiHhvzjI97Jia8U1O+2Vnf/Lx/YSGwtBRcWQmtrUU2NqJbW7Hd3fj+fvzoKHF8nDw9TZ2dpS8u0tls5vIye3WVu77O5/P5m5vC7W3x7q50f1+G4+m0Nh5XRyKKUEgWCEj9fqnXK3G7JS6X2OkUOxxCm01gsQjMZoHJxDcY+Dod4HYDHg/g9QL9/cDAADAyAoyPA1NTwOws8PAAnJ8DuRyQzwO3t8DjI/D0BLy8AK+vwNsb8P4OfHwAn5/A1xfw/Q38/AJ/f8Df3+9/wPcP8P0LfP0BX7/A5w/w8Q28vwGvr8DLC/D8DDw9Ao8PwP0dcHcL3FwD+Wtgbw/Y3QV2doDtbWBrC9jcBDY2gLU1YHUVWFkBlpeBxUVgfh6YmwNmZ4GZGWBqCpicBMbHgdFRYHgYGBwEBgaA/n6grw/o7QV6eoDubqCrC+jsBI6OgMNDIJMB0mkglQISCSAeB2IxIBoFIhEgHAZCISAYBAIBwO8HfD7A6wU8HsDtBlwuwOkEHA7AbgdsNsBqBSwWwGwGTCbAaAQMBkCvB3Q6QKsFNBpArQZUKkCpBBQKQC4HZDJAKgXEYkAkAoRCQCAA+HyA1wt4PIDLBTgcgM0GWCyAyQQYDIBOB2g0gEoFyOWARCIQCPl8Hk/I5Qq4XD6Hw+dweBwOl81ms1gsJovFYLEYbDaDw2Fw/2MwGEwmk8VisVgsNpvN4XC4XC6Px+Pz+QKBQCgUisRiiUQilUplMplcLlcoFEqlUqVSqdVqjUaj1Wp1Op1er8cxHA9gWADHAyQJUBRA0wDDABwHCAKgKIBhAJYFOA7gecDnA4GALxKJJBKJTCZTKBQqlUqj0eh0OoPBYDKZLBaLzWZzOBwul8vj8QQCgVAoFIvFUqlUJpMplUqNRqPVanU6ncFgMJlMFovFZrM5HA6Xy+XxeHw+XyAQiEQiiUQik8mUSqVKpdJoNFqtVqfTGQwGk8lksVhsNpvD4XC5XB6Px+fzBQKBSCQSi8VSqVQmkymVSo1Go9VqdTqdwWAwmUwWi8Vms//8+QcmQZKo') format('woff2');
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-size: 32rpx;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.order-confirm {
		padding-bottom: 160rpx;
		margin-bottom: 60rpx;
		background-color: #f7f8fa;
		min-height: 100vh;
		box-sizing: border-box;
	}
	
	/* 加载状态样式 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0;
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
		padding: 60rpx 0;
		background-color: #fff;
		margin-top: 20rpx;
		border-radius: 12rpx;
	}
	
	.empty-icon {
		font-size: 80rpx;
		color: #ddd;
		margin-bottom: 20rpx;
	}
	
	.empty-text {
		color: #999;
		font-size: 28rpx;
	}

	.back-btn {
		font-size: 32rpx;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.address-section {
		margin-top: 10rpx; /* 减少顶部间距 */
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.address-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.location-icon {
		font-size: 36rpx;
		margin-right: 10rpx;
		color: #ff4757;
	}

	.address-text {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.address-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
	}

	.address-info {
		flex: 1;
	}

	.address-detail {
		display: flex;
		align-items: center;
	}

	.address-info .name {
		font-weight: bold;
		margin-right: 20rpx;
		color: #333;
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
		font-size: 28rpx;
		color: #ccc;
	}

	/* 店铺分组样式 */
	.goods-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
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
		color: #ff4757;
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
		border-bottom: 1rpx solid #f5f5f5;
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
		font-weight: 500;
		color: #333;
		display: block;
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
		display: block;
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

	.order-amount {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.amount-item {
		display: flex;
		justify-content: space-between;
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		font-size: 28rpx;
		color: #666;
	}

	.discount-price {
		color: #4CAF50;
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
		padding: 0 30rpx;
		box-sizing: border-box;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		border-top: 1rpx solid #f5f5f5;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.total-info {
		display: flex;
		align-items: baseline;
	}

	.total-label {
		font-size: 28rpx;
		color: #333;
	}

	.total-info .total-price {
		font-size: 40rpx;
		font-weight: bold;
		color: #ff4757;
		margin-left: 10rpx;
	}

	.submit-btn {
		width: 220rpx;
		height: 80rpx;
		line-height: 80rpx;
		background: linear-gradient(to right, #ff6b6b, #ff4757);
		color: #fff;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: bold;
		box-shadow: 0 4rpx 10rpx rgba(255, 71, 87, 0.3);
		border: none;
	}

	.submit-btn:active {
		transform: scale(0.98);
		background: linear-gradient(to right, #ff5a5a, #ff3747);
	}
	.blank {
		height: 100rpx;
	}
</style>