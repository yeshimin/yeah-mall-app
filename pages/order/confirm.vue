<template>
	<view class="order-confirm">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<text class="nav-back" @click="goBack">&lt;</text>
			<text class="nav-title">确认订单</text>
			<text class="nav-back"></text>
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
		
		<!-- 商品列表 -->
		<view class="goods-section">
			<view class="section-title">
				<text>商品信息</text>
			</view>
			<view class="goods-item" v-for="(item, index) in orderGoods" :key="index">
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
	export default {
		data() {
			return {
				selectedAddress: {
					name: "张三",
					phone: "13800138000",
					address: "北京市朝阳区某某街道某某小区1号楼101室"
				},
				orderGoods: [
					{
						id: 1,
						image: "/static/logo.png",
						name: "商品名称",
						spec: "规格: 红色, XL",
						price: 99.00,
						quantity: 1
					}
				],
				goodsTotal: 99.00,
				shippingFee: 0.00,
				coupon: 0.00
			}
		},
		onLoad(options) {
			// 接收从商品详情页传递过来的参数
			if (options.skuId && options.quantity) {
				console.log('接收到的SKU ID:', options.skuId);
				console.log('接收到的数量:', options.quantity);
				// 这里可以调用接口获取商品详细信息
				// this.fetchProductInfo(options.skuId, options.quantity);
			}
		},
		computed: {
			totalAmount() {
				return (this.goodsTotal + this.shippingFee - this.coupon).toFixed(2);
			}
		},
		methods: {
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

	.nav-back {
		font-size: 32rpx;
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

	.goods-section {
		margin-top: 20rpx;
		padding: 20rpx;
		background-color: #fff;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
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