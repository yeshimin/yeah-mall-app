<template>
	<view class="order-list">
		<!-- 订单状态筛选Tab -->
		<scroll-view class="status-tabs-container" scroll-x="true" :scroll-left="scrollLeft" scroll-with-animation="true">
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
		</scroll-view>
		
		<!-- 订单列表 -->
		<scroll-view class="order-content" scroll-y="true" @scrolltolower="loadMore" :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
			<view v-if="loading && orders.length === 0" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<template v-else>
				<!-- 订单为空状态 -->
				<view class="empty-state" v-if="orders.length === 0 && !loading">
					<text class="empty-icon">📦</text>
					<text class="empty-text">暂无订单</text>
					<button class="go-shop-btn" @click="goToShop">去逛逛</button>
				</view>
				
				<!-- 订单列表 -->
				<view class="order-item" v-for="order in orders" :key="order.id">
					<!-- 订单头部：店铺信息 -->
					<view class="order-header">
						<view class="shop-info">
							<text class="shop-icon">🏪</text>
							<text class="shop-name">{{ order.shopName }}</text>
						</view>
						<text class="order-status">{{ order.statusText }}</text>
					</view>
					
					<!-- 订单商品列表 -->
					<view class="order-goods" v-for="(goods, idx) in order.goods" :key="idx" @click="goToDetail(order.id, order.orderNo)">
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
					
					<!-- 订单时间 -->
					<view class="order-time">
						<text class="time-label">{{ getTimeLabel(order) }}：</text>
						<text class="time-value">{{ getOrderTime(order) }}</text>
					</view>
					
					<!-- 订单操作按钮 -->
					<view class="order-actions">
						<button 
							v-for="action in getOrderActions(order.orderStatus)" 
							:key="action.value"
							class="action-btn"
							:class="action.type"
							@click="handleOrderAction(action.value, order)"
						>
							{{ action.label }}
						</button>
					</view>
				</view>
				
				<!-- 加载更多状态 -->
				<view v-if="orders.length > 0" class="load-more-container">
					<view v-if="loading" class="loading-more">
						<text class="loading-text">加载中...</text>
					</view>
					<view v-else-if="pageInfo.current >= pageInfo.pages" class="no-more">
						<text class="no-more-text">没有更多了</text>
					</view>
					<view v-else class="load-more">
						<text class="load-more-text">上拉加载更多</text>
					</view>
				</view>
			</template>
		</scroll-view>
	</view>
</template>

<script>
	import { fetchOrderList, fetchOrderCounts, fetchPaymentInfo, confirmReceive } from '../../utils/api.js';
	import { BASE_API } from '../../utils/config.js';
	
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
				// 滚动位置
				scrollLeft: 0,
				// 订单数据
				orders: [],
				// 加载状态
				loading: false,
				// 下拉刷新状态
				refreshing: false,
				// 分页信息
				pageInfo: {
					current: 1,
					size: 10,
					total: 0,
					pages: 0
				},
				// 订单状态与文本映射 - 根据新的OrderStatusEnum
				statusMap: {
					'1': '待付款',    // WAIT_PAY
					'2': '待发货',    // WAIT_SHIP
					'3': '待收货',    // WAIT_RECEIVE
					'4': '交易成功',  // COMPLETED
					'5': '交易关闭',  // CLOSED
					'6': '退款',      // REFUND
					'7': '售后'       // AFTER_SALE
				},
				// 退款状态映射
				refundStatusMap: {
					'0': '无',
					'1': '申请中',
					'2': '处理中',
					'3': '退款成功',
					'4': '已拒绝'
				},
				// 售后状态映射
				afterSaleStatusMap: {
					'0': '无',
					'1': '申请中',
					'2': '处理中',
					'3': '售后完成',
					'4': '已驳回'
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
			// 延迟执行滚动，确保DOM已经渲染完成
			this.$nextTick(() => {
				setTimeout(() => {
					this.scrollToActiveTab();
				}, 100);
			});
		},
		methods: {
			// 跳转到店铺首页
			goToShop() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			},
			
			// 跳转到订单详情
		goToDetail(orderId, orderNo) {
			uni.navigateTo({
				url: `/pages/order/detail?orderId=${orderId}`
			});
		},
			
			// 获取时间标签（根据订单状态显示不同标签）
			getTimeLabel(order) {
				// 订单状态 1: 待付款 -> 显示"创建时间"
				// 订单状态 2: 待发货 -> 显示"支付时间"
				// 其他状态 -> 显示"创建时间"
				if (order.orderStatus === 1) {
					return '创建时间';
				} else if (order.orderStatus === 2) {
					return '支付时间';
				} else {
					return '创建时间';
				}
			},
			
			// 获取订单时间（根据订单状态显示不同时间）
			getOrderTime(order) {
				// 订单状态 1: 待付款 -> 显示创建时间
				// 订单状态 2: 待发货 -> 显示支付成功时间
				if (order.orderStatus === 1) {
					// 待付款状态，显示创建时间
					return this.formatTime(order.createTime);
				} else if (order.orderStatus === 2) {
					// 待发货状态，显示支付成功时间
					// 如果有支付成功时间则显示，否则显示创建时间
					if (order.paySuccessTime) {
						return this.formatTime(order.paySuccessTime);
					} else {
						return this.formatTime(order.createTime);
					}
				} else {
					// 其他状态默认显示创建时间
					return this.formatTime(order.createTime);
				}
			},
			
			// 格式化时间
			formatTime(timeStr) {
				if (!timeStr) return '';
				// 将时间字符串转换为Date对象
				const date = new Date(timeStr);
				// 格式化为 yyyy-MM-dd HH:mm:ss 格式
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			},
			
			// 切换订单状态Tab
			switchTab(value) {
				this.activeTab = value;
				// 重置分页信息并重新获取数据
				this.fetchOrders(true);
				// 计算滚动位置，让当前选中的Tab居中显示
				this.$nextTick(() => {
					this.scrollToActiveTab();
				});
			},
			
			// 滚动到当前选中的Tab
			scrollToActiveTab() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.status-tabs').boundingClientRect((containerRect) => {
					query.selectAll('.tab-item').boundingClientRect((tabRects) => {
						if (containerRect && tabRects && tabRects[this.activeTab]) {
							const activeTabRect = tabRects[this.activeTab];
							const containerWidth = containerRect.width;
							const activeTabWidth = activeTabRect.width;
							const activeTabLeft = activeTabRect.left - containerRect.left;
							
							// 计算目标滚动位置，让当前Tab居中
							const targetScrollLeft = activeTabLeft - (containerWidth - activeTabWidth) / 2;
							
							this.scrollLeft = Math.max(0, targetScrollLeft);
						}
					}).exec();
				}).exec();
			},
			
			// 获取订单数据
			async fetchOrders(isRefresh = false) {
				if (isRefresh) {
					this.pageInfo.current = 1;
					this.orders = [];
				}
				
				this.loading = true;
				try {
					// 调用真实接口获取订单数据
					const response = await fetchOrderList(this.activeTab, this.pageInfo.current, this.pageInfo.size);
					
					// 更新分页信息
					this.pageInfo = {
						current: response.current,
						size: response.size,
						total: response.total,
						pages: response.pages
					};
					
					// 处理订单数据，添加模拟的商品信息和店铺信息
					const processedOrders = this.processOrderData(response.records);
					
					// 如果是第一页，直接替换数据；否则追加数据
					if (this.pageInfo.current === 1) {
						this.orders = processedOrders;
					} else {
						this.orders = [...this.orders, ...processedOrders];
					}
					
				} catch (error) {
					console.error('获取订单列表失败:', error);
					
					// 如果接口调用失败，使用模拟数据
					if (error.message === 'AUTH_401') {
						// 认证失败，不需要显示错误提示，会自动跳转登录
						return;
					}
					
					// 其他错误，显示错误提示并使用模拟数据
					uni.showToast({
						title: '获取订单失败，使用模拟数据',
						icon: 'none'
					});
					
					// 使用模拟数据
					this.orders = this.generateMockOrders();
					this.pageInfo = {
						current: 1,
						size: 10,
						total: this.orders.length,
						pages: 1
					};
				} finally {
					this.loading = false;
					if (isRefresh) {
						this.refreshing = false;
					}
				}
			},
			
			// 下拉刷新
			onRefresh() {
				this.refreshing = true;
				this.fetchOrders(true);
			},
			
			// 加载更多
			loadMore() {
				if (this.loading || this.pageInfo.current >= this.pageInfo.pages) {
					return;
				}
				this.pageInfo.current++;
				this.fetchOrders();
			},
			
			// 处理订单数据，根据新的数据结构处理商品信息
		processOrderData(orderRecords) {
			return orderRecords.map(order => {
				// 根据订单状态和退款、售后状态确定显示文本
				let statusText = this.statusMap[order.orderStatus] || '未知状态';
				
				// 处理退款/售后状态的显示
				if (order.refundStatus && order.refundStatus !== '0') {
					statusText = this.refundStatusMap[order.refundStatus] || '退款中';
				} else if (order.afterSaleStatus && order.afterSaleStatus !== '0') {
					statusText = this.afterSaleStatusMap[order.afterSaleStatus] || '售后中';
				} else if (order.orderStatus === '4' && !order.reviewed) {
					statusText = '待评价';
				} else if (order.orderStatus === '4' && order.reviewed) {
					statusText = '已完成';
				}
				
				// 处理商品信息，根据新的数据结构
				const processedGoods = order.items ? order.items.map(item => ({
					id: item.spuId,
					spuId: item.spuId,
					skuId: item.skuId,
					name: item.spuName,
					spec: item.specs && item.specs.length > 0 
						? item.specs.map(spec => `${spec.specName}:${spec.optName}`).join(';')
						: item.skuName || '',
					price: parseFloat(item.price),
					quantity: parseInt(item.quantity),
					image: item.spuMainImage && item.spuMainImage.trim() !== '' 
						? `${BASE_API}/public/storage/preview?fileKey=${item.spuMainImage}`
						: 'https://via.placeholder.com/100'
				})) : [];
				
				// 计算总数量
				const totalQuantity = processedGoods.reduce((total, item) => total + item.quantity, 0);
				
				// 从items数组中重新计算商品总价
				const calculatedTotalPrice = processedGoods.reduce((total, item) => total + (item.price * item.quantity), 0);
				
				return {
					id: order.orderId,
					orderNo: order.orderNo,
					shopId: order.shopId,
					shopName: order.shopName || `店铺${order.shopId}`,
					orderStatus: parseInt(order.orderStatus),
					statusText: statusText,
					totalPrice: calculatedTotalPrice, // 使用计算得出的价格
					totalQuantity: totalQuantity,
					shippingFee: parseFloat(order.shippingFee || 0),
					createTime: order.createTime,
					paySuccessTime: order.paySuccessTime, // 支付成功时间
					refundStatus: order.refundStatus,
					afterSaleStatus: order.afterSaleStatus,
					reviewed: order.reviewed,
					goods: processedGoods
				};
			});
		},
			
			// 生成模拟订单数据，使用新的数据结构
			generateMockOrders() {
				const mockOrders = [
					// 待付款订单
					{
						id: 1,
						shopId: 1,
						shopName: '时尚精品店',
						orderStatus: 1,
						statusText: '待付款',
						refundStatus: '0',
						afterSaleStatus: '0',
						shippingFee: 10.00,
						createTime: '2025-12-22 14:30:00',
						items: [
							{
								spuId: 101,
								spuName: '时尚连衣裙',
								spuMainImage: 'dress001',
								skuId: 1001,
								skuName: '红色-M',
								specs: [
									{ specName: '颜色', optName: '红色' },
									{ specName: '尺码', optName: 'M' }
								],
								price: 99.50,
								quantity: 2
							}
						]
					},
					{
						id: 2,
						shopId: 2,
						shopName: '数码商城',
						orderStatus: 1,
						statusText: '待付款',
						refundStatus: '0',
						afterSaleStatus: '0',
						shippingFee: 0.00,
						createTime: '2025-12-22 10:15:00',
						items: [
							{
								spuId: 201,
								spuName: '智能手机',
								spuMainImage: 'phone001',
								skuId: 2001,
								skuName: '黑色-256GB',
								specs: [
									{ specName: '颜色', optName: '黑色' },
									{ specName: '内存', optName: '256GB' }
								],
								price: 2999.00,
								quantity: 2
							}
						]
					},
					// 待发货订单
					{
						id: 3,
						shopId: 3,
						shopName: '家居生活馆',
						orderStatus: 2,
						statusText: '待发货',
						refundStatus: '0',
						afterSaleStatus: '0',
						shippingFee: 0.00,
						createTime: '2025-12-21 16:45:00',
						paySuccessTime: '2025-12-21 17:00:00', // 支付成功时间
						items: [
							{
								spuId: 301,
								spuName: '舒适枕头',
								spuMainImage: 'pillow001',
								skuId: 3001,
								skuName: '记忆棉-单个装',
								specs: [
									{ specName: '材质', optName: '记忆棉' },
									{ specName: '规格', optName: '单个装' }
								],
								price: 299.00,
								quantity: 2
							}
						]
					},
					// 待收货订单
					{
						id: 4,
						shopId: 4,
						shopName: '运动户外店',
						orderStatus: 3,
						statusText: '待收货',
						refundStatus: '0',
						afterSaleStatus: '0',
						shippingFee: 15.00,
						createTime: '2025-12-20 09:30:00',
						items: [
							{
								spuId: 401,
								spuName: '运动鞋',
								spuMainImage: 'shoes001',
								skuId: 4001,
								skuName: '白色-42码',
								specs: [
									{ specName: '颜色', optName: '白色' },
									{ specName: '尺码', optName: '42码' }
								],
								price: 399.00,
								quantity: 1
							},
							{
								spuId: 402,
								spuName: '运动袜',
								spuMainImage: 'socks001',
								skuId: 4002,
								skuName: '黑色-均码',
								specs: [
									{ specName: '颜色', optName: '黑色' },
									{ specName: '尺码', optName: '均码' }
								],
								price: 29.00,
								quantity: 2
							}
						]
					},
					// 待评价订单
					{
						id: 5,
						shopId: 5,
						shopName: '美妆护肤店',
						orderStatus: 4,
						statusText: '待评价',
						refundStatus: '0',
						afterSaleStatus: '0',
						shippingFee: 0.00,
						createTime: '2025-12-19 14:20:00',
						reviewed: false,
						items: [
							{
								spuId: 501,
								spuName: '护肤套装',
								spuMainImage: 'skincare001',
								skuId: 5001,
								skuName: '补水-套装',
								specs: [
									{ specName: '功效', optName: '补水' },
									{ specName: '规格', optName: '套装' }
								],
								price: 258.00,
								quantity: 1
							}
						]
					}
				];
				
				// 根据当前选中的Tab过滤订单
				let filteredOrders = mockOrders;
				if (this.activeTab === 1) {
					filteredOrders = mockOrders.filter(order => order.orderStatus === 1);
				} else if (this.activeTab === 2) {
					filteredOrders = mockOrders.filter(order => order.orderStatus === 2);
				} else if (this.activeTab === 3) {
					filteredOrders = mockOrders.filter(order => order.orderStatus === 3);
				} else if (this.activeTab === 5) {
					filteredOrders = mockOrders.filter(order => order.orderStatus === 4 && !order.reviewed);
				}
				
				return this.processOrderData(filteredOrders);
			},
			
			// 获取订单操作按钮
			getOrderActions(status) {
				const actions = [];
				
				switch (status) {
					case 1: // 待付款 (WAIT_PAY)
						actions.push(
							{ label: '取消订单', value: 'cancel', type: 'default' },
							{ label: '付款', value: 'pay', type: 'primary' }
						);
						break;
					case 2: // 待发货 (WAIT_SHIP)
						actions.push(
							{ label: '提醒发货', value: 'remind', type: 'default' }
						);
						break;
					case 3: // 待收货 (WAIT_RECEIVE)
						actions.push(
							{ label: '查看物流', value: 'logistics', type: 'default' },
							{ label: '确认收货', value: 'confirm', type: 'primary' }
						);
						break;
					case 4: // 交易成功 (COMPLETED)
						actions.push(
							{ label: '删除订单', value: 'delete', type: 'default' },
							{ label: '去评价', value: 'comment', type: 'primary' },
							{ label: '再次购买', value: 'rebuy', type: 'default' }
						);
						break;
					case 5: // 交易关闭 (CLOSED)
						actions.push(
							{ label: '删除订单', value: 'delete', type: 'default' },
							{ label: '再次购买', value: 'rebuy', type: 'default' }
						);
						break;
					case 6: // 退款 (REFUND)
						actions.push(
							{ label: '退款详情', value: 'refundDetail', type: 'primary' }
						);
						break;
					case 7: // 售后 (AFTER_SALE)
						actions.push(
							{ label: '售后详情', value: 'afterSaleDetail', type: 'primary' }
						);
						break;
				}
				
				return actions;
			},
			
			// 生成随机字符串函数
			generateNonceStr(length = 32) {
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				let result = '';
				for (let i = 0; i < length; i++) {
					result += chars.charAt(Math.floor(Math.random() * chars.length));
				}
				return result;
			},
			
			// 处理订单操作
			handleOrderAction(action, order) {
				switch (action) {
					case 'pay':
						// 去付款 - 集成微信支付
						uni.showLoading({
							title: '加载支付信息中...'
						});
						
						// 调用接口获取支付信息
						fetchPaymentInfo(order.orderNo).then(paymentData => {
							uni.hideLoading();
							
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
					
							// 调用微信支付
							uni.requestPayment({
								...payParams,
								success: (res) => {
									// 支付成功处理
									console.log('支付成功', res);
									uni.showToast({
										title: '支付成功',
										icon: 'success'
									});
									// 跳转到支付结果页面，传递支付成功状态
									uni.navigateTo({
										url: `/pages/order/pay-result?orderNo=${order.orderNo}&payResultType=success`
									});
								},
								fail: (err) => {
									// 支付失败处理
									console.log('支付失败', err);
									if (err.errMsg === 'requestPayment:fail cancel') {
										// 用户取消支付
										uni.navigateTo({
											url: `/pages/order/pay-result?orderNo=${order.orderNo}&payResultType=cancel`
										});
									} else {
										// 支付失败，启动轮询
										uni.navigateTo({
											url: `/pages/order/pay-result?orderNo=${order.orderNo}&payResultType=fail`
										});
									}
								}
							});
						}).catch(err => {
							uni.hideLoading();
							console.error('获取支付信息失败:', err);
							uni.showToast({
								title: '获取支付信息失败，请稍后重试',
								icon: 'none'
							});
						});
						break;
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
					case 'remind':
						// 提醒发货
						uni.showToast({
							title: '已提醒商家发货',
							icon: 'success'
						});
						break;
					case 'confirm':
					// 确认收货
					uni.showModal({
						title: '确认收货',
						content: '请确认您已收到商品',
						confirmText: '确认收货',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								// 调用确认收货接口
								uni.showLoading({
									title: '处理中...'
								});
								confirmReceive(order.orderNo)
									.then(() => {
										uni.hideLoading();
										uni.showToast({
											title: '已确认收货',
											icon: 'success'
										});
										// 重新获取订单列表
										this.fetchOrders();
									})
									.catch(error => {
										uni.hideLoading();
										console.error('确认收货失败:', error);
										uni.showToast({
											title: error.message || '确认收货失败',
											icon: 'none'
										});
									});
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
									uni.showToast({
										title: '订单已删除',
										icon: 'success'
									});
									// 重新获取订单列表
									this.fetchOrders();
								}
							}
						});
						break;
					case 'rebuy':
						// 再次购买
						uni.showToast({
							title: '再次购买功能开发中',
							icon: 'none'
						});
						break;
					
					case 'refundDetail':
						// 退款详情
						uni.navigateTo({
							url: `/pages/order/refund-detail?id=${order.id}`
						});
						break;
					case 'afterSaleDetail':
						// 售后详情
						uni.navigateTo({
							url: `/pages/order/after-sale-detail?id=${order.id}`
						});
						break;
					case 'logistics':
						// 查看物流
						uni.showToast({
							title: '物流查询功能待实现',
							icon: 'none'
						});
						break;
					case 'comment':
						// 去评价
						uni.showToast({
							title: '评价功能待实现',
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

	/* 订单状态筛选Tab容器 */
	.status-tabs-container {
		height: 80rpx;
		background-color: #fff;
		margin-top: 0;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: sticky;
		top: 0;
		z-index: 90;
		white-space: nowrap;
	}

	/* 订单状态筛选Tab */
	.status-tabs {
		display: flex;
		align-items: center;
		height: 100%;
		min-width: 100%;
	}

	.tab-item {
		flex: none;
		min-width: 120rpx;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
		padding: 0 20rpx;
		box-sizing: border-box;
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

	/* 加载更多状态 */
	.load-more-container {
		padding: 20rpx 0;
		text-align: center;
	}

	.loading-more,
	.no-more,
	.load-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx 0;
	}

	.loading-text,
	.no-more-text,
	.load-more-text {
		font-size: 26rpx;
		color: #999;
	}

	.loading-text {
		color: #3cc51f;
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

	/* 订单时间 */
	.order-time {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 0 20rpx 20rpx 20rpx;
		font-size: 26rpx;
		color: #999;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.time-label {
		color: #999;
	}

	.time-value {
		color: #666;
		margin-left: 10rpx;
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
</style>