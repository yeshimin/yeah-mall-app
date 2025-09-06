<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar" style="position: fixed; top: 0; left: 0; right: 0; z-index: 999;">
      <view 
        class="search-input" 
        @click="handleSearch"
      >
        <text class="search-placeholder">搜索商品或商家</text>
      </view>
      <button class="search-button" @click="handleSearch">搜索</button>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-links" style="margin-top: 120rpx;">
      <view class="quick-link-item" @click="goToSeckill">
        <image class="quick-link-icon" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <text class="quick-link-text">秒杀</text>
      </view>
      <view class="quick-link-item" @click="goToGroupBuy">
        <image class="quick-link-icon" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <text class="quick-link-text">拼团</text>
      </view>
      <view class="quick-link-item" @click="goToNewArrivals">
        <image class="quick-link-icon" src="https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <text class="quick-link-text">新品</text>
      </view>
    </view>

    <!-- 热门商品 -->
    <view class="section">
      <view class="section-title">热门商品</view>
      <view class="waterfall-container">
        <view class="waterfall-column">
          <view 
            class="product-item" 
            v-for="product in leftColumnProducts" 
            :key="product.id"
            @click="goToProduct(product.id)"
          >
            <image class="product-image" :src="product.image" />
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">￥{{ product.price }}</text>
            <text class="product-sales">销量: {{ product.sales }}</text>
          </view>
        </view>
        <view class="waterfall-column">
          <view 
            class="product-item" 
            v-for="product in rightColumnProducts" 
            :key="product.id"
            @click="goToProduct(product.id)"
          >
            <image class="product-image" :src="product.image" />
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">￥{{ product.price }}</text>
            <text class="product-sales">销量: {{ product.sales }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 促销活动 -->
    <view class="section">
      <view class="section-title">促销活动</view>
      <scroll-view class="promotion-list" scroll-x>
        <view 
          class="promotion-item" 
          v-for="promotion in promotions" 
          :key="promotion.id"
        >
          <image class="promotion-image" :src="promotion.image" />
          <text class="promotion-title">{{ promotion.title }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      // 模拟热门商品数据
      hotProducts: [
        { id: 1, name: '无线蓝牙耳机', price: '299.00', sales: '1000+', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 2, name: '智能手表', price: '199.00', sales: '800+', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 3, name: '便携式充电宝', price: '399.00', sales: '1200+', image: 'https://images.unsplash.com/photo-1609592806839-5f4a0c1d0f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 4, name: '高清网络摄像头', price: '499.00', sales: '600+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 5, name: '机械键盘', price: '599.00', sales: '1500+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 6, name: '无线鼠标', price: '699.00', sales: '400+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 7, name: '平板电脑', price: '1299.00', sales: '2000+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 8, name: '游戏手柄', price: '399.00', sales: '900+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 9, name: '蓝牙音箱', price: '599.00', sales: '1100+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' },
        { id: 10, name: '智能台灯', price: '199.00', sales: '700+', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fHw%3D&auto=format&fit=crop&w=500&q=80' }
      ],
      // 瀑布流左右两列的商品数据
      leftColumnProducts: [],
      rightColumnProducts: []
    }
  },
  methods: {
    handleSearch() {
      uni.navigateTo({
        url: `/pages/product/list`
      })
    },
    goToProduct(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?productId=${productId}`
      })
    },
    // 快捷入口点击方法
    goToSeckill() {
      uni.navigateTo({
        url: `/pages/seckill/list`
      })
    },
    goToGroupBuy() {
      uni.navigateTo({
        url: `/pages/groupbuy/list`
      })
    },
    goToCoupons() {
      uni.navigateTo({
        url: `/pages/coupons/list`
      })
    },
    goToNewArrivals() {
      uni.navigateTo({
        url: `/pages/newarrivals/list`
      })
    },
    // 瀑布流布局方法
    initWaterfall() {
      // 简单的瀑布流实现，将商品交替分配到左右两列
      this.leftColumnProducts = [];
      this.rightColumnProducts = [];
      
      this.hotProducts.forEach((product, index) => {
        if (index % 2 === 0) {
          this.leftColumnProducts.push(product);
        } else {
          this.rightColumnProducts.push(product);
        }
      });
    }
  },
  // 在页面加载时初始化瀑布流布局
  mounted() {
    this.initWaterfall();
  }
}
</script>

<style scoped>
/* 搜索栏样式 */
.search-bar {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 0; /* 改为直角 */
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  margin: 0;
  align-items: center;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 15rpx 20rpx;
  font-size: 28rpx;
  border: none;
  outline: none;
  background-color: #f5f5f5;
  border-radius: 0; /* 改为直角 */
  min-width: 100rpx; /* 设置最小宽度防止过度收缩 */
  display: flex;
  align-items: center;
  color: #999;
}

.search-placeholder {
  color: #999;
}

.search-button {
  padding: 15rpx 30rpx;
  background-color: #ff5500;
  color: #fff;
  border: none;
  border-radius: 0; /* 改为直角 */
  font-size: 28rpx;
  cursor: pointer;
  margin-left: 10rpx;
  font-weight: bold;
  flex-shrink: 0; /* 防止按钮收缩 */
}

/* 推荐商家样式 */
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  padding: 30rpx 20rpx 20rpx;
  background-color: #fff;
  margin-top: 20rpx;
  border-bottom: 1rpx solid #eee;
  color: #333;
}

.shop-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120rpx, 1fr));
  gap: 30rpx;
  padding: 20rpx 20rpx 30rpx;
  background-color: #fff;
}

/* Removed shop-list::after as it's no longer needed for grid layout */

/* Removed shop-list::-webkit-scrollbar as it's no longer needed for grid layout */

.shop-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
  cursor: pointer;
}

/* Removed shop-item:last-child as margin is now handled by grid gap */

.shop-item:hover {
  transform: translateY(-10rpx);
}

.shop-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid #fff;
  box-sizing: border-box;
}

.shop-name {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120rpx;
  text-align: center;
  line-height: 1.4;
  margin-top: 5rpx;
}

/* 商品分类样式 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120rpx, 1fr));
  gap: 30rpx;
  padding: 30rpx 20rpx;
  background-color: #fff;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #f5f5f5;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.category-name {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100rpx;
  text-align: center;
}

/* 热门商品样式 */
.waterfall-container {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  min-height: 800rpx; /* 设置最小高度确保两列显示 */
  height: auto; /* 使用自动高度 */
  overflow-y: visible; /* 禁用垂直滚动 */
}

.waterfall-column {
  flex: 1;
  margin: 0 10rpx;
  width: 50%; /* 确保每列占据50%宽度 */
}

.waterfall-column:first-child {
  margin-left: 0;
}

.waterfall-column:last-child {
  margin-right: 0;
}

.product-item {
  background: #fff;
  border-radius: 10rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
  margin-bottom: 20rpx;
}

.product-image {
  width: 100%;
  height: 300rpx;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.product-price {
  color: #e4393c;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.product-sales {
  color: #999;
  font-size: 20rpx;
}

/* 促销活动样式 */
.promotion-list {
  display: flex;
  overflow-x: auto;
  padding: 20rpx;
  background-color: #fff;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
}

.promotion-list::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.promotion-item {
  width: 350rpx;
  height: 180rpx;
  background-color: #f5f5f5;
  border-radius: 15rpx;
  margin-right: 30rpx;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.promotion-image {
  width: 100%;
  height: 100%;
  border-radius: 15rpx;
}

.promotion-title {
  position: absolute;
  bottom: 15rpx;
  left: 15rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
}

/* 快捷入口样式 */
.quick-links {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 0;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin: 20rpx;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 33.33%; /* 三个项目并排 */
}

.quick-link-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.quick-link-text {
  font-size: 26rpx;
  color: #333;
}
</style>
