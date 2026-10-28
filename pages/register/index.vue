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
		min-height: 100vh;
		box-sizing: border-box;
		padding: 56rpx 32rpx;
		background: var(--ym-paper);
	}
	
	.register-header {
		width: 100%;
		max-width: 520px;
		box-sizing: border-box;
		margin: 0 auto 44rpx;
		padding-top: 48rpx;
		text-align: center;
	}
	
	.register-title {
		color: var(--ym-ink);
		font-size: 44rpx;
		font-weight: 700;
	}
	
	.register-form {
		width: 100%;
		max-width: 520px;
		box-sizing: border-box;
		margin: 0 auto;
		padding: 40rpx;
		border: 1rpx solid var(--ym-line);
		border-radius: var(--ym-radius-card);
		background: var(--ym-surface);
		box-shadow: var(--ym-shadow-card);
	}
	
	.input-item {
		display: flex;
		min-height: 92rpx;
		align-items: center;
		margin-bottom: 16rpx;
		border-bottom: 1rpx solid var(--ym-line);
	}
	
	.input {
		width: 100%;
		color: var(--ym-ink);
		font-size: 30rpx;
	}
	
	.register-btn {
		width: 100%;
		height: 88rpx;
		margin-top: 36rpx;
		color: #fff;
		border-radius: var(--ym-radius-control);
		background: var(--ym-brand);
		font-size: 32rpx;
		font-weight: 600;
		line-height: 88rpx;
	}

	.register-btn::after {
		border: 0;
	}
	
	.login-link {
		display: block;
		margin-top: 30rpx;
		color: var(--ym-brand);
		font-size: 28rpx;
		text-align: center;
	}
</style>
