<template>
	<view class="page-container">
		<view class="customer-service-container">
			<!-- 头部信息 -->
			<view class="service-header">
				<view class="shop-info">
					<image class="shop-avatar" :src="shopInfo.avatar || defaultAvatar60" mode="aspectFill"></image>
					<view class="shop-details">
						<text class="shop-name">{{ shopInfo.name || '店铺客服' }}</text>
					</view>
				</view>
			</view>

			<!-- 聊天内容区域 -->
			<scroll-view class="chat-content" scroll-y :show-scrollbar="false" ref="chatScroll" @scroll="onScroll" :scroll-into-view="scrollToView">
				<view class="message-list">
					<!-- 所有消息，按时间顺序排列 -->
					<template v-for="(msg, index) in sortedMessages" :key="index">
						<!-- 客服消息 -->
						<view v-if="msg.type === 'service'" :id="index === sortedMessages.length - 1 ? 'last-message' : ''" class="message-item service-message">
							<image class="sender-avatar" :src="merchantInfo.avatar || shopInfo.avatar || defaultAvatar50" mode="aspectFill"></image>
							<view class="message-wrapper">
								<view class="nickname-time-wrapper">
									<text class="sender-nickname">{{ merchantInfo.nickname || shopInfo.name || '店铺客服' }}</text>
									<text class="message-time">{{ msg.time }}</text>
								</view>
								<view class="message-content">
									<text class="message-text" v-if="!msg.imageUrl">{{ msg.content }}</text>
									<image v-else class="message-image" :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)"></image>
								</view>
							</view>
						</view>

						<!-- 用户消息 -->
						<view v-else-if="msg.type === 'user'" :id="index === sortedMessages.length - 1 ? 'last-message' : ''" class="message-item user-message">
							<image class="sender-avatar" :src="userInfo.avatar || defaultAvatar50" mode="aspectFill"></image>
							<view class="message-wrapper">
								<view class="nickname-time-wrapper">
									<text class="message-time">{{ msg.time }}</text>
									<text class="sender-nickname">{{ userInfo.nickname || '我' }}</text>
								</view>
								<view class="message-content">
									<text class="message-text" v-if="!msg.imageUrl">{{ msg.content }}</text>
									<image v-else class="message-image" :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)"></image>
								</view>
							</view>
						</view>
					</template>
				</view>
			</scroll-view>
		</view>

		<!-- 输入区域 -->
		<view class="input-section">
			<view class="input-container">
						<textarea 
							class="message-input" 
							v-model="inputMessage" 
							placeholder="请输入您的问题..." 
							maxlength="500"
							@focus="onInputFocus"
							@blur="onInputBlur"
						></textarea>
						<view class="input-actions">
							<text class="action-btn" @click="chooseImage">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M8.5 13.5L12 17L15.5 13.5" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M12 7V17" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</text>
							<text v-if="selectedImage" class="action-btn" @click="selectedImage = null">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M18 6L6 18" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M6 6L18 18" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</text>
						</view>
					</view>
					<!-- 选中图片预览 -->
					<view v-if="selectedImage" class="image-preview-container">
						<image class="image-preview" :src="selectedImage" mode="aspectFill" @click="previewImage(selectedImage)"></image>
						<text class="image-preview-text">点击发送图片</text>
						<text class="image-preview-clear" @click="selectedImage = null">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M6 6L18 18" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</text>
					</view>
			<button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim() && !selectedImage">发送</button>
		</view>

		<!-- 店铺信息弹窗 -->
		<view class="shop-info-popup" v-if="showShopInfoPopup" @click="closeShopInfoPopup">
			<view class="popup-content" @click.stop>
				<text class="close-btn" @click="closeShopInfoPopup">×</text>
				<view class="popup-header">
					<image class="popup-avatar" :src="shopInfo.avatar || defaultAvatar80" mode="aspectFill"></image>
					<view class="popup-shop-info">
						<text class="popup-shop-name">{{ shopInfo.name || '店铺客服' }}</text>
						<text class="popup-shop-desc">{{ shopInfo.description || '专业的客服团队，为您提供优质服务' }}</text>
					</view>
				</view>
				<view class="popup-details">
					<view class="detail-item">
						<text class="detail-label">服务时间：</text>
						<text class="detail-value">{{ shopInfo.serviceTime || '09:00-21:00' }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">店铺评分：</text>
						<text class="detail-value">{{ shopInfo.rating || '4.9' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import wsManager from '../../utils/websocket.js'
import { getToken, getUserId, handleAuthFailure } from '../../utils/auth.js'
import { BASE_API, STORAGE_UPLOAD_URL, getStoragePreviewUrl } from '../../utils/config.js'

const defaultAvatar50 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
const defaultAvatar60 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
const defaultAvatar80 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

const shopInfo = reactive({
  name: '店铺客服',
  avatar: '',
  description: '专业的客服团队，为您提供优质服务',
  serviceTime: '09:00-21:00',
  rating: '4.9',
  shopId: '1',
  merchantId: '1'
})

const userInfo = reactive({
  avatar: '',
  userId: getUserId() || '1',
  nickname: ''
})

const merchantInfo = reactive({
  nickname: '',
  avatar: ''
})

const messages = ref([
  {
    content: '您好！欢迎咨询，有什么可以帮助您的吗？',
    time: '10:01',
    timestamp: new Date().setHours(10, 1, 0, 0),
    type: 'service'
  },
  {
    content: '我们的商品支持7天无理由退换，请您放心购买。',
    time: '10:02',
    timestamp: new Date().setHours(10, 2, 0, 0),
    type: 'service'
  }
])
const userMessages = ref([])
const inputMessage = ref('')
const selectedImage = ref(null)
const showQuickQuestions = ref(false)
const quickQuestions = [
  '商品什么时候发货？',
  '支持7天无理由退换吗？',
  '商品质量有保障吗？',
  '可以优惠吗？'
]
const showShopInfoPopup = ref(false)
const isInputFocused = ref(false)
const conversationInfo = ref(null)
const conversationId = ref(null)
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const scrollToView = ref('')

const sortedMessages = computed(() => {
  return [...messages.value, ...userMessages.value].sort((a, b) => {
    return (a.timestamp || 0) - (b.timestamp || 0)
  })
})

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

function uploadFile(options) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

function buildAuthHeader(includeContentType = false) {
  const header = {}
  if (includeContentType) {
    header['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    header.Authorization = `Bearer ${token}`
  }

  return header
}

function ensureAuthenticated() {
  if (getToken()) {
    return true
  }

  handleAuthFailure()
  return false
}

function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function scrollToBottom() {
  setTimeout(() => {
    scrollToView.value = 'last-message'
    nextTick(() => {
      setTimeout(() => {
        scrollToView.value = ''
      }, 100)
    })
  }, 800)
}

function previewImage(imageUrl) {
  uni.previewImage({
    urls: [imageUrl]
  })
}

function formatMessageTime(createTime) {
  let normalized = createTime
  if (typeof normalized === 'string' && normalized.includes(' ')) {
    normalized = normalized.replace(' ', 'T')
  }

  const date = new Date(normalized)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function sendWsMessage(payload) {
  const result = wsManager.send(payload)
  if (!result) {
    uni.showToast({
      title: '发送失败，请检查网络连接',
      icon: 'none'
    })
  }
  return result
}

function sendMessage() {
  if (selectedImage.value) {
    sendImageMessage()
  } else if (inputMessage.value.trim()) {
    sendTextMessage()
  }
}

function sendTextMessage() {
  if (!conversationId.value) {
    console.error('发送文本消息失败：会话ID为空')
    return
  }

  const content = inputMessage.value.trim()
  const now = new Date()
  userMessages.value.push({
    content,
    time: getCurrentTime(),
    timestamp: now.getTime(),
    type: 'user'
  })
  inputMessage.value = ''

  sendWsMessage({
    category: 'biz-handle',
    command: 'cs-chat.mem',
    subCmd: 'msg.mem2mch',
    payload: {
      conversationId: conversationId.value,
      content,
      type: 1
    }
  })

  nextTick(() => {
    scrollToBottom()
  })
}

async function sendImageMessage() {
  if (!selectedImage.value) {
    return
  }

  if (!conversationId.value) {
    try {
      await initConversation()
    } catch (error) {
      uni.showToast({
        title: '初始化会话失败，无法发送消息',
        icon: 'none'
      })
      return
    }
  }

  doSendImageMessage()
}

async function doSendImageMessage() {
  if (!ensureAuthenticated()) {
    return
  }

  uni.showLoading({ title: '上传中...' })
  try {
    const uploadRes = await uploadFile({
      url: STORAGE_UPLOAD_URL,
      filePath: selectedImage.value,
      name: 'file',
      header: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    uni.hideLoading()
    if (uploadRes.statusCode !== 200) {
      uni.showToast({
        title: `上传失败: ${uploadRes.statusCode}`,
        icon: 'none'
      })
      return
    }

    const response = JSON.parse(uploadRes.data)
    if (response.code !== 0) {
      uni.showToast({
        title: `上传失败: ${response.message || '未知错误'}`,
        icon: 'none'
      })
      return
    }

    const fileKey = response.data.fileKey
    const now = new Date()
    userMessages.value.push({
      content: '[图片]',
      time: getCurrentTime(),
      timestamp: now.getTime(),
      imageUrl: getStoragePreviewUrl(fileKey),
      type: 'user'
    })
    selectedImage.value = null

    sendWsMessage({
      category: 'biz-handle',
      command: 'cs-chat.mem',
      subCmd: 'msg.mem2mch',
      payload: {
        conversationId: conversationId.value,
        content: fileKey,
        type: 2
      }
    })

    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: `上传失败: ${error.errMsg || '未知错误'}`,
      icon: 'none'
    })
  }
}

async function sendQuickQuestion(question) {
  if (!conversationId.value) {
    try {
      await initConversation()
    } catch (error) {
      uni.showToast({
        title: '初始化会话失败，无法发送消息',
        icon: 'none'
      })
      return
    }
  }

  doSendQuickQuestion(question)
}

function doSendQuickQuestion(question) {
  const now = new Date()
  userMessages.value.push({
    content: question,
    time: getCurrentTime(),
    timestamp: now.getTime(),
    type: 'user'
  })
  showQuickQuestions.value = false

  sendWsMessage({
    category: 'biz-handle',
    command: 'cs-chat.mem',
    subCmd: 'msg.mem2mch',
    payload: {
      conversationId: conversationId.value,
      content: question,
      type: 1
    }
  })

  nextTick(() => {
    scrollToBottom()
  })
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      selectedImage.value = res.tempFilePaths[0]
      inputMessage.value = ''
    },
    fail: (error) => {
      console.error('选择图片失败', error)
    }
  })
}

function showShopInfo() {
  showShopInfoPopup.value = true
}

function closeShopInfoPopup() {
  showShopInfoPopup.value = false
}

function onInputFocus() {
  isInputFocused.value = true
  showQuickQuestions.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

function onInputBlur() {
  isInputFocused.value = false
}

async function loadHistoryMessages(isLoadMore = false) {
  if (!conversationId.value) {
    console.error('加载历史消息失败: 会话ID为空')
    return
  }

  if (isLoadMore) {
    if (loadingMore.value || !hasMore.value) {
      return
    }
    loadingMore.value = true
  } else {
    currentPage.value = 1
    hasMore.value = true
    messages.value = []
    userMessages.value = []
    uni.showLoading({ title: '加载历史消息...' })
  }

  const page = isLoadMore ? currentPage.value + 1 : 1
  try {
    const res = await request({
      url: `${BASE_API}/app/csConversation/messages`,
      method: 'GET',
      header: buildAuthHeader(),
      data: {
        conversationId: conversationId.value,
        current: page,
        size: 20
      }
    })

    if (!isLoadMore) {
      uni.hideLoading()
    } else {
      loadingMore.value = false
    }

    if (res.statusCode !== 200 || res.data.code !== 0) {
      console.error('加载历史消息失败:', res.data && res.data.message)
      return
    }

    const historyMessages = res.data.data.records || []
    hasMore.value = historyMessages.length >= 20
    currentPage.value = page

    historyMessages.reverse().forEach((msg) => {
      const message = {
        content: msg.msgType === 2 ? '[图片]' : msg.msgContent,
        time: formatMessageTime(msg.createTime),
        timestamp: new Date(msg.createTime).getTime(),
        type: msg.msgDirection === 1 ? 'user' : 'service',
        imageUrl: msg.msgType === 2 ? getStoragePreviewUrl(msg.msgContent) : null
      }

      if (msg.msgDirection === 1) {
        userMessages.value.push(message)
      } else {
        messages.value.push(message)
      }
    })

    if (!isLoadMore) {
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom()
        }, 500)
      })
    }
  } catch (error) {
    if (isLoadMore) {
      loadingMore.value = false
    } else {
      uni.hideLoading()
    }
    console.error('请求历史消息失败:', error)
  }
}

function onScroll(event) {
  if (event.detail.scrollTop <= 50 && !loadingMore.value && hasMore.value) {
    loadHistoryMessages(true)
  }
}

async function initConversation() {
  if (!ensureAuthenticated()) {
    throw new Error('未登录')
  }

  uni.showLoading({ title: '初始化会话...' })
  try {
    const res = await request({
      url: `${BASE_API}/app/csConversation/init`,
      method: 'POST',
      header: buildAuthHeader(true),
      data: {
        shopId: shopInfo.shopId
      }
    })

    uni.hideLoading()
    if (res.statusCode !== 200 || res.data.code !== 0) {
      console.error('初始化会话失败:', res.data && res.data.message)
      uni.showToast({
        title: '初始化会话失败，请重试',
        icon: 'none'
      })
      const error = new Error('初始化会话失败')
      error.handled = true
      throw error
    }

    const conversationData = res.data.data
    conversationInfo.value = conversationData
    if (!conversationId.value) {
      conversationId.value = conversationData.id
    }

    Object.assign(shopInfo, {
      ...shopInfo,
      name: conversationData.shopName || '店铺客服',
      avatar: getStoragePreviewUrl(conversationData.shopLogo),
      merchantId: conversationData.mchId || shopInfo.merchantId
    })

    Object.assign(userInfo, {
      ...userInfo,
      avatar: getStoragePreviewUrl(conversationData.memberAvatar),
      userId: conversationData.memberId || userInfo.userId,
      nickname: conversationData.memberNickname || ''
    })

    Object.assign(merchantInfo, {
      nickname: conversationData.mchNickname || '',
      avatar: getStoragePreviewUrl(conversationData.mchAvatar)
    })

    if (conversationId.value) {
      await loadHistoryMessages()
    }

    return conversationData
  } catch (error) {
    uni.hideLoading()
    console.error('请求初始化会话失败:', error)
    if (!error.handled && error.message !== '未登录') {
      uni.showToast({
        title: '网络错误，请检查网络连接',
        icon: 'none'
      })
    }
    throw error
  }
}

function handleMerchantMessage(message) {
  if (message.subCmd !== 'msg.mch2mem') {
    return
  }

  const payload = message.payload || {}
  const hasValidConversationId = conversationId.value && payload.conversationId == conversationId.value
  const hasValidationFields = payload.shopId && payload.from && payload.to

  let isValidMessage = false
  if (hasValidationFields) {
    isValidMessage = payload.shopId == shopInfo.shopId &&
      payload.from == shopInfo.merchantId &&
      payload.to == userInfo.userId
  } else if (hasValidConversationId) {
    isValidMessage = true
  }

  if (!isValidMessage) {
    return
  }

  messages.value.push({
    content: payload.type === 2 ? '[图片]' : payload.content,
    time: getCurrentTime(),
    timestamp: Date.now(),
    imageUrl: payload.type === 2 ? getStoragePreviewUrl(payload.content) : null,
    type: 'service'
  })

  nextTick(() => {
    scrollToBottom()
  })
}

onLoad((options = {}) => {
  if (!ensureAuthenticated()) {
    return
  }

  if (options.shopId) {
    shopInfo.shopId = options.shopId
  }
  if (options.mchId) {
    shopInfo.merchantId = options.mchId
  }
  if (options.conversationId) {
    conversationId.value = options.conversationId
  }

  initConversation()
    .then(() => {
      nextTick(() => {
        scrollToBottom()
      })
    })
    .catch(() => {})
})

onMounted(() => {
  if (!getToken()) {
    return
  }

  if (getToken() && !wsManager.getConnectionStatus()) {
    wsManager.init()
  }

  nextTick(() => {
    scrollToBottom()
  })
  setTimeout(() => {
    scrollToBottom()
  }, 1000)

  wsManager.on('biz-handle', 'cs-chat.mch', handleMerchantMessage)
})

onUnmounted(() => {
  wsManager.off('biz-handle', 'cs-chat.mch')
})
</script>

<style scoped>
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		background-color: #f5f5f5;
	}

	.customer-service-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
	}

	.input-section {
		position: relative;
		z-index: 10;
	}

	.service-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
	}

	.shop-info {
		display: flex;
		align-items: center;
	}

	.shop-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #f0f0f0;
	}

	.shop-details {
		flex: 1;
	}

	.shop-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 5rpx;
	}

	

	.chat-content {
		flex: 1;
		padding: 20rpx;
		min-height: 500rpx;
		overflow-y: auto;
	}

	.message-list {
		width: 100%;
	}

	

	.message-item {
					display: flex;
					margin-bottom: 20rpx;
					align-items: flex-start;
				}

					.service-message {
								flex-direction: row;
							}

							.user-message {
								flex-direction: row-reverse;
								justify-content: flex-start;
							}

				.sender-avatar {
					width: 50rpx;
					height: 50rpx;
					border-radius: 50%;
					margin: 0 10rpx;
					background-color: #f0f0f0;
				}

				.message-wrapper {
					max-width: 70%;
				}

				.nickname-time-wrapper {
					display: flex;
					align-items: center;
					margin-bottom: 8rpx;
				}

				.service-message .nickname-time-wrapper {
					justify-content: flex-start;
				}

				.user-message .nickname-time-wrapper {
					justify-content: flex-end;
				}

				.sender-nickname {
					font-size: 20rpx;
					color: #999;
					line-height: 1.2;
					margin-right: 10rpx;
				}

				.user-message .sender-nickname {
					margin-right: 0;
					margin-left: 10rpx;
				}

				.service-message .message-time {
					margin-left: 0;
				}

				.user-message .message-time {
					margin-left: 10rpx;
				}

				.message-time {
					font-size: 20rpx;
					color: #999;
					line-height: 1.2;
				}

				.user-message .message-time {
					color: #999;
				}

				.message-content {
					word-wrap: break-word;
				}

				.service-message .message-content {
						background-color: #fff;
						border-radius: 0 15rpx 15rpx 15rpx;
						padding: 15rpx;
						border: 1rpx solid #eee;
					}

						.user-message .message-content {
							background-color: #3cc51f;
							color: #fff;
							border-radius: 15rpx 0 15rpx 15rpx;
							padding: 15rpx;
						}

				.message-text {
					font-size: 28rpx;
					line-height: 1.4;
					margin-bottom: 8rpx;
				}

				.message-time {
					font-size: 20rpx;
					color: #999;
					text-align: right;
				}

			
					.user-message .sender-nickname {
						text-align: right;
					}

					.user-message .message-time {
							color: #999;
						}
					
					.message-image {
						width: 200rpx;
						height: 200rpx;
						border-radius: 10rpx;
						margin-bottom: 5rpx;
					}

	.input-section {
		display: flex;
		align-items: flex-end;
		padding: 10rpx;
		background-color: #fff;
		border-top: 1rpx solid #f0f0f0;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		box-sizing: border-box;
		width: 100%;
		max-width: 100%;
	}

	.input-container {
		flex: 1;
		display: flex;
		align-items: flex-end;
		background-color: #f8f8f8;
		border-radius: 28rpx;
		padding: 12rpx;
		margin-right: 8rpx;
		border: 1rpx solid #f0f0f0;
		transition: all 0.3s ease;
		box-sizing: border-box;
		min-width: 0;
	}

	.input-container:focus-within {
		border-color: #3cc51f;
		background-color: #fff;
	}

	.input-actions {
		display: flex;
		align-items: center;
		margin-left: 8rpx;
		flex-shrink: 0;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background-color: #f0f0f0;
		transition: all 0.3s ease;
	}

	.action-btn:hover {
		background-color: #e0e0e0;
	}

	.message-input {
		flex: 1;
		min-height: 36rpx;
		max-height: 120rpx;
		font-size: 26rpx;
		line-height: 36rpx;
		padding: 0;
		background-color: transparent;
		box-sizing: border-box;
		min-width: 0;
	}

	.message-input::placeholder {
		color: #999;
		font-size: 24rpx;
	}

	.send-btn {
		width: 80rpx;
		height: 60rpx;
		background-color: #3cc51f;
		color: #fff;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: 600;
		border: none;
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 8rpx rgba(60, 197, 31, 0.3);
		flex-shrink: 0;
	}

	.send-btn:hover:not(:disabled) {
		background-color: #36b31a;
		box-shadow: 0 4rpx 12rpx rgba(60, 197, 31, 0.4);
	}

	.send-btn:active:not(:disabled) {
		transform: scale(0.96);
	}

	.send-btn:disabled {
					background-color: #f0f0f0;
					color: #999;
					box-shadow: none;
				}

				/* 图片预览样式 */
				.image-preview-container {
					margin-top: 10rpx;
					margin-right: 8rpx;
					background-color: #f8f8f8;
					border-radius: 12rpx;
					padding: 12rpx;
					display: flex;
					align-items: center;
					border: 1rpx solid #f0f0f0;
					width: calc(100% - 120rpx);
				}

				.image-preview {
					width: 80rpx;
					height: 80rpx;
					border-radius: 8rpx;
					margin-right: 12rpx;
					background-color: #f0f0f0;
				}

				.image-preview-text {
					font-size: 24rpx;
					color: #666;
					flex: 1;
				}

				.image-preview-clear {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 36rpx;
					height: 36rpx;
					border-radius: 50%;
					background-color: #f0f0f0;
					transition: all 0.3s ease;
					margin-left: 8rpx;
				}

				.image-preview-clear:hover {
					background-color: #e0e0e0;
				}

	

	.shop-info-popup {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.popup-content {
		width: 80%;
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
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
		align-items: center;
		margin-bottom: 30rpx;
	}

	.popup-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #f0f0f0;
	}

	.popup-shop-info {
		flex: 1;
	}

	.popup-shop-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.popup-shop-desc {
		font-size: 24rpx;
		color: #666;
		line-height: 1.4;
	}

	.popup-details {
		margin-top: 20rpx;
	}

	.detail-item {
		display: flex;
		margin-bottom: 15rpx;
	}

	.detail-label {
		font-size: 26rpx;
		color: #666;
		width: 120rpx;
	}

	.detail-value {
		font-size: 26rpx;
		color: #333;
		flex: 1;
	}
</style>
