<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        placeholder="搜索商品或商家" 
        v-model="searchQuery" 
        @confirm="handleSearch"
      />
      <button class="search-button" @click="handleSearch">搜索</button>
    </view>

    <!-- 推荐商家 -->
    <view class="section">
      <view class="section-title">推荐商家</view>
      <view class="shop-list">
        <view 
          class="shop-item" 
          v-for="shop in recommendedShops" 
          :key="shop.id"
          @click="goToShop(shop.id)"
        >
          <image class="shop-logo" :src="shop.logo" />
          <text class="shop-name">{{ shop.name }}</text>
        </view>
      </view>
    </view>

    <!-- 商品分类 -->
    <view class="section">
      <view class="section-title">商品分类</view>
      <view class="category-grid">
        <view 
          class="category-item" 
          v-for="category in allCategories" 
          :key="category.id"
          @click="goToCategory(category.id)"
        >
          <image class="category-icon" :src="category.icon" />
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>

    <!-- 热门商品 -->
    <view class="section">
      <view class="section-title">热门商品</view>
      <view class="product-grid">
        <view 
          class="product-item" 
          v-for="product in hotProducts" 
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
      // 模拟推荐商家数据
      recommendedShops: [
        { id: 1, name: '品牌旗舰店1', logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 2, name: '品牌旗舰店2', logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 3, name: '品牌旗舰店3', logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 4, name: '品牌旗舰店4', logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 5, name: '品牌旗舰店5', logo: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
      ],
      // 模拟商品分类数据
      allCategories: [
        { id: 1, name: '手机数码', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 2, name: '家用电器', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 3, name: '服装鞋帽', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 4, name: '美妆护肤', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 5, name: '家居用品', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 6, name: '运动户外', icon: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
      ],
      // 模拟热门商品数据
      hotProducts: [
        { id: 1, name: '热门商品1', price: '299.00', sales: '1000+', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 2, name: '热门商品2', price: '199.00', sales: '800+', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 3, name: '热门商品3', price: '399.00', sales: '1200+', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 4, name: '热门商品4', price: '499.00', sales: '600+', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 5, name: '热门商品5', price: '599.00', sales: '1500+', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 6, name: '热门商品6', price: '699.00', sales: '400+', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
      ],
      // 模拟促销活动数据
      promotions: [
        { id: 1, title: '限时秒杀', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 2, title: '品牌特惠', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { id: 3, title: '新品尝鲜', image: 'https://images.unsplash.com/photo-1752407828538-17e055766592?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
      ]
    }
  },
  methods: {
    handleSearch() {
      if (this.searchQuery.trim() !== '') {
        uni.navigateTo({
          url: `/pages/search/search?query=${this.searchQuery}`
        })
      }
    },
    goToShop(shopId) {
      uni.navigateTo({
        url: `/pages/shop/detail?shopId=${shopId}`
      })
    },
    goToCategory(categoryId) {
      uni.navigateTo({
        url: `/pages/category/list?categoryId=${categoryId}`
      })
    },
    goToProduct(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?productId=${productId}`
      })
    }
  }
}
</script>

<style scoped>
/* 搜索栏样式 */
.search-bar {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  margin: 20rpx;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 15rpx 20rpx;
  font-size: 28rpx;
  border: none;
  outline: none;
  background-color: #f5f5f5;
  border-radius: 30rpx;
}

.search-button {
  padding: 15rpx 30rpx;
  background-color: #ff5500;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  cursor: pointer;
  margin-left: 10rpx;
  font-weight: bold;
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
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  padding: 30rpx 20rpx;
  background-color: #fff;
}

.product-item {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-item:hover {
  transform: translateY(-10rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 250rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
}

.product-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.product-price {
  font-size: 32rpx;
  color: #ff5500;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.product-sales {
  font-size: 24rpx;
  color: #999;
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
</style>
