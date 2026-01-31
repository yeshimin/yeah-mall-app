<template>
	<view class="evaluate-container">
		<!-- 商品评价 -->
		<view class="goods-reviews" v-if="order && order.shopProducts">
			<view class="goods-review-item" v-for="(item, index) in order.shopProducts" :key="index">
				<view class="goods-info">
					<image class="goods-image" :src="item.spuMainImage ? getImageUrl(item.spuMainImage) : 'https://via.placeholder.com/100'" mode="aspectFill"></image>
					<view class="goods-details">
						<text class="goods-name">{{ item.spuName }}</text>
						<text class="goods-spec" v-if="item.specs">{{ getSpecString(item.specs) }}</text>
					</view>
				</view>
			
			<view class="review-form">
				<!-- 综合评价 -->
				<view class="rate-section">
					<text class="label">综合评价</text>
					<view class="rate-options">
						<view 
							class="rate-option" 
							:class="{ active: form.items[index] && form.items[index].overallRating === 1 }"
							@click="setGoodsRate(index, 1)"
						>
							<text class="rate-text">差评</text>
						</view>
						<view 
							class="rate-option" 
							:class="{ active: form.items[index] && form.items[index].overallRating === 3 }"
							@click="setGoodsRate(index, 3)"
						>
							<text class="rate-text">中评</text>
						</view>
						<view 
							class="rate-option" 
							:class="{ active: form.items[index] && form.items[index].overallRating === 5 }"
							@click="setGoodsRate(index, 5)"
						>
							<text class="rate-text">好评</text>
						</view>
					</view>
				</view>

				<!-- 评价内容 -->
				<view class="content-section">
					<textarea 
						class="review-textarea" 
						v-model="form.items[index].content" 
						placeholder="宝贝满足你的期待吗？说说你的使用心得，分享给想买的他们吧" 
						maxlength="500"
					></textarea>
					<view class="word-count">{{ form.items[index] ? form.items[index].content.length : 0 }}/500</view>
				</view>

				<!-- 图片上传 -->
				<view class="upload-section">
					<view class="upload-list">
						<view 
							class="upload-item" 
							v-for="(img, imgIndex) in (form.items[index] ? form.items[index].images : [])" 
							:key="imgIndex"
						>
							<image :src="getImageSrc(img)" mode="aspectFill" class="upload-img"></image>
							<view class="delete-btn" @click="deleteGoodsImage(index, imgIndex)">×</view>
						</view>
						<view class="upload-btn" @click="chooseGoodsImage(index)" v-if="form.items[index] && form.items[index].images.length < 6">
							<text class="camera-icon">📷</text>
							<text class="upload-text">添加图片</text>
							<text class="upload-limit">{{ form.items[index] ? form.items[index].images.length : 0 }}/6</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="divider" v-if="index < order.shopProducts.length - 1"></view>
			</view>
		</view>

		<!-- 订单评价 -->
		<view class="order-review">
			<view class="sub-rates">
				<view class="rate-row">
							<text class="label">描述相符</text>
							<view class="stars sm">
								<text 
									v-for="i in 5" 
									:key="i" 
									class="star-icon" 
									:class="{ active: form.descriptionRating >= i }"
									@click="setRate('descriptionRating', i)"
								>
									★
								</text>
							</view>
							<text class="rate-score">{{ form.descriptionRating }}分</text>
						</view>
						<view class="rate-row">
							<text class="label">物流服务</text>
							<view class="stars sm">
								<text 
									v-for="i in 5" 
									:key="i" 
									class="star-icon" 
									:class="{ active: form.deliveryRating >= i }"
									@click="setRate('deliveryRating', i)"
								>
									★
								</text>
							</view>
							<text class="rate-score">{{ form.deliveryRating }}分</text>
						</view>
						<view class="rate-row">
							<text class="label">服务态度</text>
							<view class="stars sm">
								<text 
									v-for="i in 5" 
									:key="i" 
									class="star-icon" 
									:class="{ active: form.serviceRating >= i }"
									@click="setRate('serviceRating', i)"
								>
									★
								</text>
							</view>
							<text class="rate-score">{{ form.serviceRating }}分</text>
						</view>
			</view>

			<!-- 匿名评价 -->
			<view class="anonymous-section">
				<view class="anonymous-left">
					<checkbox-group @change="toggleAnonymous">
						<label class="checkbox-label">
							<checkbox :value="'1'" :checked="form.isAnonymous" color="#3cc51f" style="transform:scale(0.8)" />
							<text>匿名评价</text>
						</label>
					</checkbox-group>
				</view>
				<text class="anonymous-tip">匿名后你的头像和昵称将对其他用户隐藏</text>
			</view>
		</view>

		<view class="submit-btn-container">
			<button class="submit-btn" @click="submit">发布评价</button>
		</view>
	</view>
</template>

<script>
	import { fetchOrderDetail, submitReview, uploadImage } from '@/utils/api.js';
	import { BASE_API } from '@/utils/config.js';

	export default {
		data() {
			return {
				orderId: '',
				order: null,
				form: {
					descriptionRating: 5,
					deliveryRating: 5,
					serviceRating: 5,
					isAnonymous: false,
					items: []
				}
			};
		},
		onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId;
				this.loadOrderDetail();
			} else {
				uni.showToast({
					title: '订单参数错误',
					icon: 'none'
				});
				setTimeout(() => uni.navigateBack(), 1500);
			}
		},
		methods: {
			getImageUrl(path) {
			if (!path) return '';
			if (path.startsWith('http')) return path;
			// 使用预览 API 加载展示商品图片
			return `${BASE_API}/public/storage/preview?fileKey=${path}`;
		},
			getSpecString(specs) {
				if (!specs || !specs.length) return '';
				return specs.map(s => `${s.specName}:${s.optName}`).join('; ');
			},
			// 获取图片显示路径
		getImageSrc(img) {
			// 始终返回原始路径，因为：
			// 1. 对于刚选择的图片，它是本地临时路径
			// 2. 对于已上传的图片，我们仍然在表单中保留本地临时路径
			// 3. 提交评价时会将本地路径替换为fileKey
			// 注意：用户上传的图片不要使用预览 API
			return img;
		},
			loadOrderDetail() {
				uni.showLoading({ title: '加载中...' });
				fetchOrderDetail(this.orderId).then(data => {
					this.order = data;
					this.initGoodsReviews();
					uni.hideLoading();
				}).catch(err => {
					uni.hideLoading();
					// 如果接口失败，使用mock数据兜底（因为fetchOrderDetail真实接口可能还未完全实现返回items）
					console.error('获取订单详情失败', err);
				    // 模拟数据用于演示
				    this.order = {
				        items: [
				            {
				                spuId: '1',
				                skuId: '1',
				                spuName: '商品加载失败演示',
				                spuMainImage: '',
				                specs: [{specName:'演示', optName:'规格'}]
				            },
				            {
				                spuId: '2',
				                skuId: '2',
				                spuName: '第二个商品演示',
				                spuMainImage: '',
				                specs: [{specName:'颜色', optName:'红色'}]
				            }
				        ]
				    };
					this.initGoodsReviews();
				});
			},
			initGoodsReviews() {
				if (this.order && this.order.shopProducts) {
					this.form.items = this.order.shopProducts.map(item => ({
						orderItemId: item.orderItemId || item.id || '',
						overallRating: 5, // 默认好评
						content: '',
						images: []
					}));
				}
			},
			setRate(field, value) {
				this.form[field] = value;
			},
			getRateText(rate) {
				const texts = ['非常差', '差', '一般', '好', '非常好'];
				return texts[rate - 1] || '';
			},
			chooseImage() {
				uni.chooseImage({
					count: 6 - this.form.images.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 实际开发中这里需要上传图片到服务器，这里仅做本地预览模拟
						this.form.images = [...this.form.images, ...res.tempFilePaths];
					}
				});
			},
			setGoodsRate(index, value) {
				if (this.form.items[index]) {
					this.form.items[index].overallRating = value;
				}
			},
			chooseGoodsImage(index) {
				if (!this.form.items[index]) return;
				
				uni.chooseImage({
					count: 6 - this.form.items[index].images.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (!this.form.items[index]) return;
						
						// 立即添加本地图片作为预览
						const tempImages = [...this.form.items[index].images, ...res.tempFilePaths];
						this.form.items[index].images = tempImages;
						
						// 后台异步上传图片
						this.uploadImagesInBackground(index, res.tempFilePaths);
					}
				});
			},
			// 后台异步上传图片
		uploadImagesInBackground(index, tempFilePaths) {
			// 初始化 uploadedImages 对象
			if (!this.uploadedImages) {
				this.uploadedImages = {};
			}
			if (!this.uploadedImages[index]) {
				this.uploadedImages[index] = {};
			}
			
			// 为每张图片创建上传任务
			const uploadPromises = tempFilePaths.map(async (tempFilePath, imgIndex) => {
				try {
					const uploadResult = await uploadImage(tempFilePath);
					// 上传成功后，存储对应关系：本地路径 -> fileKey
					// 注意：我们不替换表单中的本地路径，只在提交时使用fileKey
					this.uploadedImages[index][tempFilePath] = uploadResult;
					return true;
				} catch (error) {
					console.error('上传图片失败', error);
					// 上传失败时，从表单中移除该图片
					if (this.form.items[index]) {
						const imgIndex = this.form.items[index].images.indexOf(tempFilePath);
						if (imgIndex > -1) {
							this.form.items[index].images.splice(imgIndex, 1);
						}
					}
					return false;
				}
			});
			
			// 等待所有上传任务完成
			Promise.all(uploadPromises).then(results => {
				const allSuccess = results.every(result => result);
				const someSuccess = results.some(result => result);
				
				if (allSuccess) {
					uni.showToast({
						title: '图片上传成功',
						icon: 'success'
					});
				} else if (someSuccess) {
					uni.showToast({
						title: '部分图片上传失败',
						icon: 'none'
					});
				} else {
					uni.showToast({
						title: '图片上传失败',
						icon: 'none'
					});
				}
			});
		},
			deleteGoodsImage(index, imgIndex) {
				if (this.form.items[index]) {
					// 获取要删除的图片路径
					const imgToDelete = this.form.items[index].images[imgIndex];
					// 删除表单中的图片
					this.form.items[index].images.splice(imgIndex, 1);
					// 删除uploadedImages中的对应记录
					if (this.uploadedImages && this.uploadedImages[index] && this.uploadedImages[index][imgToDelete]) {
						delete this.uploadedImages[index][imgToDelete];
					}
				}
			},
			toggleAnonymous(e) {
				this.form.isAnonymous = e.detail.value.length > 0;
			},
			submit() {
				// 检查是否所有商品都已评价
				const hasEmptyReview = this.form.items.some(item => {
					return item.overallRating < 3 && !item.content;
				});
				
				if (hasEmptyReview) {
					uni.showToast({
						title: '请为所有商品填写评价内容',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({ title: '提交中...' });
				
				// 构建提交数据，将本地图片路径替换为fileKey
			const submitItems = this.form.items.map((item, index) => {
				// 转换图片路径为fileKey
				const processedImages = item.images.map(img => {
					// 检查是否有对应的fileKey
					if (this.uploadedImages && this.uploadedImages[index] && this.uploadedImages[index][img]) {
						return this.uploadedImages[index][img];
					} else {
						// 如果没有对应的fileKey，可能是已经上传成功的fileKey
						// 注意：这种情况不应该发生，因为我们只在上传成功后才存储对应关系
						// 但为了保险起见，我们仍然返回原始值
						return img;
					}
				});
				
				return {
					...item,
					images: processedImages
				};
			});
				
				const submitData = {
					orderId: this.orderId,
					descriptionRating: this.form.descriptionRating,
					deliveryRating: this.form.deliveryRating,
					serviceRating: this.form.serviceRating,
					isAnonymous: this.form.isAnonymous,
					items: submitItems
				};

				submitReview(submitData).then(() => {
					uni.hideLoading();
					uni.showToast({
						title: '评价成功',
						icon: 'success'
					});
					setTimeout(() => {
						uni.navigateBack();
                        // 触发上一页刷新（如果支持）
                        const pages = getCurrentPages();
                        const prevPage = pages[pages.length - 2];
                        if (prevPage && prevPage.$vm) {
                            if (prevPage.$vm.fetchOrders) {
                                // 列表页刷新
                                prevPage.$vm.fetchOrders(true);
                            } else if (prevPage.$vm.fetchOrderDetail && prevPage.$vm.orderInfo) {
                                // 详情页刷新
                                prevPage.$vm.fetchOrderDetail(prevPage.$vm.orderInfo.orderId || prevPage.$vm.orderInfo.orderNo);
                            }
                        }
					}, 1500);
				}).catch(err => {
					uni.hideLoading();
					// 显示API返回的错误消息
					const errorMessage = err.message || '评价失败';
					uni.showToast({
						title: errorMessage,
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style scoped>
	.evaluate-container {
			min-height: 100vh;
			background-color: #f5f5f5;
			padding-bottom: 120rpx;
		}

		.goods-list {
			background-color: #fff;
			padding: 20rpx;
			margin-bottom: 20rpx;
		}

		.goods-item {
			display: flex;
			padding: 10rpx 0;
		}

		.goods-image {
			width: 100rpx;
			height: 100rpx;
			border-radius: 8rpx;
			margin-right: 20rpx;
			background-color: #f9f9f9;
		}

		.goods-info {
			display: flex;
			align-items: center;
		}

		.goods-details {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.goods-name {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 10rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.goods-spec {
			font-size: 24rpx;
			color: #999;
		}

		.goods-reviews {
			background-color: #fff;
			margin-bottom: 20rpx;
		}

		.goods-review-item {
			padding: 30rpx;
		}

		.review-form {
			margin-top: 20rpx;
		}

		.divider {
			height: 1rpx;
			background-color: #f5f5f5;
			margin: 20rpx -30rpx;
		}

		.order-review {
			background-color: #fff;
			padding: 30rpx;
			margin-bottom: 20rpx;
		}

	.rate-section {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		padding-bottom: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.label {
		font-size: 30rpx;
		color: #333;
		margin-right: 30rpx;
		font-weight: bold;
	}

	.stars {
		display: flex;
		margin-right: 30rpx;
	}

	.star-icon {
		font-size: 50rpx;
		color: #ddd;
		margin-right: 10rpx;
		transition: color 0.2s;
	}

	.star-icon.active {
		color: #ffca3e;
	}

	.rate-text {
		font-size: 28rpx;
		color: #999;
	}

	.rate-options {
		display: flex;
		gap: 20rpx;
	}

	.rate-option {
		padding: 10rpx 30rpx;
		border: 1rpx solid #ddd;
		border-radius: 20rpx;
		cursor: pointer;
		transition: all 0.2s;
	}

	.rate-option.active {
		background-color: #ff9000;
		border-color: #ff9000;
	}

	.rate-option.active .rate-text {
		color: #fff;
		font-weight: bold;
	}

	.content-section {
		position: relative;
		margin-bottom: 30rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		padding: 20rpx;
	}

	.review-textarea {
		width: 100%;
		height: 200rpx;
		font-size: 28rpx;
		line-height: 1.5;
	}

	.word-count {
		text-align: right;
		font-size: 24rpx;
		color: #ccc;
		margin-top: 10rpx;
	}

	.upload-section {
		margin-bottom: 40rpx;
	}

	.upload-list {
		display: flex;
		flex-wrap: wrap;
	}

	.upload-item, .upload-btn {
		width: 160rpx;
		height: 160rpx;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		position: relative;
		border-radius: 8rpx;
	}
    
    .upload-item:nth-child(4n) {
        margin-right: 0;
    }

	.upload-img {
		width: 100%;
		height: 100%;
		border-radius: 8rpx;
	}

	.delete-btn {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 36rpx;
		height: 36rpx;
		background-color: rgba(0,0,0,0.5);
		color: #fff;
		border-radius: 50%;
		text-align: center;
		line-height: 34rpx;
		font-size: 24rpx;
	}

	.upload-btn {
		border: 2rpx dashed #ddd;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #fafafa;
	}

	.camera-icon {
		font-size: 48rpx;
		color: #999;
		margin-bottom: 10rpx;
	}

	.upload-text {
		font-size: 24rpx;
		color: #999;
	}

	.upload-limit {
		font-size: 20rpx;
		color: #ccc;
		margin-top: 5rpx;
	}

	.sub-rates {
		margin-bottom: 30rpx;
	}

	.rate-row {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.rate-row .label {
		font-size: 28rpx;
		font-weight: normal;
		width: 140rpx;
	}

	.stars.sm .star-icon {
		font-size: 40rpx;
	}

	.rate-score {
		font-size: 28rpx;
		color: #999;
		margin-left: 20rpx;
	}

	.anonymous-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1rpx solid #f5f5f5;
		padding-top: 30rpx;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
	}

	.anonymous-tip {
		font-size: 24rpx;
		color: #999;
	}

	.submit-btn-container {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 20rpx 30rpx;
		background-color: #fff;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
		box-sizing: border-box;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.submit-btn {
		background: linear-gradient(90deg, #ff9000, #ff5000);
		color: #fff;
		border-radius: 40rpx;
		font-size: 32rpx;
		font-weight: bold;
		border: none;
	}
</style>
