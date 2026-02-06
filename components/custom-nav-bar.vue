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
      width: '100%'
    }"
  >
    <!-- 系统状态栏占位空间 -->
    <view 
      class="system-status-bar" 
      :style="{ 
        height: statusBarInfo.sysHeight + 'px', 
        backgroundColor: '#aaaaaa' 
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
        backgroundColor: '#00ff00',
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
        backgroundColor: '#ff0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 居中
        margin: '0'
      }">
        <!-- 搜索框 -->
        <view v-if="showSearch" class="search-container" @click="handleSearch" :style="{
          width: '50%'
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

<script>
export default {
  name: 'custom-nav-bar',
  props: {
    // 是否显示返回按钮
    showBack: {
      type: Boolean,
      default: false
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: true
    },
    // 搜索框占位文本
    searchPlaceholder: {
      type: String,
      default: '搜索商品'
    },
    // 标题文本（当不显示搜索框时使用）
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 状态栏信息
      statusBarInfo: {
        sysHeight: 0,             // 系统状态栏高度（px）
        appHeight: 0,             // 应用状态栏高度（px）
        sysBottom: 0,             // 系统状态栏底部位置（px）
        appBottom: 0,             // 应用状态栏底部位置（px）
        plusHeight: 0,            // 应用状态栏高度（px）
        middleMaxWidth: 0,        // 中间内容最大宽度（px）
        leftMaxWidth: 0,          // 左侧内容最大宽度（px）
      }
    }
  },
  methods: {
    // 计算状态栏和胶囊按钮信息
    calcStatusBarInfo() {
      // 尝试使用微信小程序原生API
      let systemInfo, menuButtonInfo;
      
      try {
        // 优先使用微信小程序原生API
        systemInfo = wx.getSystemInfoSync();
        menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      } catch (e) {
        // 如果失败，使用uni-app API
        systemInfo = uni.getSystemInfoSync();
        menuButtonInfo = uni.getMenuButtonBoundingClientRect();
      }

      // print systemInfo, menuButtonInfo
      console.log('systemInfo:', systemInfo);
      console.log('menuButtonInfo:', menuButtonInfo);
      
      // 系统状态栏高度：直接使用系统返回的值
      const sysHeight = systemInfo.statusBarHeight;
      
      // 应用状态栏高度：基于胶囊按钮位置计算
      // 核心公式：获取胶囊按钮垂直中心点，减去系统状态栏高度，再乘以 2
      const appHeight = (((menuButtonInfo.bottom + menuButtonInfo.top) / 2) - sysHeight) * 2;
      
      // 计算位置信息
      const sysBottom = systemInfo.screenTop + sysHeight;
      const appBottom = sysBottom + appHeight;

      // 自定义标题栏高度=系统状态栏高度+应用标题栏高度
      const plusHeight = sysHeight + appHeight;
      
      const middleMaxWidth = ((menuButtonInfo.left) - (systemInfo.screenWidth / 2)) * 2; // px

      const leftMaxWidth = (systemInfo.screenWidth - middleMaxWidth) / 2; // px

      this.statusBarInfo = {
        sysHeight,             // 系统状态栏高度（px）
        appHeight,             // 应用状态栏高度（px）
        sysBottom,             // 系统状态栏底部位置（px）
        appBottom,             // 应用状态栏底部位置（px）
        plusHeight,            // 自定义标题栏高度=系统状态栏高度+应用标题栏高度
        middleMaxWidth: middleMaxWidth - 16, // 中间内容最大宽度（px）
        leftMaxWidth, // 左侧内容最大宽度（px）
      };
      
      console.log('状态栏信息:', this.statusBarInfo);
      
      // 触发事件，将 plusHeight 值传递给父组件
      this.$emit('height-calculated', { plusHeight });
    },
    // 处理搜索框点击
    handleSearch() {
      this.$emit('search', {});
    }
  },
  // 组件挂载时计算状态栏信息
  mounted() {
    this.calcStatusBarInfo();
  }
}
</script>

<style scoped>
/* 自定义标题栏样式 */
.custom-nav-bar {
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
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
  background-color: #f5f5f5;
  border-radius: 20rpx;
  padding: 0 20rpx;
  height: 40rpx;
  width: 100%;
}

.search-icon {
  font-size: 20rpx;
  margin-right: 8rpx;
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
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  margin-left: 16px;
}

.back-icon {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
  padding-top: 8px;
  padding-bottom: 8px;
  /* padding-right: 16px; */
}
</style>