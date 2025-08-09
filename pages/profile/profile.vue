<template>
  <view class="profile-container">
    <view class="profile-header">
      <text class="header-title">我的</text>
    </view>
    <view class="profile-content">
      <text>个人中心页面内容</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Profile'
}
</script>

<style scoped>
.profile-container {
  height: 100vh;
  background-color: aqua;
  margin-bottom: 10rpx;
  padding-top: var(--status-bar-height);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
}

.profile-content {
  margin-top: 100rpx;
  padding: 20rpx;
}
</style>