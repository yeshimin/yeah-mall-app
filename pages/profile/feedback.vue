<template>
  <view class="feedback-page">
    <view class="feedback-card">
      <view class="card-title">提交意见反馈</view>
      <textarea
        v-model="form.content"
        class="feedback-content"
        maxlength="500"
        placeholder="请描述你遇到的问题或建议，我们会认真处理"
        placeholder-class="placeholder"
      />
      <view class="content-count">{{ form.content.length }}/500</view>

      <view class="section-label">反馈图片（可选，最多 6 张）</view>
      <view class="image-grid">
        <view v-for="(image, index) in images" :key="image.localPath" class="image-item">
          <image :src="image.localPath" mode="aspectFill" />
          <view class="image-remove" @click="removeImage(index)">×</view>
          <view v-if="image.uploading" class="image-uploading">上传中</view>
        </view>
        <view v-if="images.length < 6" class="image-add" @click="chooseImages">
          <text class="image-add-icon">+</text>
          <text>添加图片</text>
        </view>
      </view>

      <view class="section-label">联系方式（可选）</view>
      <input
        v-model="form.contact"
        class="contact-input"
        maxlength="50"
        placeholder="手机号、微信或邮箱，方便我们联系你"
        placeholder-class="placeholder"
      />

      <button class="submit-button" :disabled="submitting || uploadingCount > 0" @click="submit">
        {{ submitting ? '提交中...' : uploadingCount > 0 ? '图片上传中...' : '提交反馈' }}
      </button>
    </view>

    <view class="history-title">我的反馈</view>
    <view v-if="feedbacks.length" class="feedback-history">
      <view v-for="item in feedbacks" :key="item.feedback.id" class="history-item">
        <view class="history-heading">
          <text :class="['status-tag', `status-${item.feedback.status}`]">{{ statusText(item.feedback.status) }}</text>
          <text class="history-time">{{ item.feedback.createTime }}</text>
        </view>
        <text class="history-content">{{ item.feedback.content }}</text>
        <view v-if="item.images?.length" class="history-images">
          <image v-for="image in item.images" :key="image" :src="getStoragePreviewUrl(image)" mode="aspectFill" />
        </view>
        <view v-if="item.feedback.replyContent" class="reply-box">
          <text class="reply-label">平台回复</text>
          <text>{{ item.feedback.replyContent }}</text>
          <text v-if="item.feedback.replyTime" class="reply-time">{{ item.feedback.replyTime }}</text>
        </view>
      </view>
    </view>
    <view v-else-if="!loading" class="empty-state">暂时还没有反馈记录</view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchFeedbackList, submitFeedback, uploadImage } from '@/utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'

const form = reactive({ content: '', contact: '' })
const images = ref([])
const feedbacks = ref([])
const submitting = ref(false)
const uploadingCount = ref(0)
const loading = ref(false)

function statusText(status) {
  return ({ '1': '待处理', '2': '处理中', '3': '已解决' })[String(status)] || '未知状态'
}

function chooseImages() {
  uni.chooseImage({
    count: 6 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (result) => {
      const selected = result.tempFilePaths.map((localPath) => ({
        localPath,
        fileKey: '',
        uploading: true
      }))
      images.value.push(...selected)
      uploadingCount.value += selected.length
      await Promise.all(
        selected.map(async (image) => {
          try {
            image.fileKey = await uploadImage(image.localPath)
          } catch (error) {
            images.value = images.value.filter((item) => item !== image)
            uni.showToast({ title: error.message || '图片上传失败', icon: 'none' })
          } finally {
            image.uploading = false
            uploadingCount.value -= 1
          }
        })
      )
    }
  })
}

function removeImage(index) {
  if (images.value[index]?.uploading) {
    return
  }
  images.value.splice(index, 1)
}

async function submit() {
  const content = form.content.trim()
  if (!content) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }
  if (uploadingCount.value > 0 || images.value.some((image) => !image.fileKey)) {
    uni.showToast({ title: '请等待图片上传完成', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await submitFeedback({
      content,
      contact: form.contact.trim(),
      images: images.value.map((image) => image.fileKey)
    })
    uni.showToast({ title: '反馈已提交', icon: 'success' })
    form.content = ''
    form.contact = ''
    images.value = []
    loadFeedbacks()
  } catch (error) {
    uni.showToast({ title: error.message || '提交反馈失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function loadFeedbacks() {
  loading.value = true
  try {
    const page = await fetchFeedbackList()
    feedbacks.value = page.records || []
  } catch (error) {
    if (error.message !== 'AUTH_401') {
      uni.showToast({ title: error.message || '获取反馈记录失败', icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

onLoad(() => loadFeedbacks())
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  padding: 24rpx;
  background: var(--ym-paper);
  box-sizing: border-box;
}

.feedback-card,
.history-item {
  padding: 28rpx;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-card);
  background: var(--ym-surface);
  box-sizing: border-box;
}

.card-title,
.history-title {
  color: var(--ym-ink);
  font-size: 32rpx;
  font-weight: 600;
}

.feedback-content {
  width: 100%;
  min-height: 240rpx;
  box-sizing: border-box;
  margin-top: 20rpx;
  padding: 20rpx;
  color: var(--ym-ink-secondary);
  border-radius: var(--ym-radius-control);
  background: #f7faf8;
  font-size: 28rpx;
  line-height: 1.6;
}

.placeholder {
  color: var(--ym-muted);
}

.content-count {
  color: var(--ym-muted);
  font-size: 22rpx;
  text-align: right;
}

.section-label {
  margin: 28rpx 0 16rpx;
  color: var(--ym-ink-secondary);
  font-size: 26rpx;
}

.image-grid,
.history-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item,
.image-add {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  overflow: hidden;
  border-radius: 12rpx;
}

.image-item image,
.history-images image {
  width: 100%;
  height: 100%;
}

.image-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ym-muted);
  border: 1rpx dashed var(--ym-line-strong);
  background: #f7faf8;
  font-size: 22rpx;
}

.image-add-icon {
  font-size: 48rpx;
  line-height: 1;
}

.image-remove {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  display: flex;
  width: 40rpx;
  height: 40rpx;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgb(0 0 0 / 55%);
  border-radius: 50%;
}

.image-uploading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgb(0 0 0 / 45%);
  font-size: 22rpx;
}

.contact-input {
  height: 82rpx;
  padding: 0 22rpx;
  color: var(--ym-ink-secondary);
  background: #f7faf8;
  border-radius: var(--ym-radius-control);
  box-sizing: border-box;
  font-size: 27rpx;
}

.submit-button {
  height: 88rpx;
  margin-top: 36rpx;
  color: #fff;
  background: var(--ym-brand);
  border: 0;
  border-radius: var(--ym-radius-control);
  font-size: 30rpx;
  line-height: 88rpx;
}

.submit-button::after {
  border: 0;
}

.submit-button[disabled] {
  opacity: 0.55;
}

.history-title {
  margin: 36rpx 0 18rpx;
}

.feedback-history {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.history-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.status-tag {
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.status-1 {
  color: #a15c00;
  background: #fff3d9;
}

.status-2 {
  color: #175cd3;
  background: #e8f1ff;
}

.status-3 {
  color: #067647;
  background: #dcfae6;
}

.history-time,
.reply-time {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.history-content {
  display: block;
  margin: 18rpx 0;
  color: var(--ym-ink-secondary);
  font-size: 27rpx;
  line-height: 1.6;
  white-space: pre-wrap;
}

.history-images image {
  width: 116rpx;
  height: 116rpx;
  border-radius: 10rpx;
}

.reply-box {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 20rpx;
  padding: 18rpx;
  color: var(--ym-ink-secondary);
  background: var(--ym-brand-soft);
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 1.6;
}

.reply-label {
  color: var(--ym-brand);
  font-size: 24rpx;
  font-weight: 600;
}

.empty-state {
  padding: 72rpx 0;
  color: var(--ym-muted);
  font-size: 27rpx;
  text-align: center;
}
</style>
