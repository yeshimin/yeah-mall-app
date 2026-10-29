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
        width: (showSearch ? statusBarInfo.searchLeftWidth : statusBarInfo.leftMaxWidth) + 'px',
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
          <view class="back-icon"></view>
        </view>
      </view>

      <!-- 标题栏内容本体 -->
      <view class="app-status-bar" :style="{
        height: (statusBarInfo.appHeight) + 'px',
        width: (showSearch ? statusBarInfo.searchMaxWidth : statusBarInfo.middleMaxWidth) + 'px',
        backgroundColor: navBarBackgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 居中
        margin: '0'
      }">
        <view
          v-if="showSearch"
          class="search-content"
          :style="{ height: statusBarInfo.controlHeight + 'px' }"
        >
          <view
            v-if="showBrand"
            class="mall-wordmark"
            aria-label="Yeah Mall"
            role="button"
            hover-class="mall-wordmark--pressed"
            @click="handleBrandClick"
          >
            <text>YEAH</text>
            <text>MALL</text>
          </view>
          <!-- 搜索框 -->
          <view class="search-container" @click="handleSearch">
            <view class="search-box">
              <!-- 搜索图标 -->
              <view class="search-icon"></view>
              <!-- 搜索提示 -->
              <text class="search-hint">{{ searchPlaceholder }}</text>
            </view>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'

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
  showBrand: {
    type: Boolean,
    default: false
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
    default: '#f4f6f3'
  },
  backgroundOpacity: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['height-calculated', 'search', 'back', 'brand'])

const statusBarInfo = ref({
  sysHeight: 0,
  appHeight: 0,
  sysBottom: 0,
  appBottom: 0,
  plusHeight: 0,
  middleMaxWidth: 0,
  leftMaxWidth: 0,
  searchLeftWidth: 0,
  searchMaxWidth: 0,
  controlHeight: 32
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
    return 'none'
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
    const legacySystemInfo = wx.getSystemInfoSync()
    const windowInfo = typeof wx.getWindowInfo === 'function' ? wx.getWindowInfo() : null
    systemInfo = windowInfo ? { ...legacySystemInfo, ...windowInfo } : legacySystemInfo
    menuButtonInfo = wx.getMenuButtonBoundingClientRect()
  } catch (error) {
    systemInfo = uni.getSystemInfoSync()
    menuButtonInfo = typeof uni.getMenuButtonBoundingClientRect === 'function'
      ? uni.getMenuButtonBoundingClientRect()
      : null
  }

  const viewportWidth = Number(systemInfo.windowWidth || systemInfo.screenWidth || 375)
  const hasValidMenuButton = menuButtonInfo
    && Number.isFinite(Number(menuButtonInfo.left))
    && Number.isFinite(Number(menuButtonInfo.top))
    && Number.isFinite(Number(menuButtonInfo.bottom))
    && Number.isFinite(Number(menuButtonInfo.width))
    && Number(menuButtonInfo.left) > 0
    && Number(menuButtonInfo.width) > 0
    && Number(menuButtonInfo.bottom) > Number(menuButtonInfo.top)

  if (!hasValidMenuButton) {
    const sysHeight = systemInfo.statusBarHeight || 0
    const appHeight = 44
    const plusHeight = sysHeight + appHeight
    const leftMaxWidth = Math.max(viewportWidth * 0.2, 72)
    const middleMaxWidth = viewportWidth - leftMaxWidth * 2
    const searchLeftWidth = 14
    const searchMaxWidth = Math.max(viewportWidth - searchLeftWidth * 2, 120)

    statusBarInfo.value = {
      sysHeight,
      appHeight,
      sysBottom: sysHeight,
      appBottom: plusHeight,
      plusHeight,
      middleMaxWidth,
      leftMaxWidth,
      searchLeftWidth,
      searchMaxWidth,
      controlHeight: 34
    }

    emit('height-calculated', { plusHeight })
    return
  }

  const sysHeight = Number(systemInfo.statusBarHeight || 0)
  const menuTop = Number(menuButtonInfo.top)
  const menuBottom = Number(menuButtonInfo.bottom)
  const menuRectHeight = menuBottom - menuTop
  const reportedMenuHeight = Number(menuButtonInfo.height)

  // macOS 端的矩形范围可能包含额外点击热区，优先使用较小的可见胶囊高度。
  const controlHeight = Number.isFinite(reportedMenuHeight) && reportedMenuHeight > 0
    ? Math.min(reportedMenuHeight, menuRectHeight)
    : menuRectHeight
  const menuCenter = (menuTop + menuBottom) / 2
  const topGap = Math.max(menuCenter - sysHeight - controlHeight / 2, 0)
  const appHeight = topGap * 2 + controlHeight
  const sysBottom = sysHeight
  const appBottom = sysBottom + appHeight
  const plusHeight = sysHeight + appHeight
  const middleMaxWidth = (menuButtonInfo.left - viewportWidth / 2) * 2
  const leftMaxWidth = (viewportWidth - middleMaxWidth) / 2
  const searchLeftWidth = 14
  const searchGap = 8
  const searchMaxWidth = Math.max(menuButtonInfo.left - searchLeftWidth - searchGap, 120)

  statusBarInfo.value = {
    sysHeight,
    appHeight,
    sysBottom,
    appBottom,
    plusHeight,
    middleMaxWidth: middleMaxWidth - 16,
    leftMaxWidth,
    searchLeftWidth,
    searchMaxWidth,
    controlHeight
  }

  emit('height-calculated', { plusHeight })
}

function handleSearch() {
  emit('search', {})
}

function handleBrandClick() {
  emit('brand')
}

function handleBack() {
  emit('back')
}

onMounted(() => {
  calcStatusBarInfo()
  if (typeof uni.onWindowResize === 'function') {
    uni.onWindowResize(calcStatusBarInfo)
  }
})

onUnmounted(() => {
  if (typeof uni.offWindowResize === 'function') {
    uni.offWindowResize(calcStatusBarInfo)
  }
})
</script>

<style scoped>
/* 自定义标题栏样式 */
.custom-nav-bar {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
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

.search-content {
  display: flex;
  align-items: center;
  gap: 28rpx;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.mall-wordmark {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--ym-ink, #17251f);
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
  line-height: 1.02;
  white-space: nowrap;
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.mall-wordmark--pressed {
  opacity: 0.68;
  transform: scale(0.96);
}

.mall-wordmark text:last-child {
  color: var(--ym-brand, #24634f);
}

/* 搜索框样式 */
.search-container {
  min-width: 0;
  flex: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: auto;
}

.search-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  box-sizing: border-box;
  padding: 0 22rpx;
  width: 100%;
  height: 100%;
  border: 1rpx solid var(--ym-line, #dce4de);
  border-radius: 18rpx;
  background-color: var(--ym-surface-subtle, #f8faf8);
  box-shadow: 0 2rpx 8rpx rgba(18, 38, 29, 0.04);
}

.search-icon {
  position: relative;
  width: 20rpx;
  height: 20rpx;
  flex: 0 0 20rpx;
  box-sizing: border-box;
  border: 3rpx solid var(--ym-muted, #65726a);
  border-radius: 50%;
}

.search-icon::after {
  position: absolute;
  right: -7rpx;
  bottom: -5rpx;
  width: 8rpx;
  height: 3rpx;
  border-radius: 2rpx;
  background: var(--ym-muted, #65726a);
  content: '';
  transform: rotate(45deg);
}

.search-hint {
  min-width: 0;
  flex: 0 1 auto;
  overflow: hidden;
  color: var(--ym-muted, #65726a);
  font-size: 26rpx;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
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
  color: var(--ym-ink, #17251f);
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
  box-shadow: 0 4rpx 16rpx rgba(18, 38, 29, 0.12);
  transition: all 0.3s ease;
  margin-left: 16px;
}

.back-icon {
  width: 16rpx;
  height: 16rpx;
  border-bottom: 3rpx solid var(--ym-ink, #17251f);
  border-left: 3rpx solid var(--ym-ink, #17251f);
  transform: rotate(45deg);
}
</style>
