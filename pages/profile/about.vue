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
  background: var(--ym-paper);
  box-sizing: border-box;
}

.about-card {
  min-height: 300rpx;
  padding: 32rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
  box-sizing: border-box;
}

.about-content {
  color: var(--ym-ink-secondary);
  font-size: 29rpx;
  line-height: 1.85;
  white-space: pre-wrap;
}

.empty-content {
  display: block;
  padding-top: 100rpx;
  color: var(--ym-muted);
  font-size: 27rpx;
  text-align: center;
}
</style>
