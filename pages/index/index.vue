<template>
  <view class="container" :style="{ paddingTop: navBarHeight + 'px' }">
    <!-- 自定义标题栏组件 -->
    <custom-nav-bar 
      :show-search="true"
      :search-placeholder="'搜索商品'"
      @search="handleSearch"
      @height-calculated="handleNavBarHeightCalculated"
    />

    <!-- Banner滚动区域 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :autoplay="true" :interval="3000" :duration="500" :circular="true" :indicator-dots="true" :indicator-color="'rgba(255,255,255,0.5)'" :indicator-active-color="'#fff'">
        <swiper-item 
          v-for="(banner, index) in banners" 
          :key="index"
          @click="handleBannerClick(banner.id)"
        >
          <image class="banner-image" :src="banner.image" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷入口 -->
    <view 
      v-if="!quickLinksLoading && quickLinks.length > 0"
      class="quick-links" 
    >
      <!-- 快捷入口列表 -->
      <view>
        <!-- 遍历每一行 -->
        <view 
          v-for="(row, rowIndex) in quickLinkRows" 
          :key="rowIndex"
          class="quick-link-row"
          :style="{ display: 'flex', justifyContent: 'flex-start' }"
        >
          <!-- 遍历行内每个快捷入口 -->
          <view 
            class="quick-link-item" 
            v-for="link in row.items" 
            :key="link.id"
            @click="handleQuickLinkClick(link.action)"
            :style="{ width: `${100 / row.maxCount}%`, boxSizing: 'border-box', padding: '0 10rpx' }"
          >
            <image class="quick-link-icon" :src="link.icon" />
            <text class="quick-link-text">{{ link.name }}</text>
          </view>
          <!-- 填充空白项，确保对齐 -->
          <view 
            v-for="i in (row.maxCount - row.items.length)" 
            :key="`empty-${rowIndex}-${i}`"
            :style="{ width: `${100 / row.maxCount}%` }"
          ></view>
        </view>
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
      // Banner数据
      banners: [],
      // Banner加载状态
      bannersLoading: false,
      // 金刚区数据
      quickLinks: [
        { id: 1, name: '秒杀', icon: 'https://via.placeholder.com/100', action: 'goToSeckill' },
        { id: 2, name: '拼团', icon: 'https://via.placeholder.com/100', action: 'goToGroupBuy' },
        { id: 3, name: '新品', icon: 'https://via.placeholder.com/100', action: 'goToNewArrivals' },
        { id: 4, name: '优惠券', icon: 'https://via.placeholder.com/100', action: 'goToCoupons' },
        { id: 5, name: '会员', icon: 'https://via.placeholder.com/100', action: 'goToMember' },
        { id: 6, name: '积分', icon: 'https://via.placeholder.com/100', action: 'goToPoints' },
        { id: 7, name: '客服', icon: 'https://via.placeholder.com/100', action: 'goToService' },
        { id: 8, name: '设置', icon: 'https://via.placeholder.com/100', action: 'goToSettings' }
      ],
      // 金刚区加载状态
      quickLinksLoading: false,
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
    // 处理Banner点击
    handleBannerClick(bannerId) {
      // 根据bannerId跳转到相应页面
      console.log('Banner clicked:', bannerId);
      // 暂时不跳转，仅记录点击事件
    },
    // 处理金刚区点击
    handleQuickLinkClick(action) {
      if (typeof this[action] === 'function') {
        this[action]();
      } else {
        console.log('Action not found:', action);
      }
    },
    // 优惠券页面
    goToCoupons() {
      console.log('Go to coupons');
      // 这里可以添加实际的跳转逻辑
    },
    // 会员页面
    goToMember() {
      console.log('Go to member');
      // 这里可以添加实际的跳转逻辑
    },
    // 积分页面
    goToPoints() {
      console.log('Go to points');
      // 这里可以添加实际的跳转逻辑
    },
    // 客服页面
    goToService() {
      console.log('Go to service');
      // 这里可以添加实际的跳转逻辑
    },
    // 设置页面
    goToSettings() {
      console.log('Go to settings');
      // 这里可以添加实际的跳转逻辑
    },
    // 获取金刚区数据
    fetchQuickLinks() {
      console.log('开始获取快捷入口数据');
      this.quickLinksLoading = true;
      // 构建API请求URL
      const url = `${BASE_API}/app/platQuickEntry/query`;
      console.log('快捷入口API地址:', url);
      
      // 直接使用uni.request发起请求，不使用token
      uni.request({
        url: url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('快捷入口API响应:', res);
          if (res.statusCode === 200 && res.data.code === 0) {
            // 处理返回的快捷入口数据
            const quickLinkData = res.data.data;
            console.log('快捷入口数据:', quickLinkData);
            
            // 构建完整的数据结构，最多显示10个
            const quickLinksWithDetails = quickLinkData.slice(0, 10).map((link, index) => ({
              id: index + 1,
              name: link.name,
              // 构建完整的图片URL
              icon: link.icon ? `${BASE_API}/public/storage/preview?fileKey=${link.icon}` : '',
              type: link.type,
              target: link.target,
              // 根据类型和目标生成action
              action: this.getActionForQuickLink(link.type, link.target)
            }));
            
            console.log('处理后的快捷入口数据:', quickLinksWithDetails);
            this.quickLinks = quickLinksWithDetails;
          } else {
            console.error('获取快捷入口失败:', res.data.message);
          }
        },
        fail: (err) => {
          console.error('请求快捷入口失败:', err);
        },
        complete: () => {
          console.log('快捷入口请求完成');
          this.quickLinksLoading = false;
        }
      });
    },
    // 获取平台Banner列表
    fetchBanners() {
      this.bannersLoading = true;
      
      // 构建API请求URL
      const url = `${BASE_API}/app/platBanner/query`;
      
      uni.request({
        url: url,
        method: 'GET',
        header: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiaWF0IjoxNzU0ODMxOTI0LCJzdWIiOiJhcHAiLCJ0ZXJtIjoiYXBwIiwiaWF0TXMiOjE3NTQ4MzE5MjQ5NjksImV4cE1zIjoxNzU0ODM1NTI0OTY5fQ.T5UGHYy6ThASbwIae6aM1tJue15rJaAFnyXI945UhSk',
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            // 处理返回的Banner数据
            const bannerData = res.data.data;
            
            // 构建完整的图片URL
            const bannersWithImages = bannerData.map((banner, index) => ({
              id: index + 1,
              image: banner.imageUrl ? (() => {
                const baseApi = BASE_API;
                return `${baseApi}/public/storage/preview?fileKey=${banner.imageUrl}`;
              })() : ''
            }));
            
            this.banners = bannersWithImages;
          } else {
            console.error('获取平台Banner失败:', res.data.message);
          }
        },
        fail: (err) => {
          console.error('请求平台Banner失败:', err);
        },
        complete: () => {
          this.bannersLoading = false;
        }
      });
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
    // 根据快捷入口类型和目标生成action方法名
    getActionForQuickLink(type, target) {
      // 根据类型和目标映射到对应的action方法
      switch (type) {
        case 1: // 秒杀活动
          return 'goToSeckill';
        case 2: // 拼团
          return 'goToGroupBuy';
        case 3: // 新品
          return 'goToNewArrivals';
        case 4: // 优惠券
          return 'goToCoupons';
        case 5: // 会员
          return 'goToMember';
        case 6: // 积分
          return 'goToPoints';
        case 7: // 客服
          return 'goToService';
        case 8: // 设置
          return 'goToSettings';
        default:
          // 如果有target，可能是自定义链接
          if (target) {
            return 'handleCustomQuickLink';
          }
          // 默认返回一个通用方法
          return 'handleDefaultQuickLink';
      }
    },
    
    // 处理默认快捷入口点击
    handleDefaultQuickLink() {
      console.log('Default quick link clicked');
      // 可以根据target参数进行相应处理
    },
    
    // 处理自定义链接类型的快捷入口
    handleCustomQuickLink() {
      console.log('Custom quick link clicked');
      // 可以根据target参数跳转到相应链接
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
                const baseApi = BASE_API;
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
  
  // 计算属性
  computed: {
    // 根据快捷入口数量计算每行显示的数量
    quickLinkRows() {
      const count = this.quickLinks.length;
      // 最多显示10个
      const displayCount = Math.min(count, 10);
      
      if (displayCount <= 4) {
        // <=4个，一行展示
        return [{
          items: this.quickLinks.slice(0, displayCount),
          count: displayCount,
          maxCount: displayCount
        }];
      } else {
        // 5-10个，两行布局
        const firstRowCount = Math.ceil(displayCount / 2);
        const secondRowCount = displayCount - firstRowCount;
        return [{
          items: this.quickLinks.slice(0, firstRowCount),
          count: firstRowCount,
          // 记录最大列数，用于对齐
          maxCount: firstRowCount
        }, {
          items: this.quickLinks.slice(firstRowCount, displayCount),
          count: secondRowCount,
          // 记录最大列数，用于对齐
          maxCount: firstRowCount
        }];
      }
    }
  },
  
  // 在页面加载时获取数据
  mounted() {
    console.log('首页组件mounted生命周期执行');
    this.fetchBanners();
    console.log('调用fetchQuickLinks前');
    this.fetchQuickLinks();
    console.log('调用fetchQuickLinks后');
    this.fetchHotProducts();
    console.log('mounted生命周期执行完成');
  },
  
  // 添加onLoad生命周期钩子
  onLoad() {
    console.log('首页组件onLoad生命周期执行');
  },
  
  // 添加onShow生命周期钩子
  onShow() {
    console.log('首页组件onShow生命周期执行');
    // 不再重复调用fetchQuickLinks，避免接口调用两次
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

/* Banner滚动区域样式 */
.banner-section {
  margin: 20rpx;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.banner-swiper {
  width: 100%;
  height: 300rpx;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 快捷入口样式 */
.quick-links {
  padding: 20rpx 0 10rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  margin: 20rpx;
}

.quick-link-row {
  margin-bottom: 15rpx;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20rpx;
  box-sizing: border-box;
  padding: 0 10rpx;
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

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  width: 100%;
  font-size: 28rpx;
  color: #999;
}
</style>