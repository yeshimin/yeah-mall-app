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
	
<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { BASE_API } from '@/utils/config.js'
import wsManager from '@/utils/websocket.js'

const TAB_BAR_PAGES = new Set([
  '/pages/index/index',
  '/pages/category/category',
  '/pages/cart/cart',
  '/pages/profile/profile'
])

const mobile = ref('')
const smsCode = ref('')
const sendingCode = ref(false)
const countdown = ref(0)
const redirectUrl = ref('')

let timer = null

function clearTimer() {
  if (!timer) {
    return
  }

  clearInterval(timer)
  timer = null
}

function validateMobile() {
  if (!mobile.value) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return false
  }

  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(mobile.value)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none'
    })
    return false
  }

  return true
}

function startCountdown() {
  countdown.value = 60
  clearTimer()

  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1
      return
    }

    clearTimer()
  }, 1000)
}

function persistUserInfo(token) {
  uni.setStorageSync('token', token)

  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((char) => {
        return `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`
      }).join('')
    )
    const payload = JSON.parse(jsonPayload)

    if (payload && payload.aud) {
      uni.setStorageSync('userId', payload.aud)
    }
  } catch (error) {
    console.error('解析 token 失败', error)
  }
}

function navigateAfterLogin() {
  const currentRedirect = redirectUrl.value
  if (currentRedirect) {
    const redirectPath = currentRedirect.split('?')[0]
    if (TAB_BAR_PAGES.has(redirectPath)) {
      uni.switchTab({
        url: redirectPath
      })
    } else {
      uni.redirectTo({
        url: currentRedirect
      })
    }
    return
  }

  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({
    url: '/pages/index/index'
  })
}

function sendCode() {
  if (!validateMobile() || sendingCode.value || countdown.value > 0) {
    return
  }

  sendingCode.value = true
  uni.request({
    url: `${BASE_API}/app/auth/sendSmsCode`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      mobile: mobile.value
    },
    success: (res) => {
      if (res.data && res.data.code === 0) {
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        startCountdown()
        return
      }

      uni.showToast({
        title: (res.data && res.data.message) || '发送失败',
        icon: 'none'
      })
    },
    fail: (error) => {
      console.error('发送验证码失败', error)
      uni.showToast({
        title: '发送失败，请稍后重试',
        icon: 'none'
      })
    },
    complete: () => {
      sendingCode.value = false
    }
  })
}

function handleLogin() {
  if (!validateMobile()) {
    return
  }

  if (!smsCode.value) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }

  uni.request({
    url: `${BASE_API}/app/auth/login`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      mobile: mobile.value,
      smsCode: smsCode.value,
      terminal: 'app'
    },
    success: (res) => {
      const token = res.data && res.data.data && res.data.data.token
      if (res.data && res.data.code === 0 && token) {
        persistUserInfo(token)
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        wsManager.init()

        setTimeout(() => {
          navigateAfterLogin()
        }, 1000)
        return
      }

      uni.showToast({
        title: (res.data && res.data.message) || '登录失败',
        icon: 'none'
      })
    },
    fail: (error) => {
      console.error('登录失败', error)
      uni.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none'
      })
    }
  })
}

onLoad((options = {}) => {
  redirectUrl.value = options.redirect ? decodeURIComponent(options.redirect) : ''
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
	.login-container {
		min-height: 100vh;
		box-sizing: border-box;
		padding: 56rpx 32rpx;
		background: var(--ym-paper);
	}
	
	.login-header {
		width: 100%;
		max-width: 520px;
		box-sizing: border-box;
		margin: 0 auto 44rpx;
		padding-top: 48rpx;
		text-align: center;
	}
	
	.login-title {
		color: var(--ym-ink);
		font-size: 44rpx;
		font-weight: 700;
	}
	
	.login-form {
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
		align-items: center;
		min-height: 92rpx;
		margin-bottom: 16rpx;
		border-bottom: 1rpx solid var(--ym-line);
	}
	
	.input {
		flex: 1;
		min-width: 0;
		color: var(--ym-ink);
		font-size: 30rpx;
	}

	.code-row {
		justify-content: space-between;
	}

	.code-input {
		margin-right: 20rpx;
	}

	.code-btn {
		width: 224rpx;
		height: 68rpx;
		padding: 0 16rpx;
		color: #fff;
		border-radius: var(--ym-radius-control);
		background: var(--ym-brand);
		font-size: 26rpx;
		line-height: 68rpx;
		white-space: nowrap;
	}

	.code-btn[disabled] {
		color: var(--ym-muted);
		background: var(--ym-brand-soft);
	}
	
	.login-btn {
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

	.code-btn::after,
	.login-btn::after {
		border: 0;
	}
	
	.register-link {
		display: block;
		margin-top: 30rpx;
		color: var(--ym-brand);
		font-size: 28rpx;
		text-align: center;
	}
</style>
