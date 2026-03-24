<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <!-- <view class="cart-header">
      <text class="header-title">购物车</text>
      <text class="edit-btn" @click="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</text>
    </view> -->

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
          <view class="item-image" v-if="item.image">
            <image :src="item.image" mode="aspectFill"></image>
          </view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-spec">{{ item.spec.map(spec => `${spec.specName}:${spec.optName}`).join(';') }}</text>
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
        </view>
        <view class="checkout-btn" @click="checkout">结算({{ selectedCount }})</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { deleteCartItems, fetchCartItems, updateCartItemQuantity } from '../../utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { handleAuthFailure, isAuthenticated } from '../../utils/auth.js'

const isEditing = ref(false)
const groupedCartItems = ref([])

const totalPrice = computed(() => {
  return groupedCartItems.value
    .flatMap((shop) => shop.items)
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2)
})

const selectedCount = computed(() => {
  return groupedCartItems.value
    .flatMap((shop) => shop.items)
    .filter((item) => item.selected)
    .reduce((count, item) => count + item.quantity, 0)
})

const isAllSelected = computed(() => {
  const allItems = groupedCartItems.value.flatMap((shop) => shop.items)
  return allItems.length > 0 && allItems.every((item) => item.selected)
})

function ensureLogin() {
  if (isAuthenticated()) {
    return true
  }

  handleAuthFailure()
  return false
}

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function toggleItemSelection(shopIndex, itemIndex) {
  const item = groupedCartItems.value[shopIndex].items[itemIndex]
  item.selected = !item.selected

  const shop = groupedCartItems.value[shopIndex]
  shop.selected = shop.items.every((shopItem) => shopItem.selected)
}

function toggleShopSelection(shopIndex) {
  const shop = groupedCartItems.value[shopIndex]
  shop.selected = !shop.selected
  shop.items.forEach((item) => {
    item.selected = shop.selected
  })
}

function toggleSelectAll() {
  const nextValue = !isAllSelected.value
  groupedCartItems.value.forEach((shop) => {
    shop.selected = nextValue
    shop.items.forEach((item) => {
      item.selected = nextValue
    })
  })
}

function removeItemFromGroupedData(shopIndex, itemIndex) {
  groupedCartItems.value[shopIndex].items.splice(itemIndex, 1)
  if (groupedCartItems.value[shopIndex].items.length === 0) {
    groupedCartItems.value.splice(shopIndex, 1)
  }
}

function increaseQuantity(shopIndex, itemIndex) {
  const item = groupedCartItems.value[shopIndex].items[itemIndex]
  const oldQuantity = item.quantity
  item.quantity += 1

  updateCartItemQuantity(item.id, item.quantity)
    .catch((error) => {
      console.error('商品数量更新失败:', error)
      item.quantity = oldQuantity
      uni.showToast({
        title: '数量更新失败',
        icon: 'none'
      })
    })
}

function decreaseQuantity(shopIndex, itemIndex) {
  const item = groupedCartItems.value[shopIndex].items[itemIndex]
  const oldQuantity = item.quantity

  if (item.quantity > 1) {
    item.quantity -= 1
    updateCartItemQuantity(item.id, item.quantity)
      .catch((error) => {
        console.error('商品数量更新失败:', error)
        item.quantity = oldQuantity
        uni.showToast({
          title: '数量更新失败',
          icon: 'none'
        })
      })
    return
  }

  uni.showModal({
    title: '提示',
    content: '是否删除该商品？',
    success: (res) => {
      if (!res.confirm) {
        return
      }

      deleteCartItems([item.id])
        .then(() => {
          removeItemFromGroupedData(shopIndex, itemIndex)
        })
        .catch((error) => {
          console.error('商品删除失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        })
    }
  })
}

function deleteItem(shopIndex, itemIndex) {
  const item = groupedCartItems.value[shopIndex].items[itemIndex]
  deleteCartItems([item.id])
    .then(() => {
      removeItemFromGroupedData(shopIndex, itemIndex)
    })
    .catch((error) => {
      console.error('商品删除失败:', error)
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
    })
}

function deleteSelectedItems() {
  const selectedItems = groupedCartItems.value
    .flatMap((shop) => shop.items)
    .filter((item) => item.selected)

  if (selectedItems.length === 0) {
    uni.showToast({
      title: '请选择要删除的商品',
      icon: 'none'
    })
    return
  }

  const itemIds = selectedItems.map((item) => item.id)
  uni.showModal({
    title: '提示',
    content: `确定要删除选中的${selectedItems.length}件商品吗？`,
    success: (res) => {
      if (!res.confirm) {
        return
      }

      deleteCartItems(itemIds)
        .then(() => {
          groupedCartItems.value = groupedCartItems.value
            .map((shop) => ({
              ...shop,
              items: shop.items.filter((item) => !itemIds.includes(item.id))
            }))
            .filter((shop) => shop.items.length > 0)

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
        })
        .catch((error) => {
          console.error('商品批量删除失败:', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        })
    }
  })
}

function fetchCartData() {
  if (!ensureLogin()) {
    return
  }

  fetchCartItems()
    .then((data) => {
      groupedCartItems.value = (data || []).map((shop) => ({
        shopId: shop.shopId,
        shopName: shop.shopName,
        selected: false,
        items: (shop.items || []).map((item) => ({
          id: item.id,
          skuId: item.skuId,
          name: item.spuName,
          spec: item.specs || [],
          price: item.price,
          quantity: item.quantity,
          image: getStoragePreviewUrl(item.spuMainImage),
          selected: false
        }))
      }))
    })
    .catch((error) => {
      if (error && error.message === 'AUTH_401') {
        handleAuthFailure()
        return
      }

      console.error('获取购物车数据失败:', error)
      uni.showToast({
        title: '获取购物车数据失败',
        icon: 'none'
      })
    })
}

function checkout() {
  if (selectedCount.value === 0) {
    uni.showToast({
      title: '请选择商品',
      icon: 'none'
    })
    return
  }

  const selectedItems = groupedCartItems.value
    .flatMap((shop) => shop.items)
    .filter((item) => item.selected)
    .map((item) => ({
      skuId: item.skuId,
      quantity: item.quantity
    }))

  uni.navigateTo({
    url: '/pages/order/confirm',
    success: (res) => {
      res.eventChannel.emit('acceptDataFromCartPage', {
        selectedItems
      })
    }
  })
}

onLoad(() => {
  if (ensureLogin()) {
    fetchCartData()
  }
})

onShow(() => {
  if (ensureLogin()) {
    fetchCartData()
  }
})
</script>

<style scoped>
/* 购物车容器 */
.page-container {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  height: 100vh;
  margin-bottom: 10rpx;
  padding-top: var(--status-bar-height);
}

/* 顶部导航栏 */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* height: 200rpx; */
  background-color: #999;
  padding: 0 30rpx;
  padding-top: 16rpx;
  padding-bottom: 16rpx;
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
  flex: 1;
  padding-bottom: calc(var(--window-bottom) + 100rpx);
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
  position: fixed;
  bottom: var(--window-bottom);
  width: 100%;
  height: 100rpx;
  /* height: 100rpx; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  /* padding-bottom: 100rpx; */
  background-color: antiquewhite;
  border-top: 1px solid #eee;
  z-index: 999;
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
