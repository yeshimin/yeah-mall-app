<template>
  <view class="page-container">
    <view class="cart-container">
      <!-- 顶部导航栏 -->
      <view class="cart-header">
        <text class="header-title">购物车</text>
        <text class="edit-btn" @click="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</text>
      </view>

      <!-- 购物车商品列表 -->
      <scroll-view class="cart-content" scroll-y>
        <!-- 按店铺分组展示商品 -->
        <view class="shop-group" v-for="(shop, shopIndex) in groupedCartItems" :key="shopIndex">
          <!-- 店铺头部 -->
          <view class="shop-header">
            <view class="shop-selector" @click="toggleShopSelection(shopIndex)">
              <view class="selector" :class="{ selected: shop.selected }">
                <text class="checkmark" v-if="shop.selected">✓</text>
              </view>
            </view>
            <text class="shop-name">{{ shop.shopName }}</text>
          </view>

          <!-- 店铺内商品列表 -->
          <view class="cart-item" v-for="(item, itemIndex) in shop.items" :key="itemIndex">
            <view class="item-selector" @click="toggleItemSelection(shopIndex, itemIndex)">
              <view class="selector" :class="{ selected: item.selected }">
                <text class="checkmark" v-if="item.selected">✓</text>
              </view>
            </view>
            <view class="item-image">
              <image :src="item.image" mode="aspectFill"></image>
            </view>
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec">{{ item.spec }}</text>
              <view class="item-price-controls">
                <text class="item-price">¥{{ item.price }}</text>
                <view class="quantity-controls" v-if="!isEditing">
                  <text class="control-btn" @click="decreaseQuantity(shopIndex, itemIndex)">-</text>
                  <text class="quantity">{{ item.quantity }}</text>
                  <text class="control-btn" @click="increaseQuantity(shopIndex, itemIndex)">+</text>
                </view>
                <text class="item-delete" v-else @click="deleteItem(shopIndex, itemIndex)">删除</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空购物车提示 -->
        <view class="empty-cart" v-if="groupedCartItems.length === 0">
          <text class="empty-text">购物车为空</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部结算栏 -->
    <view class="cart-footer">
      <view class="footer-left">
        <view class="select-all" @click="toggleSelectAll">
          <view class="selector" :class="{ selected: isAllSelected }">
            <text class="checkmark" v-if="isAllSelected">✓</text>
          </view>
          <text class="select-all-text">全选</text>
        </view>
        <view class="delete-selected" @click="deleteSelectedItems" v-if="selectedCount > 0">
          <text class="delete-text">删除({{ selectedCount }})</text>
        </view>
      </view>
      <view class="footer-right">
        <view class="total-info">
          <text class="total-text">合计:</text>
          <text class="total-price">¥{{ totalPrice }}</text>
          <text class="delivery-fee" v-if="parseFloat(totalPrice) < 99">(满99免运费)</text>
        </view>
        <view class="checkout-btn" @click="checkout">结算({{ selectedCount }})</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Cart',
  data() {
    return {
      isEditing: false,
      // 按店铺分组的购物车商品数据
      groupedCartItems: [
        {
          shopId: 1,
          shopName: '时尚女装专营店',
          selected: true,
          items: [
            {
              id: 1,
              name: '夏季新款连衣裙',
              spec: '颜色:红色;尺码:M',
              price: 199.99,
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: true
            },
            {
              id: 2,
              name: '休闲牛仔裤',
              spec: '颜色:蓝色;尺码:L',
              price: 159.00,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: false
            },
            {
              id: 3,
              name: '纯棉T恤',
              spec: '颜色:白色;尺码:S',
              price: 79.90,
              quantity: 3,
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: true
            }
          ]
        },
        {
          shopId: 2,
          shopName: '数码电器旗舰店',
          selected: false,
          items: [
            {
              id: 4,
              name: '无线蓝牙耳机',
              spec: '颜色:黑色',
              price: 299.00,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: true
            },
            {
              id: 5,
              name: '智能手环',
              spec: '颜色:银色',
              price: 199.00,
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: false
            }
          ]
        },
        {
          shopId: 3,
          shopName: '家居生活馆',
          selected: true,
          items: [
            {
              id: 6,
              name: '记忆棉枕头',
              spec: '尺寸:标准款',
              price: 89.90,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: true
            },
            {
              id: 7,
              name: '不锈钢保温杯',
              spec: '容量:500ml;颜色:银色',
              price: 59.90,
              quantity: 2,
              image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: true
            }
          ]
        },
        {
          shopId: 4,
          shopName: '运动户外专卖店',
          selected: false,
          items: [
            {
              id: 8,
              name: '跑步鞋',
              spec: '颜色:白色;尺码:39',
              price: 399.00,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
              selected: false
            }
          ]
        }
      ]
    }
  },
  computed: {
    // 计算选中商品的总价格
    totalPrice() {
      return this.groupedCartItems
        .flatMap(shop => shop.items)
        .filter(item => item.selected)
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2)
    },
    // 计算选中商品的数量
    selectedCount() {
      return this.groupedCartItems
        .flatMap(shop => shop.items)
        .filter(item => item.selected)
        .reduce((count, item) => count + item.quantity, 0)
    },
    // 判断是否全选
    isAllSelected() {
      const allItems = this.groupedCartItems.flatMap(shop => shop.items)
      return allItems.length > 0 && allItems.every(item => item.selected)
    }
  },
  methods: {
    // 切换编辑状态
    toggleEdit() {
      this.isEditing = !this.isEditing
    },
    // 切换单个商品选择状态
    toggleItemSelection(shopIndex, itemIndex) {
      const item = this.groupedCartItems[shopIndex].items[itemIndex]
      item.selected = !item.selected

      // 检查店铺内所有商品是否都已选中
      const shop = this.groupedCartItems[shopIndex]
      shop.selected = shop.items.every(item => item.selected)
    },
    // 切换店铺选择状态
    toggleShopSelection(shopIndex) {
      const shop = this.groupedCartItems[shopIndex]
      shop.selected = !shop.selected

      // 同步店铺内所有商品的选择状态
      shop.items.forEach(item => {
        item.selected = shop.selected
      })
    },
    // 切换全选状态
    toggleSelectAll() {
      const newValue = !this.isAllSelected
      this.groupedCartItems.forEach(shop => {
        shop.selected = newValue
        shop.items.forEach(item => {
          item.selected = newValue
        })
      })
    },
    // 增加商品数量
    increaseQuantity(shopIndex, itemIndex) {
      this.groupedCartItems[shopIndex].items[itemIndex].quantity++
    },
    // 减少商品数量
    decreaseQuantity(shopIndex, itemIndex) {
      const item = this.groupedCartItems[shopIndex].items[itemIndex]
      if (item.quantity > 1) {
        item.quantity--
      } else {
        // 如果数量为1，提示是否删除商品
        uni.showModal({
          title: '提示',
          content: '是否删除该商品？',
          success: (res) => {
            if (res.confirm) {
              this.groupedCartItems[shopIndex].items.splice(itemIndex, 1)

              // 如果店铺内没有商品了，删除店铺
              if (this.groupedCartItems[shopIndex].items.length === 0) {
                this.groupedCartItems.splice(shopIndex, 1)
              }

              // 重新检查全选状态
              this.checkAllSelected()
            }
          }
        })
      }
    },
    // 删除商品
    deleteItem(shopIndex, itemIndex) {
      uni.showModal({
        title: '提示',
        content: '是否删除该商品？',
        success: (res) => {
          if (res.confirm) {
            this.groupedCartItems[shopIndex].items.splice(itemIndex, 1)

            // 如果店铺内没有商品了，删除店铺
            if (this.groupedCartItems[shopIndex].items.length === 0) {
              this.groupedCartItems.splice(shopIndex, 1)
            }

            // 重新检查全选状态
            this.checkAllSelected()
          }
        }
      })
    },
    // 删除选中的商品
    deleteSelectedItems() {
      if (this.selectedCount === 0) {
        return
      }

      uni.showModal({
        title: '提示',
        content: `是否删除选中的${this.selectedCount}件商品？`,
        success: (res) => {
          if (res.confirm) {
            // 遍历所有店铺，删除选中的商品
            for (let shopIndex = this.groupedCartItems.length - 1; shopIndex >= 0; shopIndex--) {
              const shop = this.groupedCartItems[shopIndex]

              // 删除选中的商品
              for (let itemIndex = shop.items.length - 1; itemIndex >= 0; itemIndex--) {
                if (shop.items[itemIndex].selected) {
                  shop.items.splice(itemIndex, 1)
                }
              }

              // 如果店铺内没有商品了，删除店铺
              if (shop.items.length === 0) {
                this.groupedCartItems.splice(shopIndex, 1)
              }
            }

            // 重新检查全选状态
            this.checkAllSelected()

            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    // 检查全选状态
    checkAllSelected() {
      const allItems = this.groupedCartItems.flatMap(shop => shop.items)
      const allSelected = allItems.length > 0 && allItems.every(item => item.selected)

      // 如果所有商品都已选中，更新全选状态
      if (allSelected) {
        this.groupedCartItems.forEach(shop => {
          shop.selected = true
        })
      }
    },
    // 结算
    checkout() {
      if (this.selectedCount === 0) {
        uni.showToast({
          title: '请选择商品',
          icon: 'none'
        })
        return
      }

      // 这里可以跳转到结算页面
      uni.showToast({
        title: `结算 ${this.selectedCount} 件商品，总计 ¥${this.totalPrice}`,
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
/* 购物车容器 */
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  background-color: #fff;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.edit-btn {
  font-size: 28rpx;
  color: #ff6b35;
}

/* 购物车内容区域 */
.cart-content {
  /* display: none; */
  flex: 1;
  height: 0;
  background-color: #999;
  /* 解决 iOS scroll-view 高度问题 */
}

/* 店铺分组 */
.shop-group {
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.shop-header {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.shop-selector {
  margin-right: 20rpx;
}

.shop-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.cart-item {
  display: flex;
  padding: 20rpx;
}

.item-selector {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.selector {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
}

.selector.selected {
  background-color: #ff6b35;
  border-color: #ff6b35;
}

.checkmark {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
}

.item-image image {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.item-spec {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.item-price-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b35;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.control-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 5rpx;
}

.quantity {
  margin: 0 15rpx;
  font-size: 28rpx;
}

.item-delete {
  color: #ff6b35;
  font-size: 28rpx;
}

.cart-footer {
  display: flex;
  height: 250rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #333;
  border-top: 1rpx solid #eee;
  z-index: 100;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.footer-left {
  display: flex;
  align-items: center;
}

.select-all {
  display: flex;
  align-items: center;
}

.select-all-text {
  margin-left: 10rpx;
  font-size: 28rpx;
}

.delete-selected {
  margin-left: 30rpx;
  display: flex;
  align-items: center;
}

.delete-text {
  font-size: 28rpx;
  color: #ff6b35;
}

.footer-right {
  display: flex;
  align-items: center;
}

.total-info {
  margin-right: 30rpx;
  text-align: right;
}

.total-text {
  font-size: 26rpx;
  color: #999;
}

.total-price {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b35;
}

.delivery-fee {
  font-size: 24rpx;
  color: #ff6b35;
  margin-top: 5rpx;
}

.checkout-btn {
  width: 200rpx;
  height: 70rpx;
  background-color: #ff6b35;
  border-radius: 35rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

/* 空购物车样式 */
.empty-cart {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
}
</style>