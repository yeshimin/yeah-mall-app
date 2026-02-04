<template>
	<view class="page-container">
		<view class="customer-service-container">
			<!-- 头部信息 -->
			<view class="service-header">
				<view class="shop-info">
					<image class="shop-avatar" :src="shopInfo.avatar || defaultAvatar60" mode="aspectFill"></image>
					<view class="shop-details">
						<text class="shop-name">{{ shopInfo.name || '店铺客服' }}</text>
						<text class="service-status">{{ shopInfo.status || '在线' }}</text>
					</view>
				</view>
				<view class="header-actions">
					<text class="action-icon" @click="showShopInfo">ℹ️</text>
				</view>
			</view>

			<!-- 聊天内容区域 -->
			<scroll-view class="chat-content" scroll-y :show-scrollbar="false" ref="chatScroll">
				<view class="message-list">
					<!-- 系统消息 -->
					<view class="system-message">
						<text class="system-text">今天 10:00</text>
					</view>

					<!-- 所有消息，按时间顺序排列 -->
					<template v-for="(msg, index) in sortedMessages" :key="index">
						<!-- 客服消息 -->
						<view v-if="msg.type === 'service'" class="message-item service-message">
							<image class="sender-avatar" :src="shopInfo.avatar || defaultAvatar50" mode="aspectFill"></image>
							<view class="message-content">
								<text class="message-text" v-if="!msg.imageUrl">{{ msg.content }}</text>
								<image v-else class="message-image" :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)"></image>
								<text class="message-time">{{ msg.time }}</text>
							</view>
						</view>

						<!-- 用户消息 -->
						<view v-else-if="msg.type === 'user'" class="message-item user-message">
							<image class="sender-avatar" :src="userInfo.avatar || defaultAvatar50" mode="aspectFill"></image>
							<view class="message-content">
								<text class="message-text" v-if="!msg.imageUrl">{{ msg.content }}</text>
								<image v-else class="message-image" :src="msg.imageUrl" mode="aspectFill" @click="previewImage(msg.imageUrl)"></image>
								<text class="message-time">{{ msg.time }}</text>
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
				</view>
			</view>
			<button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">发送</button>
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

<script>
	import wsManager from '../../utils/websocket.js';
	import { getToken } from '../../utils/auth.js';
		export default {
		data() {
				return {
					// 默认头像（Base64编码，避免网络请求）
					defaultAvatar50: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
					defaultAvatar60: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
					defaultAvatar80: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
					shopInfo: {
						name: '店铺客服',
						avatar: '',
						status: '在线',
						description: '专业的客服团队，为您提供优质服务',
						serviceTime: '09:00-21:00',
						rating: '4.9',
						shopId: '3', // 店铺ID
						merchantId: '1' // 商家ID
					},
					userInfo: {
						avatar: '',
						userId: '1' // 用户ID
					},
					messages: [
						{
							content: '您好！欢迎咨询，有什么可以帮助您的吗？',
							time: '10:01',
							timestamp: new Date().setHours(10, 1, 0, 0), // 添加时间戳
							type: 'service'
						},
						{
							content: '我们的商品支持7天无理由退换，请您放心购买。',
							time: '10:02',
							timestamp: new Date().setHours(10, 2, 0, 0), // 添加时间戳
							type: 'service'
						}
					],
					userMessages: [],
					inputMessage: '',
					showQuickQuestions: false, // 关闭常见问题
					quickQuestions: [
						'商品什么时候发货？',
						'支持7天无理由退换吗？',
						'商品质量有保障吗？',
						'可以优惠吗？'
					],
					showShopInfoPopup: false,
					isInputFocused: false
				};
			},
			computed: {
				// 合并并排序消息
				sortedMessages() {
					// 复制所有消息
					const allMessages = [...this.messages, ...this.userMessages];
					// 按时间戳排序
					allMessages.sort((a, b) => {
						return (a.timestamp || 0) - (b.timestamp || 0);
					});
					return allMessages;
				}
			},
		methods: {
			// 发送消息
			sendMessage() {
				if (!this.inputMessage.trim()) return;

				// 构造消息内容
				const content = this.inputMessage.trim();
				const now = new Date();
				const newMessage = {
					content: content,
					time: this.getCurrentTime(),
					timestamp: now.getTime(), // 添加时间戳
					type: 'user' // 用户消息
				};

				// 添加到用户消息列表
				this.userMessages.push(newMessage);
				this.inputMessage = '';

				// 构造WebSocket消息格式
				const wsMessage = {
					category: 'biz-handle',
					command: 'cs-chat.mem',
					subCmd: 'msg.mem2mch',
					payload: {
						shopId: this.shopInfo.shopId,
						from: this.userInfo.userId,
						to: this.shopInfo.merchantId,
						content: content,
						type: 1 // 文本消息
					}
				};

				// 发送WebSocket消息
				console.log('发送客服消息:', wsMessage);
				const sendResult = wsManager.send(wsMessage);
				if (!sendResult) {
					uni.showToast({
						title: '发送失败，请检查网络连接',
						icon: 'none'
					});
				}

				this.$nextTick(() => {
					this.scrollToBottom();
				});
			},

			// 发送快捷问题
			sendQuickQuestion(question) {
				const now = new Date();
				const newMessage = {
					content: question,
					time: this.getCurrentTime(),
					timestamp: now.getTime(), // 添加时间戳
					type: 'user' // 用户消息
				};

				this.userMessages.push(newMessage);
				this.showQuickQuestions = false;

				// 构造WebSocket消息格式
				const wsMessage = {
					category: 'biz-handle',
					command: 'cs-chat.mem',
					subCmd: 'msg.mem2mch',
					payload: {
						shopId: this.shopInfo.shopId,
						from: this.userInfo.userId,
						to: this.shopInfo.merchantId,
						content: question,
						type: 1 // 文本消息
					}
				};

				// 发送WebSocket消息
				console.log('发送快捷问题:', wsMessage);
				const sendResult = wsManager.send(wsMessage);
				if (!sendResult) {
					uni.showToast({
						title: '发送失败，请检查网络连接',
						icon: 'none'
					});
				}

				this.$nextTick(() => {
					this.scrollToBottom();
				});
			},

			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 上传图片
						uni.showLoading({ title: '上传中...' });
						uni.uploadFile({
							url: 'http://192.168.31.61:8080/app/storage/upload',
							filePath: res.tempFilePaths[0],
							name: 'file',
							header: {
								'Authorization': `Bearer ${getToken()}`
							},
							success: (uploadRes) => {
								uni.hideLoading();
								if (uploadRes.statusCode === 200) {
									const response = JSON.parse(uploadRes.data);
									if (response.code === 0) {
										const fileKey = response.data.fileKey;
										
										// 添加到用户消息列表
										const now = new Date();
										const newMessage = {
											content: '[图片]',
											time: this.getCurrentTime(),
											timestamp: now.getTime(), // 添加时间戳
											imageUrl: res.tempFilePaths[0],
											type: 'user' // 用户消息
										};
										this.userMessages.push(newMessage);
										
										// 构造WebSocket消息格式
										const wsMessage = {
											category: 'biz-handle',
											command: 'cs-chat.mem',
											subCmd: 'msg.mem2mch',
											payload: {
												shopId: this.shopInfo.shopId,
												from: this.userInfo.userId,
												to: this.shopInfo.merchantId,
												content: fileKey,
												type: 2 // 图片消息
											}
										};
										
										// 发送WebSocket消息
										console.log('发送图片消息:', wsMessage);
										const sendResult = wsManager.send(wsMessage);
										if (!sendResult) {
											uni.showToast({
												title: '发送失败，请检查网络连接',
												icon: 'none'
											});
										}
										
										this.$nextTick(() => {
											this.scrollToBottom();
										});
									} else {
										uni.showToast({
											title: '上传失败: ' + (response.message || '未知错误'),
											icon: 'none'
										});
									}
								} else {
									uni.showToast({
										title: '上传失败: ' + uploadRes.statusCode,
										icon: 'none'
									});
								}
							},
							fail: (error) => {
								uni.hideLoading();
								uni.showToast({
									title: '上传失败: ' + error.errMsg,
									icon: 'none'
								});
							}
						});
					}
				});
			},

			// 显示店铺信息
			showShopInfo() {
				this.showShopInfoPopup = true;
			},

			// 关闭店铺信息弹窗
			closeShopInfoPopup() {
				this.showShopInfoPopup = false;
			},

			// 输入框聚焦
			onInputFocus() {
				this.isInputFocused = true;
				this.showQuickQuestions = false;
				this.$nextTick(() => {
					this.scrollToBottom();
				});
			},

			// 输入框失焦
			onInputBlur() {
				this.isInputFocused = false;
			},

			// 滚动到底部
			scrollToBottom() {
				// 使用setTimeout确保DOM完全更新后执行
				setTimeout(() => {
					if (this.$refs.chatScroll) {
						// 使用uni-app的scroll-view方法
						this.$refs.chatScroll.scrollTo({
							top: 999999, // 设置一个足够大的值，确保滚动到最底部
							duration: 300
						});
						console.log('滚动到底部');
					}
				}, 100); // 增加延迟时间，确保DOM完全更新
			},

			// 获取当前时间
			getCurrentTime() {
				const now = new Date();
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');
				return `${hours}:${minutes}`;
			},
			
			// 预览图片
			previewImage(imageUrl) {
				uni.previewImage({
					urls: [imageUrl],
					success: (res) => {
						console.log('预览图片成功', res);
					},
					fail: (error) => {
						console.error('预览图片失败', error);
					}
				});
			}
		},
		mounted() {
			// 页面加载时滚动到底部
			this.$nextTick(() => {
				this.scrollToBottom();
			});
			
			// 注册WebSocket消息处理器
			wsManager.on('biz-handle', 'cs-chat.mch', (message) => {
				console.log('收到商家消息:', message);
				// 处理商家发送的消息
				if (message.subCmd === 'msg.mch2mem') {
					const payload = message.payload;
					let content = payload.content;
					let imageUrl = null;
					
					// 如果是图片消息，需要处理图片显示
					if (payload.type === 2) {
						content = '[图片]';
						// 这里需要根据图片的fileKey构建图片URL
						// 实际项目中可能需要使用特定的图片服务器URL
						imageUrl = `http://192.168.31.61:8080/public/storage/preview?fileKey=${payload.content}`;
					}
					
					// 添加到消息列表
					const now = new Date();
					const newMessage = {
						content: content,
						time: this.getCurrentTime(),
						timestamp: now.getTime(), // 添加时间戳
						imageUrl: imageUrl,
						type: 'service' // 客服消息
					};
					this.messages.push(newMessage);
					
					this.$nextTick(() => {
						this.scrollToBottom();
					});
				}
			});
		},
	};
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

	.service-status {
		font-size: 24rpx;
		color: #3cc51f;
	}

	.header-actions {
		display: flex;
		align-items: center;
	}

	.action-icon {
		font-size: 36rpx;
		margin-left: 20rpx;
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

	.system-message {
		display: flex;
		justify-content: center;
		margin: 20rpx 0;
	}

	.system-text {
		font-size: 20rpx;
		color: #999;
		background-color: #f0f0f0;
		padding: 5rpx 15rpx;
		border-radius: 20rpx;
	}

	.message-item {
		display: flex;
		margin-bottom: 20rpx;
		align-items: flex-end;
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

	.message-content {
		max-width: 70%;
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
		margin-bottom: 5rpx;
	}

	.message-time {
		font-size: 20rpx;
		color: #999;
		text-align: right;
	}

	.user-message .message-time {
						color: rgba(255, 255, 255, 0.7);
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