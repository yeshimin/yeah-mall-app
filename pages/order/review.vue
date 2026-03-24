<template>
	<view class="evaluate-container">
		<!-- 商品评价 -->
		<view class="goods-reviews" v-if="order && order.shopProducts">
			<view class="goods-review-item" v-for="(item, index) in order.shopProducts" :key="index">
				<view class="goods-info">
					<image class="goods-image" :src="item.spuMainImage ? getImageUrl(item.spuMainImage) : '/static/logo.png'" mode="aspectFill"></image>
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

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchOrderDetail, submitReview, uploadImage } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const orderId = ref('')
const order = ref(null)
const uploadedImages = reactive({})
const form = reactive({
  descriptionRating: 5,
  deliveryRating: 5,
  serviceRating: 5,
  isAnonymous: false,
  items: []
})

function getImageUrl(path) {
  return getStoragePreviewUrl(path)
}

function getSpecString(specs) {
  if (!specs || !specs.length) return ''
  return specs.map((spec) => `${spec.specName}:${spec.optName}`).join('; ')
}

function getImageSrc(img) {
  return img
}

function loadOrderDetail() {
  uni.showLoading({ title: '加载中...' })
  fetchOrderDetail(orderId.value)
    .then((data) => {
      order.value = data
      initGoodsReviews()
      uni.hideLoading()
    })
    .catch((error) => {
      uni.hideLoading()
      console.error('获取订单详情失败', error)
      uni.showToast({
        title: '获取订单详情失败',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    })
}

function initGoodsReviews() {
  form.items = ((order.value && order.value.shopProducts) || []).map((item) => ({
    orderItemId: item.orderItemId || item.id || '',
    overallRating: 5,
    content: '',
    images: []
  }))
}

function setRate(field, value) {
  form[field] = value
}

function setGoodsRate(index, value) {
  if (form.items[index]) {
    form.items[index].overallRating = value
  }
}

function chooseGoodsImage(index) {
  if (!form.items[index]) return

  uni.chooseImage({
    count: 6 - form.items[index].images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (!form.items[index]) return
      form.items[index].images = [...form.items[index].images, ...res.tempFilePaths]
      uploadImagesInBackground(index, res.tempFilePaths)
    }
  })
}

function uploadImagesInBackground(index, tempFilePaths) {
  if (!uploadedImages[index]) {
    uploadedImages[index] = {}
  }

  const uploadPromises = tempFilePaths.map(async (tempFilePath) => {
    try {
      const uploadResult = await uploadImage(tempFilePath)
      uploadedImages[index][tempFilePath] = uploadResult
      return true
    } catch (error) {
      console.error('上传图片失败', error)
      if (form.items[index]) {
        const currentIndex = form.items[index].images.indexOf(tempFilePath)
        if (currentIndex > -1) {
          form.items[index].images.splice(currentIndex, 1)
        }
      }
      return false
    }
  })

  Promise.all(uploadPromises).then((results) => {
    const allSuccess = results.every(Boolean)
    const someSuccess = results.some(Boolean)

    if (allSuccess) {
      uni.showToast({ title: '图片上传成功', icon: 'success' })
    } else if (someSuccess) {
      uni.showToast({ title: '部分图片上传失败', icon: 'none' })
    } else {
      uni.showToast({ title: '图片上传失败', icon: 'none' })
    }
  })
}

function deleteGoodsImage(index, imgIndex) {
  if (!form.items[index]) {
    return
  }

  const imageToDelete = form.items[index].images[imgIndex]
  form.items[index].images.splice(imgIndex, 1)
  if (uploadedImages[index] && uploadedImages[index][imageToDelete]) {
    delete uploadedImages[index][imageToDelete]
  }
}

function toggleAnonymous(event) {
  form.isAnonymous = event.detail.value.length > 0
}

function submit() {
  const hasEmptyReview = form.items.some((item) => item.overallRating < 3 && !item.content)
  if (hasEmptyReview) {
    uni.showToast({
      title: '请为所有商品填写评价内容',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: '提交中...' })
  const submitItems = form.items.map((item, index) => ({
    ...item,
    images: item.images.map((img) => uploadedImages[index]?.[img] || img)
  }))

  submitReview({
    orderId: orderId.value,
    descriptionRating: form.descriptionRating,
    deliveryRating: form.deliveryRating,
    serviceRating: form.serviceRating,
    isAnonymous: form.isAnonymous,
    items: submitItems
  })
    .then(() => {
      uni.hideLoading()
      uni.showToast({
        title: '评价成功',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    })
    .catch((error) => {
      uni.hideLoading()
      uni.showToast({
        title: error.message || '评价失败',
        icon: 'none'
      })
    })
}

onLoad((options = {}) => {
  if (options.orderId) {
    orderId.value = options.orderId
    loadOrderDetail()
  } else {
    uni.showToast({
      title: '订单参数错误',
      icon: 'none'
    })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})
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
