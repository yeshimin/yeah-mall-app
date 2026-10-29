<template>
	<view class="reviews-container">
		<!-- 评价统计头部 -->
		<view class="reviews-header">
			<view class="tags-row">
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'all' }"
					@click="switchType('all')"
				>全部 {{ total == null ? '--' : total }}</view>
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'pic' }"
					@click="switchType('pic')"
				>有图 {{ picCount == null ? '--' : picCount }}</view>
				<view 
					class="tag-item" 
					:class="{ active: currentType === 'good' }"
					@click="switchType('good')"
				>好评 {{ goodCount == null ? '--' : goodCount }}</view>
			</view>
		</view>

		<!-- 评价列表 -->
		<scroll-view 
			scroll-y 
			class="reviews-list" 
			:scroll-into-view="scrollToReviewId"
			@scrolltolower="loadMore"
		>
			<view :id="`review-${item.id}`" class="review-item" v-for="(item, index) in list" :key="index">
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
					<view
						v-for="(img, imgIndex) in item.images" 
						:key="imgIndex"
						class="review-image-slot"
					>
						<image
							:src="getImageUrl(img)"
							mode="aspectFill"
							class="review-img"
							@click="previewImage(item.images, imgIndex)"
						></image>
					</view>
				</view>
				
				<view class="sku-info" v-if="item.skuInfo">
					<text>{{ item.skuInfo }}</text>
				</view>

				<view class="review-replies" v-if="item.replies && item.replies.length">
					<view v-for="reply in item.replies" :key="reply.id" class="review-reply-item">
						<text class="reply-label">{{ reply.senderType === 1 ? '买家回复：' : '商家回复：' }}</text>
						<text class="reply-content">{{ reply.content }}</text>
						<text class="reply-time">{{ reply.updateTime || reply.createTime }}</text>
					</view>
				</view>
				<text v-if="item.replyStatusText" class="reply-status">{{ item.replyStatusText }}</text>

				<view v-if="item.canReply || item.canEditReply" class="reply-editor">
					<input v-model="replyDrafts[item.id]" class="reply-input" :placeholder="item.canEditReply ? '修改你的回复' : '回复商家'" maxlength="500" />
					<button class="reply-button" :loading="replyingReviewId === item.id" @click="submitReply(item)">
						{{ item.canEditReply ? '保存' : '回复' }}
					</button>
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
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchProductReviews, fetchReviewSummary, replyProductReview } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const productId = ref('')
const currentType = ref('all')
const list = ref([])
const total = ref(null)
const picCount = ref(null)
const goodCount = ref(null)
const page = ref(1)
const loading = ref(false)
const noMore = ref(false)
const replyingReviewId = ref('')
const replyDrafts = reactive({})
const replyReviewId = ref('')
const scrollToReviewId = ref('')

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
    current: page.value,
    size: 10,
    hasImage: currentType.value === 'pic' ? true : undefined,
    goodOnly: currentType.value === 'good' ? true : undefined
  })
    .then((res) => {
      total.value = Number(res.total || 0)

      const records = (res.records || []).map((item) => {
        const replies = item.replies || []
        const latestReply = replies[replies.length - 1]
        if (item.canEditReply && latestReply) {
          replyDrafts[item.id] = latestReply.content
        }
        return {
          ...item,
          replies,
          userName: item.nickname,
          userAvatar: item.avatar,
          rate: item.overallRating,
          skuInfo: item.skuName
        }
      })
      if (records.length > 0) {
        list.value = [...list.value, ...records]
        page.value += 1
        if (replyReviewId.value && page.value === 2) {
          scrollToReviewId.value = `review-${replyReviewId.value}`
        }
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

function loadSummary() {
  fetchReviewSummary(productId.value)
    .then((summary) => {
      total.value = Number(summary.totalCount || 0)
      picCount.value = Number(summary.imageCount || 0)
      goodCount.value = Number(summary.goodCount || 0)
    })
    .catch(() => {})
}

async function submitReply(item) {
  const content = (replyDrafts[item.id] || '').trim()
  if (!content) {
    uni.showToast({ title: '请输入回复内容', icon: 'none' })
    return
  }
  replyingReviewId.value = item.id
  try {
    await replyProductReview({ id: item.id, replyContent: content })
    uni.showToast({ title: item.canEditReply ? '回复已修改' : '回复成功', icon: 'success' })
    loadData(true)
  } catch (error) {
    uni.showToast({ title: error.message || '回复失败', icon: 'none' })
  } finally {
    replyingReviewId.value = ''
  }
}

function previewImage(urls, current) {
  const previewUrls = urls.map((url) => getImageUrl(url))
  uni.previewImage({
    urls: previewUrls,
    current: previewUrls[current]
  })
}

/**
 * 将评价图片的文件标识转换为可访问的预览地址。
 */
function getImageUrl(fileKey) {
  return getStoragePreviewUrl(fileKey) || '/static/logo.png'
}

onLoad((options = {}) => {
  if (options.productId) {
    productId.value = options.productId
    replyReviewId.value = options.replyReviewId || ''
    loadSummary()
    loadData(true)
  }
})
</script>

<style scoped>
	.reviews-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--ym-paper);
	}

	.reviews-header {
		background: var(--ym-surface);
		padding: 20rpx;
		margin-bottom: 0;
		position: sticky;
		top: 0;
		z-index: 10;
		border-bottom: 1rpx solid var(--ym-line);
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
	}

	.tag-item {
		padding: 10rpx 24rpx;
		color: var(--ym-ink-secondary);
		background: var(--ym-brand-soft);
		border-radius: 30rpx;
		font-size: 24rpx;
		margin-right: 20rpx;
		margin-bottom: 10rpx;
		transition: all 0.3s;
	}

	.tag-item.active {
		color: #fff;
		background: var(--ym-brand);
	}

	.reviews-list {
		flex: 1;
		height: 0; /* Important for scroll-view in flex layout */
		box-sizing: border-box;
		padding: 20rpx 0 40rpx;
	}

	.review-item {
		margin: 0 24rpx 16rpx;
		padding: 30rpx;
		border: 1rpx solid var(--ym-line);
		border-radius: var(--ym-radius-card);
		background: var(--ym-surface);
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
		background: var(--ym-brand-soft);
	}

	.user-detail {
		flex: 1;
	}

	.nickname {
		font-size: 28rpx;
		color: var(--ym-ink);
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
		color: var(--ym-muted);
	}

	.review-content {
		font-size: 28rpx;
		color: var(--ym-ink-secondary);
		line-height: 1.5;
		margin-bottom: 20rpx;
	}

	.review-images {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 10rpx;
	}

	.review-image-slot {
		width: 220rpx;
		height: 220rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
		border-radius: 8rpx;
		overflow: hidden;
		background: var(--ym-paper);
	}
    
    .review-image-slot:nth-child(3n) {
        margin-right: 0;
    }

	.review-img {
		width: 100%;
		height: 100%;
	}

	.sku-info {
		font-size: 24rpx;
		color: var(--ym-muted);
		margin-bottom: 20rpx;
	}

	.review-replies {
		margin-top: 12rpx;
	}

	.review-reply-item {
		background: var(--ym-brand-soft);
		padding: 20rpx;
		border-radius: 8rpx;
		font-size: 26rpx;
		line-height: 1.4;
		margin-top: 10rpx;
	}

	.reply-label {
		color: var(--ym-brand);
		font-weight: bold;
	}

	.reply-content {
		color: var(--ym-ink-secondary);
	}

	.reply-time {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		color: var(--ym-muted);
	}

	.reply-status {
		display: block;
		margin-top: 12rpx;
		font-size: 22rpx;
		color: var(--ym-muted);
	}

	.reply-editor {
		display: flex;
		align-items: center;
		margin-top: 16rpx;
		padding: 12rpx;
		background: var(--ym-paper);
		border-radius: 8rpx;
	}

	.reply-input {
		flex: 1;
		height: 60rpx;
		padding: 0 16rpx;
		background-color: #fff;
		border-radius: 6rpx;
		font-size: 24rpx;
	}

	.reply-button {
		margin-left: 12rpx;
		padding: 0 20rpx;
		font-size: 24rpx;
		line-height: 60rpx;
		color: #fff;
		background: var(--ym-brand);
		border-radius: var(--ym-radius-control);
	}
	
	.loading-more {
		text-align: center;
		padding: 30rpx;
		color: var(--ym-muted);
		font-size: 24rpx;
	}
</style>
