<template>
  <view class="page">
    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="activities.length === 0" class="state">暂无可查看的拼团活动</view>
    <view v-else class="activity-list">
      <view v-for="activity in activities" :key="activity.id" class="activity-card" @click="openActivity(activity)">
        <image class="cover" :src="activity.coverImage" mode="aspectFill" />
        <view class="content">
          <text class="title">{{ activity.name }}</text>
          <text class="desc">{{ activity.description || '多人拼团，优惠更划算' }}</text>
          <text class="meta">{{ activityStatusText(activity) }} · {{ activity.minPeople }}人团</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { BASE_API, getStoragePreviewUrl } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

const activities = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 20
const hasMore = ref(true)

function loadActivities(reset = false) {
  if (loading.value || (!reset && !hasMore.value)) {
    return
  }
  if (reset) {
    currentPage.value = 1
    hasMore.value = true
    activities.value = []
  }
  loading.value = true
  authRequest({
    url: `${BASE_API}/app/groupBuy/queryActivity?current=${currentPage.value}&size=${pageSize}`,
    method: 'GET'
  }, (res) => {
    if (res.statusCode === 200 && res.data.code === 0) {
      const page = res.data.data || {}
      const records = (page.records || []).map((activity) => ({
        ...activity,
        coverImage: getStoragePreviewUrl(activity.coverImage)
      }))
      activities.value = reset ? records : activities.value.concat(records)
      const pages = Number(page.pages || 0)
      hasMore.value = pages > 0
        ? currentPage.value < pages
        : records.length >= pageSize
      if (hasMore.value) {
        currentPage.value += 1
      }
    } else {
      uni.showToast({ title: res.data?.message || '获取拼团活动失败', icon: 'none' })
    }
    loading.value = false
  }, () => {
    loading.value = false
    uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
  })
}

function openActivity(activity) {
  const query = [
    `activityId=${activity.id}`,
    `activityName=${encodeURIComponent(activity.name || '')}`,
    `activityBeginTime=${encodeURIComponent(activity.activityBeginTime || '')}`,
    `activityEndTime=${encodeURIComponent(activity.activityEndTime || '')}`
  ].join('&')
  uni.navigateTo({ url: `/pages/group-buy/product-list?${query}` })
}

function activityStatusText(activity) {
  return String(activity.status) === '6' ? '活动已结束，仅可查看' : '活动进行中'
}

onLoad(() => loadActivities(true))
onReachBottom(() => loadActivities())
</script>

<style scoped>
.page { min-height: 100vh; padding: 24rpx; background: linear-gradient(180deg, #fff6ec 0, #f7f8fa 40%); box-sizing: border-box; }
.activity-list { display: flex; flex-direction: column; gap: 22rpx; }
.activity-card { display: flex; padding: 18rpx; background: #fff; border-radius: 20rpx; box-shadow: 0 10rpx 28rpx rgba(118, 65, 19, .08); }
.cover { width: 180rpx; height: 180rpx; flex: 0 0 180rpx; border-radius: 14rpx; background: #f4e4d4; }
.content { display: flex; min-width: 0; flex: 1; flex-direction: column; padding: 8rpx 8rpx 4rpx 20rpx; }
.title { overflow: hidden; color: #2b1b0e; font-size: 32rpx; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.desc { display: -webkit-box; overflow: hidden; margin-top: 14rpx; color: #7d6654; font-size: 25rpx; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.meta { margin-top: auto; color: #d95a22; font-size: 24rpx; }
.state { padding-top: 180rpx; color: #958679; font-size: 28rpx; text-align: center; }
</style>
