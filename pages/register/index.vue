<template>
	<view class="register-container">
		<view class="register-header">
			<text class="register-title">用户注册</text>
		</view>
		
		<view class="register-form">
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
			
			<view class="input-item">
				<input 
					class="input" 
					type="password" 
					placeholder="请确认密码" 
					v-model="confirmPassword"
				/>
			</view>
			
			<button class="register-btn" @click="handleRegister">注册</button>
			
			<navigator url="/pages/login/index" class="login-link">
				已有账号？立即登录
			</navigator>
		</view>
	</view>
</template>

<script setup>
import CryptoJS from 'crypto-js'
import { ref } from 'vue'
import { BASE_API } from '@/utils/config.js'

const mobile = ref('')
const password = ref('')
const confirmPassword = ref('')

function handleRegister() {
  if (!mobile.value || !password.value || !confirmPassword.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  if (password.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    })
    return
  }

  uni.request({
    url: `${BASE_API}/app/auth/register`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      mobile: mobile.value,
      password: CryptoJS.SHA256(password.value).toString()
    },
    success: (res) => {
      if (res.data.code === 0) {
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/index'
          })
        }, 1000)
        return
      }

      uni.showToast({
        title: res.data.message || '注册失败',
        icon: 'none'
      })
    },
    fail: (error) => {
      console.error('注册失败', error)
      uni.showToast({
        title: '注册失败，请稍后重试',
        icon: 'none'
      })
    }
  })
}
</script>

<style scoped>
	.register-container {
		padding: 40rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.register-header {
		text-align: center;
		margin-bottom: 60rpx;
		padding-top: 100rpx;
	}
	
	.register-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
	}
	
	.register-form {
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
	
	.register-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		background-color: #007AFF;
		color: #fff;
		font-size: 32rpx;
		border-radius: 10rpx;
		margin-top: 40rpx;
	}
	
	.login-link {
		display: block;
		text-align: center;
		margin-top: 30rpx;
		color: #007AFF;
		font-size: 28rpx;
	}
</style>
