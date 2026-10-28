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
							maxlength="255"
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
			<button
				class="send-btn"
				@click="sendMessage"
				:loading="sending"
				:disabled="sending || (!inputMessage.trim() && !selectedImage)"
			>发送</button>
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

const shopInfo = reactive({
  name: '店铺客服',
  avatar: '',
  shopId: '',
  merchantId: ''
})

const userInfo = reactive({
  avatar: '',
  userId: getUserId() || '',
  nickname: ''
})

const merchantInfo = reactive({
  nickname: '',
  avatar: ''
})

const messages = ref([])
const userMessages = ref([])
const inputMessage = ref('')
const selectedImage = ref(null)
const conversationInfo = ref(null)
const conversationId = ref(null)
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const scrollToView = ref('')
const sending = ref(false)

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

async function sendCustomerServiceMessage(content, type) {
  if (!ensureAuthenticated()) {
    throw new Error('请先登录')
  }

  const res = await request({
    url: `${BASE_API}/app/csConversation/sendMessage`,
    method: 'POST',
    header: buildAuthHeader(true),
    data: {
      category: 'biz-handle',
      command: 'cs-chat.mem',
      subCmd: 'msg.mem2mch',
      payload: {
        conversationId: conversationId.value,
        content,
        type
      }
    }
  })

  if (res.statusCode === 401) {
    handleAuthFailure()
    throw new Error('登录状态已失效')
  }
  if (res.statusCode !== 200 || !res.data || res.data.code !== 0) {
    throw new Error(res.data?.message || '发送失败，请稍后重试')
  }
}

async function sendMessage() {
  if (sending.value || (!selectedImage.value && !inputMessage.value.trim())) {
    return
  }

  sending.value = true
  try {
    // 首次发送前确保会话已经建立，后续消息只携带会话ID。
    if (!conversationId.value) {
      await initConversation()
    }

    if (selectedImage.value) {
      await doSendImageMessage()
    } else {
      await sendTextMessage()
    }
  } catch (error) {
    if (!error?.handled) {
      uni.showToast({
        title: error?.message || '发送失败，请稍后重试',
        icon: 'none'
      })
    }
  } finally {
    sending.value = false
  }
}

async function sendTextMessage() {
  const content = inputMessage.value.trim()
  if (!content) {
    return
  }

  await sendCustomerServiceMessage(content, 1)

  // 服务端确认落库后再展示，避免网络异常时产生本地“假消息”。
  const now = new Date()
  userMessages.value.push({
    content,
    time: getCurrentTime(),
    timestamp: now.getTime(),
    type: 'user'
  })
  if (inputMessage.value.trim() === content) {
    inputMessage.value = ''
  }

  nextTick(() => {
    scrollToBottom()
  })
}

async function doSendImageMessage() {
  if (!ensureAuthenticated()) {
    return
  }

  const imagePath = selectedImage.value
  if (!imagePath) {
    return
  }

  uni.showLoading({ title: '上传中...' })
  try {
    const uploadRes = await uploadFile({
      url: STORAGE_UPLOAD_URL,
      filePath: imagePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    if (uploadRes.statusCode !== 200) {
      throw new Error(`上传失败: ${uploadRes.statusCode}`)
    }

    const response = JSON.parse(uploadRes.data)
    if (response.code !== 0) {
      throw new Error(`上传失败: ${response.message || '未知错误'}`)
    }

    const fileKey = response.data.fileKey
    await sendCustomerServiceMessage(fileKey, 2)

    // 上传和消息写入都成功后，再清空选择并展示图片消息。
    const now = new Date()
    userMessages.value.push({
      content: '[图片]',
      time: getCurrentTime(),
      timestamp: now.getTime(),
      imageUrl: getStoragePreviewUrl(fileKey),
      type: 'user'
    })
    if (selectedImage.value === imagePath) {
      selectedImage.value = null
    }

    nextTick(() => {
      scrollToBottom()
    })
  } finally {
    uni.hideLoading()
  }
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

async function restoreLatestConversation() {
  const res = await request({
    url: `${BASE_API}/app/csConversation/query`,
    method: 'GET',
    header: buildAuthHeader(),
    data: {
      current: 1,
      size: 1
    }
  })

  if (res.statusCode !== 200 || !res.data || res.data.code !== 0) {
    throw new Error(res.data?.message || '获取客服会话失败')
  }

  const latestConversation = res.data.data?.records?.[0]
  if (!latestConversation) {
    throw new Error('暂无客服会话，请从商品或订单页面联系商家')
  }

  // 个人中心等无店铺上下文的入口，默认恢复最近一次客服会话。
  conversationId.value = latestConversation.id
  shopInfo.shopId = latestConversation.shopId
  shopInfo.merchantId = latestConversation.mchId
}

async function initConversation() {
  if (!ensureAuthenticated()) {
    throw new Error('未登录')
  }

  if (!conversationId.value && !shopInfo.shopId) {
    throw new Error('缺少客服会话或店铺信息')
  }

  uni.showLoading({ title: '初始化会话...' })
  try {
    const res = await request({
      url: `${BASE_API}/app/csConversation/init`,
      method: 'POST',
      header: buildAuthHeader(true),
      data: {
        conversationId: conversationId.value || undefined,
        shopId: shopInfo.shopId || undefined
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
      shopId: conversationData.shopId || shopInfo.shopId,
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

function handleWebSocketReconnect() {
  if (conversationId.value) {
    loadHistoryMessages()
  }
}

onLoad(async (options = {}) => {
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

  try {
    if (!conversationId.value && !shopInfo.shopId) {
      await restoreLatestConversation()
    }
    await initConversation()
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    if (!error?.handled && error?.message !== '未登录') {
      uni.showToast({
        title: error?.message || '打开客服会话失败',
        icon: 'none'
      })
    }
  }
})

onMounted(() => {
  if (!getToken()) {
    return
  }

  nextTick(() => {
    scrollToBottom()
  })
  setTimeout(() => {
    scrollToBottom()
  }, 1000)

  wsManager.on('biz-handle', 'cs-chat.mch', handleMerchantMessage)
  wsManager.onReconnect(handleWebSocketReconnect)
})

onUnmounted(() => {
  wsManager.off('biz-handle', 'cs-chat.mch')
  wsManager.offReconnect(handleWebSocketReconnect)
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

	

</style>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  color: var(--ym-ink);
  background: var(--ym-paper);
}

.customer-service-container,
.chat-content {
  min-width: 0;
  min-height: 0;
}

.service-header {
  min-height: 92rpx;
  flex: 0 0 auto;
  box-sizing: border-box;
  padding: 14rpx 24rpx;
  border-bottom-color: var(--ym-line);
}

.shop-info,
.shop-details {
  min-width: 0;
}

.shop-avatar {
  width: 64rpx;
  height: 64rpx;
  flex: 0 0 64rpx;
  border-radius: 18rpx;
  background: var(--ym-brand-soft);
}

.shop-name {
  display: block;
  overflow: hidden;
  color: var(--ym-ink);
  font-size: 28rpx;
  line-height: 1.4;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-content {
  box-sizing: border-box;
  padding: 24rpx;
  background: #eef2ef;
}

.message-wrapper {
  min-width: 0;
  max-width: 76%;
}

.service-message .message-content {
  border-color: var(--ym-line);
  border-radius: 6rpx 18rpx 18rpx 18rpx;
  background: var(--ym-surface);
}

.user-message .message-content {
  border-radius: 18rpx 6rpx 18rpx 18rpx;
  background: var(--ym-brand);
}

.input-section {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 104rpx;
  align-items: end;
  gap: 12rpx;
  box-sizing: border-box;
  padding: 14rpx 20rpx calc(14rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid var(--ym-line);
  background: var(--ym-surface);
  box-shadow: none;
}

.input-container {
  width: 100%;
  min-width: 0;
  min-height: 72rpx;
  grid-column: 1;
  grid-row: 1;
  margin: 0;
  border-color: var(--ym-line);
  border-radius: var(--ym-radius-control);
  background: var(--ym-paper);
}

.input-container:focus-within {
  border-color: var(--ym-brand);
}

.message-input {
  min-width: 0;
  min-height: 48rpx;
  max-height: 120rpx;
}

.input-actions {
  flex: 0 0 auto;
}

.send-btn {
  width: 104rpx;
  height: 72rpx;
  grid-column: 2;
  grid-row: 1;
  color: #fff;
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand);
  box-shadow: none;
}

.send-btn:hover:not(:disabled) {
  background: var(--ym-brand-strong);
  box-shadow: none;
}

.send-btn:disabled {
  color: var(--ym-muted);
  background: var(--ym-paper);
}

.image-preview-container {
  width: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
  box-sizing: border-box;
  margin: 0;
  border-color: var(--ym-line);
  border-radius: var(--ym-radius-control);
  background: var(--ym-paper);
}
</style>
