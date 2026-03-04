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

<script>
import { BASE_API } from '@/utils/config.js'
import { authRequest } from '@/utils/auth.js'

export default {
  data() {
    return {
      // 秒杀活动数据
      seckillActivities: [],
      // 加载状态
      loading: false
    }
  },
  methods: {
    // 处理图片加载
    handleImageLoad() {
      // 可以在这里添加图片加载完成后的处理
    },

    // 处理图片加载失败
    handleImageError(e) {
      console.log('图片加载失败:', e)
      // 可以在这里设置默认图片
    },

    // 跳转到商品详情页面
    goToProductDetail(productId) {
      console.log('跳转到商品详情:', productId)
      console.log('准备执行uni.navigateTo')
      const url = `/pages/product/detail?productId=${productId}&scene=seckill`
      console.log('跳转URL:', url)
      
      try {
        uni.navigateTo({
          url: url,
          success: function(res) {
            console.log('跳转成功:', res)
          },
          fail: function(err) {
            console.log('跳转失败:', err)
            console.log('错误代码:', err.errCode)
            console.log('错误信息:', err.errMsg)
          }
        })
      } catch (e) {
        console.log('跳转时发生异常:', e)
      }
    },

    // 获取秒杀活动列表
    fetchSeckillActivities() {
      if (this.loading) return

      this.loading = true

      // 构建API请求URL
      const url = `${BASE_API}/app/seckillActivity/query`

      // 使用带认证的请求
      authRequest({
        url: url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        // 成功回调
        if (res.statusCode === 200 && res.data.code === 0) {
          const responseData = res.data.data
          
          // 处理活动数据
          const activities = responseData.records.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            coverImage: item.coverImage ? `${BASE_API}/public/storage/preview?fileKey=${item.coverImage}` : '',
            applyBeginTime: item.applyBeginTime,
            applyEndTime: item.applyEndTime,
            activityBeginTime: item.activityBeginTime,
            activityEndTime: item.activityEndTime,
            status: item.status
          }))

          this.seckillActivities = activities
        } else {
          console.error('获取秒杀活动失败:', res.data.message)
          // 使用模拟数据
          this.useMockActivityData()
        }
        this.loading = false
      }, (err) => {
        // 错误回调
        console.error('请求秒杀活动失败:', err)
        // 使用模拟数据
        this.useMockActivityData()
        this.loading = false
      })
    },

    // 使用模拟活动数据
    useMockActivityData() {
      if (this.seckillActivities.length === 0) {
        this.seckillActivities = [
          {
            id: '2026211216331399169',
            name: '618秒杀活动',
            description: '全场爆款限时秒杀',
            coverImage: 'https://via.placeholder.com/200x200',
            applyBeginTime: '2026-06-01 10:00:00',
            applyEndTime: '2026-06-05 23:59:59',
            activityBeginTime: '2026-06-18 00:00:00',
            activityEndTime: '2026-06-18 23:59:59',
            status: '2'
          },
          {
            id: '2026211216331399170',
            name: '双11秒杀活动',
            description: '年度最大力度秒杀',
            coverImage: 'https://via.placeholder.com/200x200',
            applyBeginTime: '2026-11-01 10:00:00',
            applyEndTime: '2026-11-10 23:59:59',
            activityBeginTime: '2026-11-11 00:00:00',
            activityEndTime: '2026-11-11 23:59:59',
            status: '1'
          }
        ]
      }
    },


    

    
    // 跳转到秒杀商品列表页面
    goToActivityDetail(activity) {
      console.log('活动被点击:', activity)
      console.log('活动状态:', activity.status)
      
      // 检查活动状态
      if (activity.status === '6') {
        // 活动已结束，显示提示
        uni.showToast({
          title: '活动已结束',
          icon: 'none',
          duration: 2000
        })
        return
      } else if (activity.status !== '5') {
        // 活动未开始，显示提示
        uni.showToast({
          title: '活动尚未开始',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      console.log('开始跳转...')
      try {
        uni.navigateTo({
          url: `/pages/seckill/product-list?activityId=${activity.id}&activityName=${encodeURIComponent(activity.name)}&activityDescription=${encodeURIComponent(activity.description)}&activityStatus=${activity.status}&activityBeginTime=${encodeURIComponent(activity.activityBeginTime)}&activityEndTime=${encodeURIComponent(activity.activityEndTime)}&coverImage=${encodeURIComponent(activity.coverImage)}`,
          success: function(res) {
            console.log('跳转成功:', res)
          },
          fail: function(err) {
            console.log('跳转失败:', err)
            console.log('错误代码:', err.errCode)
            console.log('错误信息:', err.errMsg)
          }
        })
      } catch (e) {
        console.log('跳转时发生异常:', e)
      }
    },
    
    // 获取活动状态文本
    getActivityStatusText(status) {
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
  },

  // 页面加载时获取数据
  mounted() {
    console.log('页面加载，开始获取数据')
    this.fetchSeckillActivities()
    // 直接使用模拟活动数据，确保活动列表显示
    this.useMockActivityData()
    console.log('活动数据:', this.seckillActivities)
    console.log('活动数量:', this.seckillActivities.length)
  }
}
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
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background-color: #f0f0f0;
  color: #666666;
  flex-shrink: 0;
}

.activity-status.active {
  background-color: #ff4444;
  color: #ffffff;
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