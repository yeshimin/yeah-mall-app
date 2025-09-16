<template>
	<view class="login-container">
		<view class="login-header">
			<text class="login-title">用户登录</text>
		</view>
		
		<view class="login-form">
			<view class="input-item">
				<input 
					class="input" 
					type="text" 
					placeholder="请输入手机号" 
					v-model="mobile"
				/>
			</view>
			
			<view class="input-item">
				<input 
					class="input" 
					type="password" 
					placeholder="请输入密码" 
					v-model="password"
				/>
			</view>
			
			<button class="login-btn" @click="handleLogin">登录</button>
			
			<navigator url="/pages/register/index" class="register-link">
				还没有账号？立即注册
			</navigator>
		</view>
	</view>
</template>

<script>
	import CryptoJS from 'crypto-js'
	
	export default {
		data() {
			return {
				mobile: '',
				password: ''
			}
		},
		methods: {
			handleLogin() {
				if (!this.mobile || !this.password) {
					uni.showToast({
						title: '请输入手机号和密码',
						icon: 'none'
					})
					return
				}
				
				// 调用登录API
				uni.request({
					url: 'http://localhost:8080/app/auth/login',
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						mobile: this.mobile,
						password: CryptoJS.SHA256(this.password).toString()
					},
					success: (res) => {
						if (res.data.code === 0) {
							// 登录成功，保存token到本地存储
							uni.setStorageSync('token', res.data.data.token)
							
							// 解析token获取userId并保存
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
							
							// 返回到上一页（商品详情页面）
							setTimeout(() => {
								uni.navigateBack()
							}, 1000)
						} else {
							uni.showToast({
								title: res.data.message || '登录失败',
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
	}
	
	.input {
		width: 100%;
		font-size: 32rpx;
		padding: 20rpx 0;
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