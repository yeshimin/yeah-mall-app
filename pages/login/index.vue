<template>
	<view class="login-container">
		<view class="login-header">
			<text class="login-title">手机验证码登录</text>
		</view>
		
		<view class="login-form">
			<!-- 手机号输入 -->
			<view class="input-item">
				<input 
					class="input" 
					type="number" 
					placeholder="请输入手机号" 
					maxlength="11"
					v-model="mobile"
				/>
			</view>
			
			<!-- 验证码输入 + 发送按钮 -->
			<view class="input-item code-row">
				<input 
					class="input code-input" 
					type="number" 
					placeholder="请输入短信验证码" 
					maxlength="6"
					v-model="smsCode"
				/>
				<button 
					class="code-btn" 
					:disabled="sendingCode || countdown > 0"
					@click="sendCode"
				>
					<text v-if="countdown === 0">获取验证码</text>
					<text v-else>{{ countdown }}s 后重试</text>
				</button>
			</view>
			
			<button class="login-btn" @click="handleLogin">登录</button>
			
			<navigator url="/pages/register/index" class="register-link">
				还没有账号？立即注册
			</navigator>
		</view>
	</view>
</template>
	
<script>
	import { BASE_API } from '@/utils/config.js'
		import wsManager from '@/utils/websocket.js'
	
	export default {
		data() {
			return {
				mobile: '',
				smsCode: '',
				sendingCode: false,
				countdown: 0,
				_timer: null
			}
		},
		beforeDestroy() {
			// 清理倒计时定时器
			if (this._timer) {
				clearInterval(this._timer)
				this._timer = null
			}
		},
		methods: {
			// 校验手机号格式
			validateMobile() {
				if (!this.mobile) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
					return false
				}
				// 简单的国内手机号校验，可根据需要调整
				const reg = /^1[3-9]\d{9}$/
				if (!reg.test(this.mobile)) {
					uni.showToast({
						title: '手机号格式不正确',
						icon: 'none'
					})
					return false
				}
				return true
			},
			// 发送短信验证码
			sendCode() {
				if (!this.validateMobile()) return
				if (this.sendingCode || this.countdown > 0) return
				
				this.sendingCode = true
				uni.request({
					// 根据你的后端实际接口修改路径
					url: `${BASE_API}/app/auth/sendSmsCode`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						mobile: this.mobile
					},
					success: (res) => {
						if (res.data && res.data.code === 0) {
							uni.showToast({
								title: '验证码已发送',
								icon: 'success'
							})
							// 开始倒计时
							this.countdown = 60
							this._timer = setInterval(() => {
								if (this.countdown > 0) {
									this.countdown--
								} else {
									clearInterval(this._timer)
									this._timer = null
								}
							}, 1000)
						} else {
							uni.showToast({
								title: (res.data && res.data.message) || '发送失败',
								icon: 'none'
							})
						}
					},
					fail: (err) => {
						console.error('发送验证码失败', err)
						uni.showToast({
							title: '发送失败，请稍后重试',
							icon: 'none'
						})
					},
					complete: () => {
						this.sendingCode = false
					}
				})
			},
			// 短信验证码登录
			handleLogin() {
				if (!this.validateMobile()) return
				if (!this.smsCode) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					})
					return
				}
				
				uni.request({
					// 根据你的后端实际接口修改路径
					url: `${BASE_API}/app/auth/login`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						mobile: this.mobile,
						smsCode: this.smsCode,
						terminal: 'app'
					},
					success: (res) => {
						if (res.data && res.data.code === 0) {
							// 登录成功，保存token到本地存储
							uni.setStorageSync('token', res.data.data.token)
							
							// 解析token获取userId并保存（沿用原有逻辑）
							try {
								const base64Url = res.data.data.token.split('.')[1]
								const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
								const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
									return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
								}).join(''))
								
								const payload = JSON.parse(jsonPayload)
								if (payload && payload.aud) {
									uni.setStorageSync('userId', payload.aud)
								}
							} catch (error) {
								console.error('解析token失败', error)
							}
							
							uni.showToast({
							title: '登录成功',
							icon: 'success'
						})
						
						// 登录成功后初始化 WebSocket 连接
						wsManager.init();
						
						// 导航到首页或返回上一页
					setTimeout(() => {
						uni.navigateBack({
							fail: () => {
								// 如果没有上一页，跳转到首页
								uni.redirectTo({
									url: '/pages/index/index'
								})
							}
						})
					}, 1000)
						} else {
							uni.showToast({
								title: (res.data && res.data.message) || '登录失败',
								icon: 'none'
							})
						}
					},
					fail: (err) => {
						console.error('登录失败', err)
						uni.showToast({
							title: '登录失败，请稍后重试',
							icon: 'none'
						})
					}
				})
			}
		}
	}
</script>

<style scoped>
	.login-container {
		padding: 40rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.login-header {
		text-align: center;
		margin-bottom: 60rpx;
		padding-top: 100rpx;
	}
	
	.login-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
	}
	
	.login-form {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
	}
	
	.input-item {
		margin-bottom: 30rpx;
		border-bottom: 1rpx solid #eee;
		padding-bottom: 20rpx;
		display: flex;
		align-items: center;
	}
	
	.input {
		flex: 1;
		font-size: 32rpx;
		padding: 20rpx 0;
	}

	.code-row {
		justify-content: space-between;
	}

	.code-input {
		margin-right: 20rpx;
	}

	.code-btn {
		width: 220rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 26rpx;
		border-radius: 30rpx;
		background-color: #007AFF;
		color: #fff;
		text-align: center;
		padding: 0;
	}

	.code-btn[disabled] {
		background-color: #cccccc;
		color: #666666;
	}
	
	.login-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background-color: #007AFF;
		color: #fff;
		font-size: 32rpx;
		border-radius: 10rpx;
		margin-top: 40rpx;
	}
	
	.register-link {
		display: block;
		text-align: center;
		margin-top: 30rpx;
		color: #007AFF;
		font-size: 28rpx;
	}
</style>