<template>
  <view class="container">
    <!-- 活动列表 -->
    <view class="activity-list">
      <view 
        v-for="(activity, index) in seckillActivities" 
        :key="activity.id"
        class="activity-item"
        @click="goToActivityDetail(activity)"
      >
        <!-- 活动图片 -->
        <view class="activity-image-container">
          <image 
            class="activity-image" 
            :src="activity.coverImage"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </view>
        
        <!-- 活动信息 -->
        <view class="activity-info">
          <view class="activity-header">
            <text class="activity-name">{{ activity.name }}</text>
            <view class="activity-status" :class="{ active: activity.status === '5' }">
              <text class="status-text">{{ getActivityStatusText(activity.status) }}</text>
            </view>
          </view>
          <text class="activity-description">{{ activity.description }}</text>
          <view class="activity-time">
            <text class="time-label">开始时间：</text>
            <text class="time-text">{{ activity.activityBeginTime }}</text>
          </view>
          <view class="activity-time">
            <text class="time-label">截止时间：</text>
            <text class="time-text">{{ activity.activityEndTime }}</text>
          </view>
        </view>
        
        <!-- 透明覆盖层，确保点击事件被捕获 -->
        <view class="activity-overlay"></view>
      </view>
    </view>



    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 无数据 -->
    <view v-if="!loading && seckillActivities.length === 0" class="empty-container">
      <text class="empty-text">暂无秒杀活动</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

const seckillActivities = ref([])
const loading = ref(false)

function handleImageLoad() {}

function handleImageError(error) {
  void error
}

function fetchSeckillActivities() {
  if (loading.value) {
    return
  }

  loading.value = true
  authRequest({
    url: `${BASE_API}/app/seckill/queryActivity`,
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    if (res.statusCode === 200 && res.data.code === 0) {
      const responseData = res.data.data || {}
      seckillActivities.value = (responseData.records || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        coverImage: getStoragePreviewUrl(item.coverImage),
        applyBeginTime: item.applyBeginTime,
        applyEndTime: item.applyEndTime,
        activityBeginTime: item.activityBeginTime,
        activityEndTime: item.activityEndTime,
        status: item.status
      }))
    } else {
      console.error('获取秒杀活动失败:', res.data && res.data.message)
    }
    loading.value = false
  }, (error) => {
    console.error('请求秒杀活动失败:', error)
    loading.value = false
  })
}

function goToActivityDetail(activity) {
  if (activity.status === '6') {
    uni.showToast({
      title: '活动已结束',
      icon: 'none',
      duration: 2000
    })
    return
  }

  if (activity.status !== '5') {
    uni.showToast({
      title: '活动尚未开始',
      icon: 'none',
      duration: 2000
    })
    return
  }

  uni.navigateTo({
    url: `/pages/seckill/product-list?activityId=${activity.id}&activityName=${encodeURIComponent(activity.name)}&activityDescription=${encodeURIComponent(activity.description)}&activityStatus=${activity.status}&activityBeginTime=${encodeURIComponent(activity.activityBeginTime)}&activityEndTime=${encodeURIComponent(activity.activityEndTime)}&coverImage=${encodeURIComponent(activity.coverImage)}`
  })
}

function getActivityStatusText(status) {
  const statusMap = {
    '1': '新建',
    '2': '发布',
    '3': '开始报名',
    '4': '结束报名',
    '5': '开始活动',
    '6': '结束活动'
  }
  return statusMap[status] || '未知状态'
}

onLoad(() => {
  fetchSeckillActivities()
})
</script>

<style scoped>
/* 重置默认样式 */
.container,
.activity-list,
.activity-item {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0;
  margin: 0;
  width: 100%;
}



/* 活动列表样式 */
.activity-list {
  background-color: #f5f5f5;
  padding: 16px;
  min-height: 100vh;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.activity-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: transparent;
  cursor: pointer;
}

.activity-image-container {
  width: 100px;
  height: 100px;
  margin-right: 12px;
  flex-shrink: 0;
}

.activity-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  flex: 1;
  margin-right: 12px;
}

.activity-description {
  font-size: 14px;
  color: #666666;
  line-height: 1.4;
}

.activity-time {
  font-size: 11px;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.time-label {
  margin-right: 4px;
}

.activity-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #f0f0f0;
  color: #666666;
  flex-shrink: 0;
  border: 1px solid #e0e0e0;
}

.activity-status.active {
  background-color: #fff0f0;
  color: #ff4444;
  border-color: #ffcccc;
}

/* 秒杀商品列表样式 */
.seckill-products {
  background-color: #ffffff;
  padding: 16px;
  margin-top: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: transparent;
  cursor: pointer;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-right: 16px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
}

.seckill-tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ff4444;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 4px 0 4px 0;
  font-size: 12px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #333333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.seckill-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  color: #ff4444;
  margin-right: 2px;
}

.price-value {
  font-size: 20px;
  font-weight: 600;
  color: #ff4444;
}

.original-price {
  font-size: 12px;
  color: #999999;
  text-decoration: line-through;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #ff4444;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #999999;
  min-width: 60px;
  text-align: right;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 14px;
  color: #999999;
}

/* 无更多数据样式 */
.no-more-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 14px;
  color: #999999;
}

/* 无数据样式 */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  font-size: 14px;
  color: #999999;
}
</style>
