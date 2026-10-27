<template>
  <view class="about-page">
    <view class="about-card">
      <text v-if="content" class="about-content">{{ content }}</text>
      <text v-else-if="!loading" class="empty-content">暂未配置关于我们内容</text>
      <text v-else class="empty-content">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchAboutContent } from '@/utils/api.js'

const content = ref('')
const loading = ref(false)

async function loadContent() {
  loading.value = true
  try {
    content.value = await fetchAboutContent()
  } catch (error) {
    uni.showToast({ title: error.message || '获取内容失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad(() => loadContent())
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f6f7f9;
  box-sizing: border-box;
}

.about-card {
  min-height: 300rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 18rpx;
  box-sizing: border-box;
}

.about-content {
  color: #374151;
  font-size: 29rpx;
  line-height: 1.85;
  white-space: pre-wrap;
}

.empty-content {
  display: block;
  padding-top: 100rpx;
  color: #9aa2ad;
  font-size: 27rpx;
  text-align: center;
}
</style>
