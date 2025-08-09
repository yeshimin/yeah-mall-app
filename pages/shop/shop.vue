<template>
  <view>
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" placeholder="搜索商品" v-model="searchQuery" @confirm="handleSearch" />
      <button class="search-button" @click="handleSearch">搜索</button>
    </view>

    <!-- 推荐商家 -->
    <view class="section-title">推荐商家</view>
    <scroll-view class="shops" scroll-x>
      <view class="shop" v-for="shop in recommendedShops" :key="shop.id" @click="goToShop(shop.id)">
        <image class="shop-logo" :src="shop.logo"></image>
        <text class="shop-name">{{ shop.name }}</text>
      </view>
    </scroll-view>

    <!-- 商品分类 -->
    <view class="section-title">商品分类</view>
    <view class="categories">
      <view class="category" v-for="category in allCategories" :key="category.id" @click="goToCategory(category.id)">
        <image class="category-icon" :src="category.icon"></image>
        <text class="category-name">{{ category.name }}</text>
      </view>
    </view>

    <!-- 热门商品 -->
    <view class="section-title">热门商品</view>
    <view class="products">
      <view class="product" v-for="product in hotProducts" :key="product.id" @click="goToProduct(product.id)">
        <image class="product-image" :src="product.image"></image>
        <text class="product-name">{{ product.name }}</text>
        <text class="product-price">￥{{ product.price }}</text>
        <text class="product-sales">销量: {{ product.sales }}</text>
      </view>
    </view>

    <!-- 促销活动 -->
    <view class="section-title">促销活动</view>
    <scroll-view class="promotions" scroll-x>
      <view class="promotion" v-for="promotion in promotions" :key="promotion.id">
        <image class="promotion-image" :src="promotion.image"></image>
        <text class="promotion-title">{{ promotion.title }}</text>
      </view>
    </scroll-view>
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
}

.search-input {
  flex: 1;
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  border: none;
  outline: none;
}

.search-button {
  padding: 10rpx 20rpx;
  background-color: #ff5500;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  cursor: pointer;
}

/* 推荐商家样式 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  padding: 20rpx;
  background-color: #fff;
  margin-top: 20rpx;
}

.shops {
  display: flex;
  overflow-x: auto;
  padding: 20rpx;
  background-color: #fff;
  white-space: nowrap;
}

.shop {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30rpx;
}

.shop-logo {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-bottom: 10rpx;
}

.shop-name {
  font-size: 24rpx;
  color: #333;
}

/* 商品分类样式 */
.categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20rpx;
  padding: 20rpx;
  background-color: #fff;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
}

/* 热门商品样式 */
.products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
  background-color: #fff;
}

.product {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.product-image {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 28rpx;
  color: #ff5500;
  margin-bottom: 10rpx;
}

.product-sales {
  font-size: 24rpx;
  color: #999;
}

/* 促销活动样式 */
.promotions {
  display: flex;
  overflow-x: auto;
  padding: 20rpx;
  background-color: #fff;
  white-space: nowrap;
}

.promotion {
  width: 300rpx;
  height: 150rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  margin-right: 20rpx;
}
</style>
