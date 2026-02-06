<template>
  <view class="edit-profile-container">
    <view class="content">
      <!-- 头像编辑 -->
      <view class="form-item">
        <text class="label">头像</text>
        <view class="avatar-container">
          <image class="avatar" :src="formData.avatarUrl" mode="aspectFill" @click="chooseAvatar"></image>
        </view>
      </view>

      <!-- 昵称编辑 -->
      <view class="form-item">
        <text class="label">昵称</text>
        <input class="input" v-model="formData.nickname" placeholder="请输入昵称" maxlength="20"></input>
      </view>

      <!-- 性别编辑 -->
      <view class="form-item">
        <text class="label">性别</text>
        <view class="gender-options">
          <view class="gender-option" :class="{ active: formData.gender === 0 }" @click="formData.gender = 0">
            <text>保密</text>
          </view>
          <view class="gender-option" :class="{ active: formData.gender === 1 }" @click="formData.gender = 1">
            <text>男</text>
          </view>
          <view class="gender-option" :class="{ active: formData.gender === 2 }" @click="formData.gender = 2">
            <text>女</text>
          </view>
        </view>
      </view>

      <!-- 生日编辑 -->
      <view class="form-item">
        <text class="label">生日</text>
        <input class="input" v-model="formData.birthday" placeholder="请选择生日" @click="showDatePicker"></input>
      </view>

      <!-- 手机号（只读） -->
      <view class="form-item">
        <text class="label">手机号</text>
        <view class="mobile-container">
          <text class="readonly-text">{{ displayMobile }}</text>
          <button class="eye-btn" @click="toggleMobileVisibility">
            <text>{{ showMobile ? '👁️' : '👁️‍🗨️' }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-save">
      <button class="save-btn" @click="saveProfile">保存</button>
    </view>

    <!-- 日期选择器 -->
    <picker mode="date" :value="formData.birthday" start="1900-01-01" end="2026-12-31" @change="onDateChange" v-if="showPicker">
      <view class="picker-view">
        <text>选择日期</text>
      </view>
    </picker>
  </view>
</template>

<script>
import { getToken, handleAuthFailure } from '../../utils/auth.js'
import { fetchUserDetail, updateProfile, uploadImage } from '../../utils/api.js'
import { BASE_API } from '../../utils/config.js'

export default {
  name: 'EditProfile',
  data() {
    return {
      formData: {
        nickname: '',
        gender: 0,
        birthday: '',
        avatarUrl: '../../static/logo.png',
        avatar: ''
      },
      userInfo: {
        mobile: ''
      },
      showPicker: false,
      showMobile: false
    }
  },
  computed: {
    // 计算显示的手机号（脱敏或完整）
    displayMobile() {
      const mobile = this.userInfo.mobile
      if (!mobile) return '未设置'
      if (this.showMobile) return mobile
      // 脱敏处理：保留前3位和后4位
      return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      fetchUserDetail()
        .then(data => {
          const avatarUrl = data.avatar ? `${BASE_API}/public/storage/preview?fileKey=${data.avatar}` : '../../static/logo.png'
          
          this.formData = {
            nickname: data.nickname || '',
            gender: data.gender || 0,
            birthday: data.birthday || '',
            avatarUrl: avatarUrl,
            avatar: data.avatar || ''
          }
          
          this.userInfo = {
            mobile: data.mobile || ''
          }
        })
        .catch(err => {
          if (err && err.message === 'AUTH_401') {
            handleAuthFailure()
            return
          }
          console.error('获取用户信息失败', err)
        })
    },
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFile = res.tempFiles[0]
          this.formData.avatarUrl = res.tempFilePaths[0]
          
          // 选择图片后直接上传获取文件key
          uni.showLoading({ title: '上传中...' })
          uploadImage(tempFile.path)
            .then(fileKey => {
              uni.hideLoading()
              this.formData.avatar = fileKey
            })
            .catch(err => {
              uni.hideLoading()
              uni.showToast({ title: '头像上传失败', icon: 'none' })
              console.error('头像上传失败', err)
            })
        }
      })
    },
    
    // 显示日期选择器
    showDatePicker() {
      this.showPicker = true
    },
    
    // 日期选择变化
    onDateChange(e) {
      this.formData.birthday = e.detail.value
      this.showPicker = false
    },
    
    // 保存个人信息
    saveProfile() {
      if (!this.formData.nickname) {
        uni.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }

      uni.showLoading({ title: '保存中...' })

      // 构建更新数据
      const updateData = {
        nickname: this.formData.nickname,
        gender: this.formData.gender,
        birthday: this.formData.birthday
      }
      
      // 如果有上传头像，添加avatar字段
      if (this.formData.avatar) {
        updateData.avatar = this.formData.avatar
      }
      
      // 保存所有信息
      updateProfile(updateData)
        .then(() => {
          uni.hideLoading()
          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => {
            this.goBack()
          }, 1000)
        })
        .catch(err => {
          uni.hideLoading()
          uni.showToast({ title: '保存失败', icon: 'none' })
          console.error('保存失败', err)
        })
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 切换手机号显示状态
    toggleMobileVisibility() {
      this.showMobile = !this.showMobile
    }
  }
}
</script>

<style scoped>
.edit-profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.content {
  padding: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background-color: white;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.label {
  font-size: 28rpx;
  color: #666;
  width: 100rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
  padding-right: 20rpx;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.edit-avatar-btn {
  background: none;
  border: 1rpx solid #007aff;
  color: #007aff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.gender-options {
  display: flex;
  gap: 30rpx;
}

.gender-option {
  padding: 10rpx 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.gender-option.active {
  border-color: #007aff;
  color: #007aff;
  background-color: rgba(0, 122, 255, 0.1);
}

.readonly-text {
  font-size: 28rpx;
  color: #999;
}

.mobile-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.eye-btn {
  background: none;
  border: none;
  font-size: 28rpx;
}

.bottom-save {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.save-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.picker-view {
  display: none;
}
</style>