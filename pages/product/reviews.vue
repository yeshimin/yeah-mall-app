<template>
	<view class="reviews-container">
		<!-- 评价统计头部 -->
		<view class="reviews-header">
			<view class="tags-row">
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'all' }"
					@click="switchType('all')"
				>全部 {{ total }}</view>
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'pic' }"
					@click="switchType('pic')"
				>有图 {{ picCount }}</view>
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'good' }"
					@click="switchType('good')"
				>好评 {{ goodCount }}</view>
			</view>
		</view>

		<!-- 评价列表 -->
		<scroll-view 
			scroll-y 
			class="reviews-list" 
			@scrolltolower="loadMore"
		>
			<view class="review-item" v-for="(item, index) in list" :key="index">
				<view class="user-info">
					<image 
						class="avatar" 
						:src="item.userAvatar || '/static/logo.png'" 
						mode="aspectFill"
					></image>
					<view class="user-detail">
						<text class="nickname">{{ item.userName || '匿名用户' }}</text>
						<view class="stars">
							<text 
								v-for="n in 5" 
								:key="n" 
								class="star-icon" 
								:class="{ active: n <= item.rate }"
							>★</text>
						</view>
					</view>
					<text class="time">{{ item.createTime }}</text>
				</view>
				
				<view class="review-content">
					<text>{{ item.content || '此用户没有填写评价。' }}</text>
				</view>
				
				<view class="review-images" v-if="item.images && item.images.length">
					<image 
						v-for="(img, imgIndex) in item.images" 
						:key="imgIndex"
						:src="img"
						mode="aspectFill"
						class="review-img"
						@click="previewImage(item.images, imgIndex)"
					></image>
				</view>
				
				<view class="sku-info" v-if="item.skuInfo">
					<text>{{ item.skuInfo }}</text>
				</view>

				<view class="merchant-reply" v-if="item.reply">
					<text class="reply-label">商家回复：</text>
					<text class="reply-content">{{ item.reply }}</text>
				</view>
			</view>
			
			<view class="loading-more">
				<text v-if="loading">加载中...</text>
				<text v-else-if="noMore">没有更多评价了</text>
				<text v-else></text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchProductReviews } from '@/utils/api.js'

const productId = ref('')
const currentType = ref('all')
const list = ref([])
const total = ref(0)
const picCount = ref(0)
const goodCount = ref(0)
const page = ref(1)
const loading = ref(false)
const noMore = ref(false)

function switchType(type) {
  if (currentType.value === type) {
    return
  }

  currentType.value = type
  loadData(true)
}

function loadData(refresh = false) {
  if (refresh) {
    page.value = 1
    list.value = []
    noMore.value = false
  }

  if (loading.value || noMore.value) {
    return
  }

  loading.value = true
  fetchProductReviews(productId.value, {
    page: page.value,
    type: currentType.value
  })
    .then((res) => {
      total.value = res.total || 0
      picCount.value = Math.floor(total.value * 0.3)
      goodCount.value = Math.floor(total.value * 0.95)

      if (res.list && res.list.length > 0) {
        list.value = [...list.value, ...res.list]
        page.value += 1
      } else {
        noMore.value = true
      }
    })
    .catch(() => {
      uni.showToast({
        title: '加载失败',
        icon: 'none'
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function loadMore() {
  loadData()
}

function previewImage(urls, current) {
  uni.previewImage({
    urls,
    current
  })
}

onLoad((options = {}) => {
  if (options.productId) {
    productId.value = options.productId
    loadData(true)
  }
})
</script>

<style scoped>
	.reviews-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.reviews-header {
		background-color: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		position: sticky;
		top: 0;
		z-index: 10;
		border-bottom: 1rpx solid #eee;
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
	}

	.tag-item {
		padding: 10rpx 24rpx;
		background-color: #ffe4e1;
		color: #333;
		border-radius: 30rpx;
		font-size: 24rpx;
		margin-right: 20rpx;
		margin-bottom: 10rpx;
		transition: all 0.3s;
	}

	.tag-item.active {
		background-color: #ff5000;
		color: #fff;
	}

	.reviews-list {
		flex: 1;
		height: 0; /* Important for scroll-view in flex layout */
	}

	.review-item {
		background-color: #fff;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #eee;
	}

	.user-detail {
		flex: 1;
	}

	.nickname {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 6rpx;
		display: block;
	}

	.stars {
		display: flex;
	}

	.star-icon {
		font-size: 24rpx;
		color: #ddd;
		margin-right: 4rpx;
	}

	.star-icon.active {
		color: #ffca3e;
	}

	.time {
		font-size: 24rpx;
		color: #999;
	}

	.review-content {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		margin-bottom: 20rpx;
	}

	.review-images {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 10rpx;
	}

	.review-img {
		width: 220rpx;
		height: 220rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
		border-radius: 8rpx;
		background-color: #f9f9f9;
	}
    
    .review-img:nth-child(3n) {
        margin-right: 0;
    }

	.sku-info {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.merchant-reply {
		background-color: #f5f5f5;
		padding: 20rpx;
		border-radius: 8rpx;
		font-size: 26rpx;
		line-height: 1.4;
	}

	.reply-label {
		color: #333;
		font-weight: bold;
	}

	.reply-content {
		color: #666;
	}
	
	.loading-more {
		text-align: center;
		padding: 30rpx;
		color: #999;
		font-size: 24rpx;
	}
</style>
