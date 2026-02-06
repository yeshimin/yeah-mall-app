<template>
  <view class="container" :style="{ paddingTop: navBarHeight + 'px' }">
    <!-- 自定义标题栏组件 -->
    <custom-nav-bar 
      :show-search="true"
      :search-placeholder="'搜索商品'"
      @search="handleSearch"
      @height-calculated="handleNavBarHeightCalculated"
    />

    <!-- 快捷入口 -->
    <view 
      class="quick-links" 
    >
      <view class="quick-link-item" @click="goToSeckill">
        <image class="quick-link-icon" src="https://via.placeholder.com/100" />
        <text class="quick-link-text">秒杀</text>
      </view>
      <view class="quick-link-item" @click="goToGroupBuy">
        <image class="quick-link-icon" src="https://via.placeholder.com/100" />
        <text class="quick-link-text">拼团</text>
      </view>
      <view class="quick-link-item" @click="goToNewArrivals">
        <image class="quick-link-icon" src="https://via.placeholder.com/100" />
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
            <image class="product-image" :src="product.image" v-if="product.image" />
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
            <image class="product-image" :src="product.image" v-if="product.image" />
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
import { BASE_API } from '@/utils/config.js'
import customNavBar from '../../components/custom-nav-bar.vue'
export default {
  components: {
    'custom-nav-bar': customNavBar
  },
  data() {
    return {
      searchQuery: '',
      // 热门商品数据
      hotProducts: [],
      // 促销活动数据
      promotions: [],
      // 瀑布流左右两列的商品数据
      leftColumnProducts: [],
      rightColumnProducts: [],
      // 滚动分页token
      scrollToken: null,
      // 是否还有更多数据
      hasMore: true,
      // 自定义标题栏高度
      navBarHeight: 0
    }
  },
  methods: {
    handleSearch() {
      uni.navigateTo({
        url: `/pages/product/list`
      })
    },
    // 处理自定义标题栏高度计算完成事件
    handleNavBarHeightCalculated(e) {
      this.navBarHeight = e.plusHeight;
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
    },
    // 获取热门商品列表
    fetchHotProducts() {
      // 如果没有更多数据，直接返回
      if (!this.hasMore) return;
      
      // 构建API请求URL
      let url = `${BASE_API}/app/product/queryHot`;
      
      // 添加参数
      let params = [];
      params.push('pageSize=10'); // 设置每页大小为10
      
      // 添加滚动分页token（如果存在）
      if (this.scrollToken) {
        params.push('scrollToken=' + encodeURIComponent(this.scrollToken));
      }
      
      // 拼接完整URL
      url += '?' + params.join('&');
      
      uni.request({
        url: url,
        method: 'GET',
        header: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiaWF0IjoxNzU0ODMxOTI0LCJzdWIiOiJhcHAiLCJ0ZXJtIjoiYXBwIiwiaWF0TXMiOjE3NTQ4MzE5MjQ5NjksImV4cE1zIjoxNzU0ODM1NTI0OTY5fQ.T5UGHYy6ThASbwIae6aM1tJue15rJaAFnyXI945UhSk',
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            // 处理返回的商品数据
            const responseData = res.data.data;
            
            // 更新滚动分页相关变量
            this.scrollToken = responseData.scrollToken || null;
            this.hasMore = responseData.hasMore || false;
            
            // 处理商品数据
            const productsWithDetails = responseData.data.map(item => ({
              ...item,
              id: item.id,
              name: item.name,
              price: item.minPrice !== undefined ? item.minPrice.toFixed(2) : '0.00',
              sales: item.sales !== undefined ? item.sales : 0,
              // 根据不同环境构造图片URL
              image: item.mainImage ? (() => {
                const baseApi = BASE_API.replace('http://', 'https://');
                return `${baseApi}/public/storage/preview?fileKey=${item.mainImage}`;
              })() : ''
            }));
            
            // 追加到现有商品列表
            this.hotProducts = [...this.hotProducts, ...productsWithDetails];
            
            // 重新初始化瀑布流布局
            this.initWaterfall();
          } else {
            console.error('获取热门商品列表失败:', res.data.message);
          }
        },
        fail: (err) => {
          console.error('请求热门商品列表失败:', err);
        }
      });
    }
  },
  // 在页面加载时获取热门商品列表
  mounted() {
    this.fetchHotProducts();
  }
}
</script>

<style scoped>
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