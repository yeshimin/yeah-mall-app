<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <!-- <view class="cart-header">
      <text class="header-title">购物车</text>
      <text class="edit-btn" @click="toggleEdit">{{ isEditing ? '完成' : '编辑' }}</text>
    </view> -->

    <!-- 购物车商品列表 -->
    <scroll-view class="cart-content" scroll-y>
      <view v-if="loading" class="cart-state">购物车加载中...</view>
      <view v-else-if="loadError" class="cart-state">
        <text>{{ loadError }}</text>
        <view class="cart-state-action" @click="fetchCartData">重新加载</view>
      </view>
      <template v-else>
      <!-- 按店铺分组展示商品 -->
      <view class="shop-group" v-for="(shop, shopIndex) in groupedCartItems" :key="shop.shopId">
        <!-- 店铺头部 -->
        <view class="shop-header">
          <view class="shop-selector" @click="toggleShopSelection(shopIndex)">
            <view class="selector" :class="{ selected: shop.selected }">
              <text class="checkmark" v-if="shop.selected">✓</text>
            </view>
          </view>
          <view class="shop-store-icon" aria-hidden="true">
            <view class="shop-store-awning">
              <view></view>
              <view></view>
              <view></view>
            </view>
            <view class="shop-store-body">
              <view class="shop-store-door"></view>
            </view>
          </view>
          <text class="shop-name">{{ shop.shopName }}</text>
          <text class="shop-item-count">共 {{ shop.items.length }} 件商品</text>
        </view>

        <!-- 店铺内商品列表 -->
        <view class="cart-item" v-for="(item, itemIndex) in shop.items" :key="item.id">
          <view class="item-selector" @click="toggleItemSelection(shopIndex, itemIndex)">
            <view class="selector" :class="{ selected: item.selected }">
              <text class="checkmark" v-if="item.selected">✓</text>
            </view>
          </view>
          <view class="item-image">
            <image v-if="item.image && !item.imageFailed" :src="item.image" mode="aspectFill" @error="handleCartImageError(item)"></image>
            <view v-else class="item-image-placeholder"></view>
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
        <view class="empty-cart-icon">
          <view class="empty-cart-handle"></view>
        </view>
        <text class="empty-text">购物车还是空的</text>
        <text class="empty-hint">去挑选一些喜欢的商品吧</text>
        <view class="empty-action" @click="goShopping">去逛逛</view>
      </view>
      </template>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view v-if="!loading && !loadError && groupedCartItems.length > 0" class="cart-footer">
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
import { onShow } from '@dcloudio/uni-app'
import { deleteCartItems, fetchCartItems, updateCartItemQuantity } from '../../utils/api.js'
import { getStoragePreviewUrl } from '@/utils/config.js'
import { handleAuthFailure, isAuthenticated } from '../../utils/auth.js'

const isEditing = ref(false)
const groupedCartItems = ref([])
const loading = ref(true)
const loadError = ref('')

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

function handleCartImageError(item) {
  item.imageFailed = true
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
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = ''
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
          imageFailed: false,
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
      loadError.value = '购物车加载失败，请稍后重试'
      uni.showToast({
        title: '获取购物车数据失败',
        icon: 'none'
      })
    })
    .finally(() => {
      loading.value = false
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

function goShopping() {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

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

<style scoped>
.page-container {
  height: 100%;
  margin-bottom: 0;
  padding-top: 0;
  background: var(--ym-paper);
}

.cart-content {
  box-sizing: border-box;
  padding: 0 0 calc(var(--window-bottom, 0px) + 136rpx);
  background: var(--ym-paper);
}

.cart-state {
  display: flex;
  min-height: 50vh;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20rpx;
  color: var(--ym-muted);
  font-size: 26rpx;
  text-align: center;
}

.cart-state-action {
  padding: 14rpx 30rpx;
  border-radius: 999rpx;
  color: #fff;
  background: var(--ym-brand);
}

.shop-group {
  margin-bottom: 20rpx;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--ym-surface);
  box-shadow: none;
}

.shop-header {
  display: grid;
  height: 84rpx;
  grid-template-columns: 38rpx 32rpx minmax(0, 1fr) auto;
  align-items: center;
  gap: 14rpx;
  box-sizing: border-box;
  padding: 0 32rpx;
  border-bottom: 0;
}

.shop-header::after {
  display: none;
}

.shop-selector {
  display: flex;
  align-items: center;
  margin: 0;
}

.shop-store-icon {
  position: relative;
  box-sizing: border-box;
  width: 34rpx;
  height: 34rpx;
}

.shop-store-awning {
  position: absolute;
  top: 1rpx;
  left: 0;
  display: flex;
  box-sizing: border-box;
  width: 34rpx;
  height: 13rpx;
  border: 3rpx solid var(--ym-brand);
  border-radius: 3rpx 3rpx 7rpx 7rpx;
  background: transparent;
  overflow: hidden;
}

.shop-store-awning view {
  box-sizing: border-box;
  width: 33.333%;
  height: 100%;
  border-right: 2rpx solid var(--ym-brand);
}

.shop-store-awning view:last-child {
  border-right: 0;
}

.shop-store-body {
  position: absolute;
  top: 13rpx;
  left: 3rpx;
  box-sizing: border-box;
  width: 28rpx;
  height: 20rpx;
  border-right: 3rpx solid var(--ym-brand);
  border-bottom: 3rpx solid var(--ym-brand);
  border-left: 3rpx solid var(--ym-brand);
  background: transparent;
}

.shop-store-door {
  position: absolute;
  right: 4rpx;
  bottom: 0;
  box-sizing: border-box;
  width: 8rpx;
  height: 11rpx;
  border-top: 2rpx solid var(--ym-brand);
  border-right: 2rpx solid var(--ym-brand);
  border-left: 2rpx solid var(--ym-brand);
}

.shop-name {
  overflow: hidden;
  min-width: 0;
  color: var(--ym-ink);
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.shop-item-count {
  flex: 0 0 auto;
  color: var(--ym-muted);
  font-size: 21rpx;
}

.cart-item {
  position: relative;
  box-sizing: border-box;
  padding: 28rpx 32rpx;
  border-top: 0;
  border-bottom: 0;
  background: var(--ym-surface);
}

.cart-item + .cart-item::before {
  position: absolute;
  top: 0;
  right: 32rpx;
  left: 288rpx;
  display: block;
  height: 1rpx;
  background: var(--ym-line);
  content: '';
}

.item-selector {
  width: 48rpx;
  flex: 0 0 48rpx;
  justify-content: flex-start;
  margin-right: 18rpx;
}

.selector {
  width: 36rpx;
  height: 36rpx;
  border-color: var(--ym-line-strong);
}

.selector.selected {
  border-color: var(--ym-brand);
  background: var(--ym-brand);
}

.item-image {
  width: 172rpx;
  height: 172rpx;
  flex: 0 0 172rpx;
  margin-right: 18rpx;
  overflow: hidden;
  border-radius: 20rpx;
  background: var(--ym-paper);
}

.item-image image {
  border-radius: 20rpx;
}

.item-image-placeholder {
  width: 100%;
  height: 100%;
  background: #e6ebe8;
}

.item-info {
  min-width: 0;
}

.item-name {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 6rpx;
  color: var(--ym-ink);
  font-size: 28rpx;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item-spec {
  overflow: hidden;
  margin-bottom: 14rpx;
  color: var(--ym-muted);
  font-size: 22rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item-price {
  color: var(--ym-price);
  font-size: 32rpx;
}

.quantity-controls {
  display: flex;
  width: 232rpx;
  height: 72rpx;
  box-sizing: border-box;
  align-items: stretch;
  overflow: hidden;
  border: 1rpx solid var(--ym-line);
  border-radius: var(--ym-radius-control);
  background: var(--ym-surface);
}

.control-btn {
  width: 72rpx;
  height: 100%;
  flex: 0 0 72rpx;
  box-sizing: border-box;
  border-radius: 0;
  background: var(--ym-paper);
  color: var(--ym-ink);
  font-size: 30rpx;
}

.quantity {
  display: flex;
  width: auto;
  height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: center;
  flex: 1;
  box-sizing: border-box;
  margin: 0;
  color: var(--ym-ink);
  font-size: 26rpx;
  font-weight: 600;
}

.item-delete,
.delete-text {
  color: var(--ym-price);
}

.cart-footer {
  bottom: var(--window-bottom, 0px);
  width: 100%;
  height: 124rpx;
  box-sizing: border-box;
  padding: 12rpx 24rpx;
  border-top: 1rpx solid var(--ym-line);
  background: rgba(255, 255, 255, 0.98);
}

.footer-left,
.footer-right {
  min-width: 0;
}

.select-all-text {
  color: var(--ym-muted);
  font-size: 24rpx;
}

.total-info {
  margin-right: 18rpx;
}

.total-text {
  color: var(--ym-muted);
  font-size: 22rpx;
}

.total-price {
  color: var(--ym-price);
  font-size: 32rpx;
}

.checkout-btn {
  width: 228rpx;
  height: 84rpx;
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand);
  font-size: 28rpx;
}

.empty-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 180rpx 0 100rpx;
}

.empty-text {
  margin-top: 26rpx;
  color: var(--ym-ink);
  font-size: 30rpx;
  font-weight: 700;
}

.empty-hint {
  margin-top: 10rpx;
  color: var(--ym-muted);
  font-size: 23rpx;
}

.empty-cart-icon {
  position: relative;
  width: 108rpx;
  height: 92rpx;
  box-sizing: border-box;
  border: 5rpx solid var(--ym-brand);
  border-radius: 20rpx;
  background: var(--ym-brand-soft);
}

.empty-cart-handle {
  position: absolute;
  top: -34rpx;
  left: 50%;
  width: 48rpx;
  height: 36rpx;
  box-sizing: border-box;
  border: 5rpx solid var(--ym-brand);
  border-bottom: 0;
  border-radius: 24rpx 24rpx 0 0;
  transform: translateX(-50%);
}

.empty-action {
  display: flex;
  min-width: 180rpx;
  height: 72rpx;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  padding: 0 28rpx;
  color: #fff;
  border-radius: var(--ym-radius-control);
  background: var(--ym-brand);
  font-size: 26rpx;
  font-weight: 700;
}
</style>
