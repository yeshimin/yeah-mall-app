<template>
  <view 
    class="custom-nav-bar" 
    :style="{
      position: 'fixed', 
      top: '0', 
      left: '0', 
      right: '0', 
      zIndex: '999',
      height: (statusBarInfo.plusHeight) + 'px',
      width: '100%',
      backgroundColor: navBarBackgroundColor,
      boxShadow: navBarShadow,
    }"
  >
    <!-- 系统状态栏占位空间 -->
    <view 
      class="system-status-bar" 
      :style="{ 
        height: statusBarInfo.sysHeight + 'px', 
        backgroundColor: navBarBackgroundColor,
      }"
    ></view>
    <!-- 标题栏 横着一条 -->
    <view :style="{
      display: 'flex',
      // 横向布局
      flexDirection: 'row',
      width: '100%',
    }"
      >
      
      <!-- 左侧内容 -->
      <view class="left-content" :style="{
        width: statusBarInfo.leftMaxWidth + 'px',
        height: (statusBarInfo.appHeight) + 'px',
        backgroundColor: navBarBackgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        // 居中
        margin: '0'
      }">
        <!-- 返回按钮 -->
        <view v-if="showBack" class="back-button" @click="handleBack">
          <text class="back-icon">←</text>
        </view>
      </view>

      <!-- 标题栏内容本体 -->
      <view class="app-status-bar" :style="{
        height: (statusBarInfo.appHeight) + 'px',
        width: statusBarInfo.middleMaxWidth + 'px',
        backgroundColor: navBarBackgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 居中
        margin: '0'
      }">
        <!-- 搜索框 -->
        <view v-if="showSearch" class="search-container" @click="handleSearch" :style="{
          width: '80%'
        }">
          <view class="search-box">
            <!-- 搜索图标 -->
            <text class="search-icon">🔍</text>
            <!-- 搜索提示 -->
            <text class="search-hint">{{ searchPlaceholder }}</text>
          </view>
        </view>
        <!-- 标题 -->
        <view v-else class="title-container">
          <text class="title">{{ title }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

defineOptions({
  name: 'custom-nav-bar'
})

const props = defineProps({
  showBack: {
    type: Boolean,
    default: false
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: '搜索商品'
  },
  title: {
    type: String,
    default: ''
  },
  transparent: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: '#f8f8f8'
  },
  backgroundOpacity: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['height-calculated', 'search', 'back'])

const statusBarInfo = ref({
  sysHeight: 0,
  appHeight: 0,
  sysBottom: 0,
  appBottom: 0,
  plusHeight: 0,
  middleMaxWidth: 0,
  leftMaxWidth: 0
})

function clampOpacity(value) {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.min(value, 1))
}

function hexToRgba(color, opacity) {
  const normalizedOpacity = clampOpacity(opacity)
  if (!color || !color.startsWith('#')) {
    return `rgba(255, 255, 255, ${normalizedOpacity})`
  }

  let hex = color.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map((item) => item + item).join('')
  }

  const intValue = parseInt(hex, 16)
  const r = (intValue >> 16) & 255
  const g = (intValue >> 8) & 255
  const b = intValue & 255

  return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`
}

const navBarBackgroundColor = computed(() => {
  if (!props.transparent) {
    return props.backgroundColor
  }
  return hexToRgba(props.backgroundColor, props.backgroundOpacity)
})

const navBarShadow = computed(() => {
  if (!props.transparent) {
    return '0 4rpx 20rpx rgba(0, 0, 0, 0.1)'
  }

  const opacity = clampOpacity(props.backgroundOpacity)
  if (opacity <= 0.02) {
    return 'none'
  }

  return `0 4rpx 20rpx rgba(0, 0, 0, ${0.04 + opacity * 0.08})`
})

function calcStatusBarInfo() {
  let systemInfo
  let menuButtonInfo

  try {
    systemInfo = wx.getSystemInfoSync()
    menuButtonInfo = wx.getMenuButtonBoundingClientRect()
  } catch (error) {
    systemInfo = uni.getSystemInfoSync()
    menuButtonInfo = typeof uni.getMenuButtonBoundingClientRect === 'function'
      ? uni.getMenuButtonBoundingClientRect()
      : null
  }

  if (!menuButtonInfo) {
    const sysHeight = systemInfo.statusBarHeight || 0
    const appHeight = 44
    const plusHeight = sysHeight + appHeight
    const leftMaxWidth = Math.max((systemInfo.screenWidth || 375) * 0.2, 72)
    const middleMaxWidth = (systemInfo.screenWidth || 375) - leftMaxWidth * 2

    statusBarInfo.value = {
      sysHeight,
      appHeight,
      sysBottom: sysHeight,
      appBottom: plusHeight,
      plusHeight,
      middleMaxWidth,
      leftMaxWidth
    }

    emit('height-calculated', { plusHeight })
    return
  }

  const sysHeight = systemInfo.statusBarHeight || 0
  const appHeight = (((menuButtonInfo.bottom + menuButtonInfo.top) / 2) - sysHeight) * 2
  const sysBottom = (systemInfo.screenTop || 0) + sysHeight
  const appBottom = sysBottom + appHeight
  const plusHeight = sysHeight + appHeight
  const middleMaxWidth = ((menuButtonInfo.left) - (systemInfo.screenWidth / 2)) * 2
  const leftMaxWidth = (systemInfo.screenWidth - middleMaxWidth) / 2

  statusBarInfo.value = {
    sysHeight,
    appHeight,
    sysBottom,
    appBottom,
    plusHeight,
    middleMaxWidth: middleMaxWidth - 16,
    leftMaxWidth
  }

  emit('height-calculated', { plusHeight })
}

function handleSearch() {
  emit('search', {})
}

function handleBack() {
  emit('back')
}

onMounted(() => {
  calcStatusBarInfo()
})
</script>

<style scoped>
/* 自定义标题栏样式 */
.custom-nav-bar {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 系统状态栏占位 */
.system-status-bar {
  width: 100%;
}

/* 应用状态栏 */
.app-status-bar {
  width: 100%;
  box-sizing: border-box;
}

/* 搜索框样式 */
.search-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #ecdfdf;
  border-radius: 20rpx;
  padding: 0 20rpx;
  height: 40rpx;
  width: 100%;
}

.search-icon {
  font-size: 20rpx;
}

.search-hint {
  flex: 1;
  color: #999;
  font-size: 22rpx;
  text-align: center;
  white-space: nowrap;
}

/* 标题样式 */
.title-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 返回按钮样式 */
.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-left: 16px;
}

.back-icon {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
