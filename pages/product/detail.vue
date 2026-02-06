<template>
	<view class="product-detail-container">
		
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
            
			<!-- 评价区域 -->
            <view class="review-section" v-if="reviewSummary.totalCount > 0">
                <view class="review-header">
                    <view class="review-title">
                        <text class="title-text">评价 ({{ reviewSummary.totalCount }})</text>
                        <text class="good-rate">好评度 {{ reviewSummary.goodRate }}%</text>
                    </view>
                </view>
                
                <view class="review-list">
                    <view class="review-item" v-for="(item, index) in reviewSummary.topReviews" :key="index">
                        <view class="rp-user">
                            <image :src="item.userAvatar || 'https://via.placeholder.com/40'" class="rp-avatar"></image>
                            <text class="rp-name">{{ item.userName }}</text>
                            <text class="rp-time">{{ item.createTime }}</text>
                        </view>
                        <view class="rp-content">
                            {{ item.content }}
                        </view>
                    </view>
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
						<text class="popup-price">￥{{ getCurrentSkuInfo().price !== null ? getCurrentSkuInfo().price : '无价格' }}</text>
						<text class="popup-stock" v-if="getCurrentSkuInfo().stock > 0">库存: {{ getCurrentSkuInfo().stock }}件</text>
						<text class="popup-stock out-of-stock" v-else>无货</text>
						<text class="popup-spec">已选: {{ getSelectedSpecDesc() }}</text>
					</view>
				</view>
				<view class="spec-options" v-for="spec in specs" :key="spec.specId">
					<text class="spec-title">{{ spec.specName }}</text>
					<view class="spec-list">
						<view 
								class="spec-item" 
								:class="{ 
									active: selectedSpecs[spec.specId] === opt.optId,
									disabled: isOptionDisabled(spec.specId, opt.optId)
								}"
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
						<text class="popup-price">￥{{ getCurrentSkuInfo().price !== null ? getCurrentSkuInfo().price : '无价格' }}</text>
						<text class="popup-stock" v-if="getCurrentSkuInfo().stock > 0">库存: {{ getCurrentSkuInfo().stock }}件</text>
						<text class="popup-stock out-of-stock" v-else>无货</text>
						<text class="popup-spec">已选: {{ getSelectedSpecDesc() }}</text>
					</view>
				</view>
				<view class="spec-options" v-for="spec in specs" :key="spec.specId">
					<text class="spec-title">{{ spec.specName }}</text>
					<view class="spec-list">
						<view 
							class="spec-item" 
							:class="{ 
								active: selectedSpecs[spec.specId] === opt.optId,
								disabled: isOptionDisabled(spec.specId, opt.optId)
							}"
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
				<view class="confirm-btn" @click="confirmAddToCart">{{ purchaseMode === 'buy' ? '立即购买' : '加入购物车' }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getUserId, handleAuthFailure, authRequest, getToken } from '@/utils/auth.js'
	import { fetchReviewSummary } from '@/utils/api.js'
    import { BASE_API } from '@/utils/config.js'

export default {
		data() {
				return {
					showSpec: false,
					showCartPopup: false,
					purchaseMode: 'cart', // 'cart' 表示加入购物车，'buy' 表示立即购买
					product: {},
					banners: [],
					specs: [], // 商品规格数据
					skuOptIds: [], // SKU配置的选项ID
					skus: [], // SKU数据，包含库存和价格信息
					selectedSpecs: {}, // 选中的规格
					isCollected: false, // 收藏状态
					selectedQuantity: 1,
					stock: 100, // 示例库存
					reviewSummary: { // 评价概览数据
						totalCount: 0,
						goodRate: 100,
						topReviews: []
					},
					shop: {} // 店铺信息
				}
			},
		methods: {
            loadReviewSummary(productId) {
                fetchReviewSummary(productId).then(data => {
                    this.reviewSummary = data;
                });
            },
				goBack() {
					uni.navigateBack();
				},
				getToken() {
					return getToken();
				},
				fetchProductDetail(productId) {
				const baseApi = BASE_API;
				console.log('detail.productId: ' + productId)
				// 获取token
				const token = this.getToken();
				uni.request({
					url: `${baseApi}/app/product/detail?id=${productId}`,
					method: 'GET',
					header: {
						'Authorization': token ? `Bearer ${token}` : '',
						'Content-Type': 'application/json'
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data.code === 0) {
							const data = res.data.data;
							this.product = data.product;
							
							// 处理banner图片URL
							this.banners = data.banners.map(item => {
								const baseApi = BASE_API;
								return item && item.trim() !== '' ? (() => {
									return `${baseApi}/public/storage/preview?fileKey=${item}`;
								})() : '';
							});
							
							// 处理规格数据
							this.specs = data.specs || [];
							// 保存skuOptIds用于灰化处理
							this.skuOptIds = data.skuOptIds || [];
							// 保存skus数据用于获取库存和价格
							this.skus = data.skus || [];
							// 保存店铺信息
							this.shop = data.shop || {};
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
					// 跳转到客服聊天页面，传递店铺ID和商家ID
					const shopId = this.shop.shopId || '1';
					const mchId = this.shop.mchId || '1';
					
					// 调用初始化会话接口获取会话ID
					uni.showLoading({ title: '初始化会话...' });
					uni.request({
						url: `${BASE_API}/app/csConversation/init`,
						method: 'POST',
						header: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${getToken()}`
						},
						data: {
							shopId: shopId
						},
						success: (res) => {
							uni.hideLoading();
							if (res.statusCode === 200 && res.data.code === 0) {
								const conversationId = res.data.data.id;
								console.log('会话初始化成功:', conversationId);
								// 跳转到客服聊天页面，传递会话ID、店铺ID和商家ID
								uni.navigateTo({
									url: `/pages/customer-service/index?shopId=${shopId}&mchId=${mchId}&conversationId=${conversationId}`
								});
							} else {
								console.error('初始化会话失败:', res.data.message);
								uni.showToast({
									title: '初始化会话失败，请重试',
									icon: 'none'
								});
							}
						},
						fail: (error) => {
							uni.hideLoading();
							console.error('请求初始化会话失败:', error);
							uni.showToast({
								title: '网络错误，请检查网络连接',
								icon: 'none'
							});
						}
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
				// 设置为购物车模式并显示购物车弹窗
				this.purchaseMode = 'cart';
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
				
				// 获取当前选中的SKU信息
				const currentSkuInfo = this.getCurrentSkuInfo();
				
				// 检查是否有有效的SKU ID
				if (!currentSkuInfo.id) {
					uni.showToast({
						title: '未找到有效的商品规格',
						icon: 'none'
					});
					return;
				}
				
				// 检查库存
				if (this.selectedQuantity > currentSkuInfo.stock) {
					uni.showToast({
						title: '购买数量超过库存',
						icon: 'none'
					});
					return;
				}
				
				// 根据purchaseMode决定调用哪个接口
				if (this.purchaseMode === 'buy') {
					// 调用立即购买接口
					const requestData = {
						url: `${BASE_API}/app/order/submit`,
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						data: {
							items: [{
								skuId: currentSkuInfo.id,
								quantity: this.selectedQuantity
							}]
						}
					};
					
					authRequest(
						requestData,
						(res) => {
							if (res.data.code === 0) {
								uni.showToast({
									title: '订单提交成功',
									icon: 'success'
								});
								// 关闭购物车弹窗
								this.closeCartPopup();
								// 可以跳转到订单确认页面
								// uni.navigateTo({
								//   url: '/pages/order/confirm'
								// });
							} else {
								uni.showToast({
									title: res.data.message || '订单提交失败',
									icon: 'none'
								});
							}
						},
						(err) => {
							uni.showToast({
								title: '请求失败，请稍后重试',
								icon: 'none'
							});
							console.error('立即购买请求失败:', err);
						}
					);
				} else {
					// 调用加入购物车接口
					const requestData = {
						url: `${BASE_API}/app/cartItem/create`,
						method: 'POST',
						header: {
							'Content-Type': 'application/json'
						},
						data: {
							skuId: currentSkuInfo.id,
							quantity: this.selectedQuantity
						}
					};
					
					authRequest(
						requestData,
						(res) => {
							if (res.data.code === 0) {
								uni.showToast({
									title: '已添加到购物车',
									icon: 'success'
								});
								// 关闭购物车弹窗
								this.closeCartPopup();
							} else {
								uni.showToast({
									title: res.data.message || '添加购物车失败',
									icon: 'none'
								});
							}
						},
						(err) => {
							uni.showToast({
								title: '请求失败，请稍后重试',
								icon: 'none'
							});
							console.error('加入购物车请求失败:', err);
						}
					);
				}
			},
			buyNow() {
				// 设置为购买模式并显示规格选择弹窗
				this.purchaseMode = 'buy';
				this.showSpec = true;
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
					url: `${BASE_API}/app/productFavorites/add`,
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
					} else if (res.data.code === 401) {
						// 认证失败，跳转到登录页面
						handleAuthFailure()
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
					url: `${BASE_API}/app/productFavorites/remove`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						"id": this.product.id
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
					} else if (res.data.code === 401) {
						// 认证失败，跳转到登录页面
						handleAuthFailure()
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
					url: `${BASE_API}/app/productFavorites/status?spuId=${this.product.id}`,
					method: 'GET'
				}, (res) => {
					if (res.statusCode === 200 && res.data.code === 0) {
						this.isCollected = res.data.data.result;
					} else if (res.statusCode === 401) {
						handleAuthFailure();
					} else {
						console.error('检查收藏状态失败:', res.data.message);
					}
				},
					(err) => {
						console.error('检查收藏状态请求失败:', err);
					}
				);
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
				// 允许选择任何选项，包括灰化选项
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
			// 判断规格选项是否应该灰化
			isOptionDisabled(optId) {
				// 如果skuOptIds为空，或者该选项在skuOptIds中，则不禁用
				return this.skuOptIds.length > 0 && !this.skuOptIds.includes(optId);
			},
			// 获取当前选中规格组合的SKU信息
			getCurrentSkuInfo() {
				// 获取所有选中的选项ID
				const selectedOptIds = Object.values(this.selectedSpecs).filter(id => id);
				
				// 检查skus数组是否存在且为数组
				if (!Array.isArray(this.skus)) {
					return {
						id: null,
						price: null,
						stock: 0
					};
				}
				
				// 将选中的选项ID转换为字符串数组并排序，用于与specCode比较
				const selectedOptIdsSorted = selectedOptIds.map(id => id.toString()).sort();
				
				// 在skus数组中查找匹配的SKU
				const matchedSku = this.skus.find(sku => {
					// 检查sku是否有specCode属性
					if (!sku.specCode) {
						return false;
					}
					// 将sku的specCode用'-'拆分并排序
					const skuOptIdsSorted = sku.specCode.split('-').sort();
					// 检查选中的选项是否完全匹配sku的specCode（顺序无关）
					return selectedOptIdsSorted.length === skuOptIdsSorted.length && 
						   selectedOptIdsSorted.every(id => skuOptIdsSorted.includes(id));
				});
				
				// 如果找到了匹配的SKU，返回其库存、价格和ID信息
				if (matchedSku) {
					return {
						id: matchedSku.id,
						price: matchedSku.price,
						stock: matchedSku.stock
					};
				}
				
				// 如果没有找到匹配的SKU，返回空信息
				return {
					id: null,
					price: null,
					stock: 0
				};
			},
			
			// 检查指定规格选项是否应该被禁用（级联置灰）
			isOptionDisabled(specId, optId) {
				// 创建一个临时的选中状态，包含当前选中项和要检查的选项
				const tempSelectedSpecs = { ...this.selectedSpecs };
				tempSelectedSpecs[specId] = optId;
				
				// 获取当前临时选中的所有选项ID
				const selectedOptIds = Object.values(tempSelectedSpecs).filter(id => id);
				
				// 检查skus数组是否存在且为数组
				if (!Array.isArray(this.skus)) {
					return true; // 如果没有skus数据，则禁用所有选项
				}
				
				// 将选中的选项ID转换为字符串数组并排序
				const selectedOptIdsSorted = selectedOptIds.map(id => id.toString()).sort();
				
				// 检查是否存在任何SKU包含当前选中的所有选项
				const hasMatchingSku = this.skus.some(sku => {
					// 检查sku是否有specCode属性
					if (!sku.specCode) {
						return false;
					}
					// 将sku的specCode用'-'拆分并排序
					const skuOptIdsSorted = sku.specCode.split('-').sort();
					// 检查选中的选项是否都被包含在sku的specCode中
					return selectedOptIdsSorted.every(id => skuOptIdsSorted.includes(id));
				});
				
				// 如果没有匹配的SKU，则禁用该选项
				return !hasMatchingSku;
			},
				decreaseQuantity() {
					// 减少数量逻辑
					if (this.selectedQuantity > 1) {
						this.selectedQuantity--;
					}
				},
				increaseQuantity() {
					// 增加数量逻辑，受限于当前SKU的库存
					const currentStock = this.getCurrentSkuInfo().stock;
					if (this.selectedQuantity < currentStock) {
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
					
					// 获取当前选中的SKU信息
					const currentSkuInfo = this.getCurrentSkuInfo();
					
					// 检查是否有有效的SKU ID
					if (!currentSkuInfo.id) {
						uni.showToast({
							title: '未找到有效的商品规格',
							icon: 'none'
						});
						return;
					}
					
					// 检查库存
					if (this.selectedQuantity > currentSkuInfo.stock) {
						uni.showToast({
							title: '购买数量超过库存',
							icon: 'none'
						});
						return;
					}
					
					// 确认规格选择
					this.closeSpecPopup();
					
					// 如果是购买模式，则跳转到下单页面
					if (this.purchaseMode === 'buy') {
						// 跳转到订单确认页面，并传递商品信息
						uni.navigateTo({
							url: `/pages/order/confirm?skuId=${currentSkuInfo.id}&quantity=${this.selectedQuantity}`
						});
					} else {
						uni.showToast({
							title: '已选择规格',
							icon: 'success'
						});
					}
				}
			},
			// 在页面加载时获取商品详情
			onLoad(options) {
				console.log(options);
				// 从路由参数中获取商品ID
				const productId = options.productId;
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
		position: relative;
	}
	
	.detail-scroll {
		height: calc(100vh - 200rpx);
		margin-top: 0rpx;
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
    
    .review-section {
        margin-top: 20rpx;
        padding: 20rpx;
        background-color: #fff;
    }
    
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20rpx;
    }
    
    .review-title {
        display: flex;
        align-items: center;
    }
    
    .title-text {
        font-size: 30rpx;
        font-weight: bold;
        margin-right: 20rpx;
    }
    
    .good-rate {
        font-size: 24rpx;
        color: #ff5000;
        background-color: #fff1eb;
        padding: 2rpx 10rpx;
        border-radius: 20rpx;
    }
    
    .review-more {
        font-size: 24rpx;
        color: #999;
        display: flex;
        align-items: center;
    }
    
    .arrow {
        margin-left: 6rpx;
    }
    
    .review-preview {
        
    }
    
    .rp-user {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
    }
    
    .rp-avatar {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        margin-right: 10rpx;
        background-color: #eee;
    }
    
    .rp-name {
        font-size: 24rpx;
        color: #666;
    }
    
    .rp-content {
        font-size: 26rpx;
        color: #333;
        line-height: 1.4;
    }
    
    .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
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
	
	.spec-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: #e0e0e0; /* 加深的灰色背景 */
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