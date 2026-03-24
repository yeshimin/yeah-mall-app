<template>
	<view class="address-list">
		
		<!-- 地址列表 -->
		<view class="address-content">
			<view v-if="loading" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<template v-else>
				<!-- 无地址提示 -->
				<view class="empty-state" v-if="addressList.length === 0">
					<text class="empty-icon">📍</text>
					<text class="empty-text">暂无收货地址</text>
					<view class="empty-action">
						<button class="add-address-btn" @click="goToAddAddress">立即添加收货地址</button>
					</view>
				</view>
				
				<!-- 地址列表 -->
				<view class="address-item" v-for="(address, index) in addressList" :key="address.id">
					<view class="address-info" @click="selectAddress(address)">
						<view class="address-header">
							<text class="name">{{ address.name }}</text>
							<text class="phone">{{ address.contact }}</text>
							<view class="default-tag" v-if="address.isDefault">
								<text>默认</text>
							</view>
						</view>
						<view class="address-detail">
							<text>{{ address.fullAddress }}</text>
						</view>
					</view>
					
					<view class="address-actions">
						<view class="action-btn edit-btn" @click.stop="goToEditAddress(address.id)">
							<text>编辑</text>
						</view>
						<view class="action-btn default-btn" @click.stop="setDefaultAddress(address.id)" v-if="!address.isDefault">
							<text>设为默认</text>
						</view>
						<view class="action-btn delete-btn" @click.stop="handleDeleteAddress(address.id)">
							<text>删除</text>
						</view>
					</view>
				</view>
			</template>
		</view>
		
		<!-- 底部添加按钮 -->
		<view class="bottom-add" @click="goToAddAddress">
			<text>+</text>
			<text>新增收货地址</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  queryAddressList,
  deleteAddress as deleteAddressApi,
  updateAddress as updateAddressApi
} from '../../utils/api.js'

const addressList = ref([])
const loading = ref(false)
const fromOrder = ref(false)

function fetchAddressList() {
  loading.value = true
  queryAddressList()
    .then((data) => {
      addressList.value = data
    })
    .catch((error) => {
      console.error('获取地址列表失败:', error)
      uni.showToast({
        title: '获取地址列表失败',
        icon: 'none'
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function selectAddress(address) {
  if (!fromOrder.value) {
    goToEditAddress(address.id)
    return
  }

  uni.setStorageSync('selectedAddress', {
    id: address.id,
    name: address.name,
    phone: address.contact,
    address: address.fullAddress,
    provinceCode: address.provinceCode,
    cityCode: address.cityCode,
    districtCode: address.districtCode,
    isDefault: address.isDefault
  })

  uni.navigateBack()
}

function goToAddAddress() {
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}

function goToEditAddress(id) {
  uni.navigateTo({
    url: `/pages/address/edit?id=${id}`
  })
}

function setDefaultAddress(id) {
  const address = addressList.value.find((item) => item.id === id)
  if (!address) {
    return
  }

  updateAddressApi({
    ...address,
    isDefault: true
  })
    .then(() => {
      uni.showToast({
        title: '设置默认地址成功',
        icon: 'success'
      })
      fetchAddressList()
    })
    .catch((error) => {
      console.error('设置默认地址失败:', error)
      uni.showToast({
        title: error.message || '设置默认地址失败',
        icon: 'none'
      })
    })
}

function handleDeleteAddress(id) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个地址吗？',
    success: (res) => {
      if (!res.confirm) {
        return
      }

      deleteAddressApi(id)
        .then(() => {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          fetchAddressList()
        })
        .catch((error) => {
          console.error('删除地址失败:', error)
          uni.showToast({
            title: error.message || '删除地址失败',
            icon: 'none'
          })
        })
    }
  })
}

onLoad((options = {}) => {
  fromOrder.value = options.fromOrder === 'true'
  fetchAddressList()
})

onShow(() => {
  fetchAddressList()
})
</script>

<style scoped>
	/* 图标字体 */
	@font-face {
		font-family: "iconfont";
		src: url('data:font/woff2;charset=utf-8;base64,d09GMgABAAAAAAVMAAsAAAAACkQAAAT+AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqHVIYnATYCJAMUCwwABCAFhGcHSRvSCFGUTk6Q7CtsynAvFKKiUBQVK6okqrb39mhve0MwPPH9fvzOvXOfmUkyCZJookmkkyYxkUQoJEKlE6Lh/2ua/QFbYauha6OmdRXRVZTVRKpkZa7Di6ScvDk5OW8+Jy/xEqF4Eo1EIiRCIiRC8TQaiRBCJEQjEbKZZO7p3wHEADYDGwxsa6C2FjGIZlsTBGDhf66ZXpIWTdvs5uTmXuGKqvCrAqsAq8IqcEX1c3wNqMrfNy9fZCpgo6Dw1r6z5mzk7QvvU3oK/xOkADfnB7jjQAFtgAGxUOhdBgdl2zAMXcapYQwk2xEo9sX4+5T3Ke9T3qe+T/3/E0yAJILjv3hAodAQG4SoQVQBCu8zZfApJYYvIFPhC0ZU+EISDb4QRIsvJCnhCwkKQJYCQDvAeYBYA0jfIbehCBSxsYsJm1AwmJycpNFIJHK5RKlUqHQ6rVar0WrVcrlMJpOKRCIez+dZLHqnU+/z6QIBfTCo93iMJpPBYNB7vSa73RwO2+Nxe0+PY3DQNTLiHhvzjI97Jia8U1O+2Vnf/Lx/YSGwtBRcWQmtrUU2NqJbW7Hd3fj+fvzoKHF8nDw9TZ2dpS8u0tls5vIye3WVu77O5/P5m5vC7W3x7q50f1+G4+m0Nh5XRyKKUEgWCEj9fqnXK3G7JS6X2OkUOxxCm01gsQjMZoHJxDcY+Dod4HYDHg/g9QL9/cDAADAyAoyPA1NTwOws8PAAnJ8DuRyQzwO3t8DjI/D0BLy8AK+vwNsb8P4OfHwAn5/A1xfw/Q38/AJ/f8Df3+9/wPcP8P0LfP0BX7/A5w/w8Q28vwGvr8DLC/D8DDw9Ao8PwP0dcHcL3FwD+Wtgbw/Y3QV2doDtbWBrC9jcBDY2gLU1YHUVWFkBlpeBxUVgfh6YmwNmZ4GZGWBqCpicBMbHgdFRYHgYGBwEBgaA/n6grw/o7QV6eoDubqCrC+jsBI6OgMNDIJMB0mkglQISCSAeB2IxIBoFIhEgHAZCISAYBAIBwO8HfD7A6wU8HsDtBlwuwOkEHA7AbgdsNsBqBSwWwGwGTCbAaAQMBkCvB3Q6QKsFNBpArQZUKkCpBBQKQC4HZDJAKgXEYkAkAoRCQCAA+HyA1wt4PIDLBTgcgM0GWCyAyQQYDIBOB2g0gEoFyOWARCIQCPl8Hk/I5Qq4XD6Hw+dweBwOl81ms1gsJovFYLEYbDaDw2Fw/2MwGEwmk8VisVgsNpvN4XC4XC6Px+Pz+QKBQCgUisRiiUQilUplMplcLlcoFEqlUqVSqdVqjUaj1Wp1Op1er8cxHA9gWADHAyQJUBRA0wDDABwHCAKgKIBhAJYFOA7gecDnA4GALxKJJBKJTCZTKBQqlUqj0eh0OoPBYDKZLBaLzWZzOBwul8vj8QQCgVAoFIvFUqlUJpMplUqNRqPVanU6ncFgMJlMFovFZrM5HA6Xy+XxeHw+XyAQiEQiiUQik8mUSqVKpdJoNFqtVqfTGQwGk8lksVhsNpvD4XC5XB6Px+fzBQKBSCQSi8VSqVQmkymVSo1Go9VqdTqdwWAwmUwWi8Vms//8+QcmQZKo') format('woff2');
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-size: 32rpx;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.address-list {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 200rpx;
	}
	
	/* 地址内容区域额外增加底部间距 */
	.address-content {
		padding-bottom: 50rpx;
	}
	
	/* 确保最后一个地址项有足够的底部空间 */
	.address-item:last-child {
		margin-bottom: 50rpx;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;
	}

	.loading-text {
		color: #999;
		font-size: 28rpx;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
	}

	.empty-icon {
		font-size: 100rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 40rpx;
	}

	.empty-action {
		margin-top: 40rpx;
	}

	.add-address-btn {
		width: 280rpx;
		height: 70rpx;
		line-height: 70rpx;
		background-color: #ff4757;
		color: #fff;
		border-radius: 35rpx;
		font-size: 30rpx;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.3);
	}

	.add-address-btn:active {
		transform: scale(0.98);
		background-color: #ff3747;
	}

	/* 地址项 */
	.address-item {
		background-color: #fff;
		margin: 20rpx;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
		padding: 20rpx;
		position: relative;
	}

	.address-info {
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		margin-bottom: 20rpx;
	}

	.address-header {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-right: 20rpx;
	}

	.phone {
		font-size: 28rpx;
		color: #666;
		margin-right: 20rpx;
	}

	.default-tag {
		background-color: #ff4757;
		color: #fff;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}

	.address-detail {
		font-size: 26rpx;
		color: #666;
		line-height: 1.4;
	}

	/* 地址操作 */
	.address-actions {
		display: flex;
		justify-content: flex-end;
		gap: 40rpx;
	}

	.action-btn {
		display: flex;
		align-items: center;
		color: #666;
		font-size: 24rpx;
	}

	.action-btn text {
		margin-left: 8rpx;
	}

	.edit-btn {
		color: #333;
	}

	.default-btn {
		color: #3cc51f;
	}

	.delete-btn {
		color: #ff4757;
	}

	/* 底部添加按钮 */
	.bottom-add {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		color: #ff4757;
		font-size: 28rpx;
	}

	.bottom-add text:first-child {
		font-size: 36rpx;
		margin-right: 10rpx;
		font-weight: bold;
	}
</style>
