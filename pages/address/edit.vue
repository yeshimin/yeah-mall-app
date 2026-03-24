<template>
	<view class="address-edit">
		
		<!-- 表单内容 -->
		<view class="form-content">
			<!-- 姓名 -->
			<view class="form-item">
				<text class="label">
					<text class="required">*</text>
					收货人
				</text>
				<input class="input" v-model="formData.name" placeholder="请输入收货人姓名" />
			</view>
			
			<!-- 手机号 -->
			<view class="form-item">
				<text class="label">
					<text class="required">*</text>
					手机号
				</text>
				<input class="input" v-model="formData.contact" placeholder="请输入手机号" type="number" />
			</view>
			
			<!-- 所在地区 -->
			<view class="form-item">
				<text class="label">
					<text class="required">*</text>
					所在地区
				</text>
				<view class="region-picker" @click="showRegionPicker">
				<text v-if="formData.provinceName && formData.cityName && formData.districtName" class="region-text">{{ formData.provinceName }} {{ formData.cityName }} {{ formData.districtName }}</text>
				<text v-else class="placeholder">请选择所在地区</text>
				<text class="iconfont arrow-icon">&#xe65f;</text>
			</view>
			</view>
			
			<!-- 详细地址 -->
			<view class="form-item">
				<text class="label">
					<text class="required">*</text>
					详细地址
				</text>
				<textarea class="textarea" v-model="formData.detailAddress" placeholder="请输入详细地址信息" rows="3"></textarea>
			</view>
			
			<!-- 邮政编码 -->
			<view class="form-item">
				<text class="label">邮政编码</text>
				<input class="input" v-model="formData.postalCode" placeholder="请输入邮政编码" type="number" />
			</view>
			
			<!-- 默认地址 -->
			<view class="form-item default-item">
				<text class="label">默认地址</text>
				<view class="switch-container">
					<switch :checked="formData.isDefault" @change="onSwitchChange" color="#ff4757" />
				</view>
			</view>
		</view>
		
		<!-- 地区选择器 -->
		<view v-if="showPicker" class="picker-container">
			<!-- 选择器顶部操作栏 -->
			<view class="picker-header">
				<text class="cancel-btn" @click="hideRegionPicker">取消</text>
				<text class="confirm-btn" @click="confirmRegion">确定</text>
			</view>
			<!-- 选择器内容 -->
			<picker-view class="picker-view" :value="pickerValue" @change="pickerChange">
				<picker-view-column>
					<view v-for="province in provinces" :key="province.code" class="picker-item">{{ province.name }}</view>
				</picker-view-column>
				<picker-view-column>
					<view v-for="city in cities" :key="city.code" class="picker-item">{{ city.name }}</view>
				</picker-view-column>
				<picker-view-column>
					<view v-for="district in districts" :key="district.code" class="picker-item">{{ district.name }}</view>
				</picker-view-column>
			</picker-view>
		</view>
		
		<!-- 选择器遮罩 -->
		<view v-if="showPicker" class="picker-mask" @click="hideRegionPicker"></view>
		
		<!-- 底部保存按钮 -->
		<view class="bottom-save-bar">
			<button class="save-btn" @click="saveAddress">{{ isEdit ? '更新地址' : '保存地址' }}</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { createAddress, fetchCities, fetchDistricts, fetchProvinces, getAddressDetail, updateAddress } from '../../utils/api.js'

const formData = reactive({
  id: null,
  name: '',
  contact: '',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: '',
  detailAddress: '',
  postalCode: '',
  isDefault: false
})

const tempRegion = reactive({
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: ''
})

const isEdit = ref(false)
const showPicker = ref(false)
const pickerValue = ref([0, 0, 0])
const provinces = ref([])
const cities = ref([])
const districts = ref([])

function assignFormData(data) {
  Object.assign(formData, {
    id: data.id ?? null,
    name: data.name || '',
    contact: data.contact || '',
    provinceCode: data.provinceCode || '',
    provinceName: data.provinceName || '',
    cityCode: data.cityCode || '',
    cityName: data.cityName || '',
    districtCode: data.districtCode || '',
    districtName: data.districtName || '',
    detailAddress: data.detailAddress || '',
    postalCode: data.postalCode || '',
    isDefault: !!data.isDefault
  })
}

function onSwitchChange(event) {
  formData.isDefault = event.detail.value
}

function loadAddressDetail(id) {
  getAddressDetail(id)
    .then(async (data) => {
      assignFormData(data)
      await syncPickerByFormData()
    })
    .catch((error) => {
      console.error('获取地址详情失败:', error)
      uni.showToast({
        title: '获取地址详情失败',
        icon: 'none'
      })
    })
}

function validateForm() {
  if (!formData.name) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return false
  }

  if (!formData.contact || !/^1[3-9]\d{9}$/.test(formData.contact)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }

  if (!formData.provinceCode || !formData.cityCode || !formData.districtCode) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' })
    return false
  }

  if (!formData.detailAddress) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }

  return true
}

function saveAddress() {
  if (!validateForm()) {
    return
  }

  const addressData = { ...formData }
  const request = isEdit.value ? updateAddress(addressData) : createAddress(addressData)

  request
    .then(() => {
      uni.showToast({
        title: isEdit.value ? '更新地址成功' : '添加地址成功',
        icon: 'success'
      })
      uni.navigateBack()
    })
    .catch((error) => {
      console.error(isEdit.value ? '更新地址失败:' : '添加地址失败:', error)
      uni.showToast({
        title: error.message || (isEdit.value ? '更新地址失败' : '添加地址失败'),
        icon: 'none'
      })
    })
}

function showRegionPicker() {
  Object.assign(tempRegion, {
    provinceCode: formData.provinceCode,
    provinceName: formData.provinceName,
    cityCode: formData.cityCode,
    cityName: formData.cityName,
    districtCode: formData.districtCode,
    districtName: formData.districtName
  })
  showPicker.value = true
}

function hideRegionPicker() {
  showPicker.value = false
}

function fetchProvinceList() {
  return fetchProvinces()
    .then((data) => {
      provinces.value = data || []
      if (provinces.value.length > 0 && !formData.provinceCode) {
        return fetchCityList(provinces.value[0].code)
      }
      return Promise.resolve()
    })
    .catch((error) => {
      console.error('获取省份列表失败:', error)
      uni.showToast({ title: '获取省份列表失败', icon: 'none' })
    })
}

function fetchCityList(provinceCode) {
  return fetchCities(provinceCode)
    .then((data) => {
      cities.value = data || []
      if (cities.value.length > 0 && !formData.cityCode) {
        return fetchDistrictList(cities.value[0].code)
      }
      if (cities.value.length === 0) {
        districts.value = []
      }
      return Promise.resolve()
    })
    .catch((error) => {
      console.error('获取城市列表失败:', error)
      uni.showToast({ title: '获取城市列表失败', icon: 'none' })
    })
}

function fetchDistrictList(cityCode) {
  return fetchDistricts(cityCode)
    .then((data) => {
      districts.value = data || []
    })
    .catch((error) => {
      console.error('获取区县列表失败:', error)
      uni.showToast({ title: '获取区县列表失败', icon: 'none' })
    })
}

async function syncPickerByFormData() {
  if (!formData.provinceCode) {
    return
  }

  const provinceIndex = provinces.value.findIndex((item) => item.code === formData.provinceCode)
  if (provinceIndex > -1) {
    pickerValue.value[0] = provinceIndex
    await fetchCityList(formData.provinceCode)
  }

  const cityIndex = cities.value.findIndex((item) => item.code === formData.cityCode)
  if (cityIndex > -1) {
    pickerValue.value[1] = cityIndex
    await fetchDistrictList(formData.cityCode)
  }

  const districtIndex = districts.value.findIndex((item) => item.code === formData.districtCode)
  if (districtIndex > -1) {
    pickerValue.value[2] = districtIndex
  }
}

async function pickerChange(event) {
  const value = [...event.detail.value]
  const oldValue = [...pickerValue.value]
  pickerValue.value = value

  const province = provinces.value[value[0]]
  if (!province) {
    return
  }

  tempRegion.provinceCode = province.code
  tempRegion.provinceName = province.name

  if (oldValue[0] !== value[0]) {
    pickerValue.value = [value[0], 0, 0]
    await fetchCityList(province.code)
  }

  const city = cities.value[pickerValue.value[1]]
  if (!city) {
    return
  }

  tempRegion.cityCode = city.code
  tempRegion.cityName = city.name

  if (oldValue[1] !== pickerValue.value[1]) {
    pickerValue.value = [pickerValue.value[0], pickerValue.value[1], 0]
    await fetchDistrictList(city.code)
  }

  const district = districts.value[pickerValue.value[2]]
  if (district) {
    tempRegion.districtCode = district.code
    tempRegion.districtName = district.name
  }
}

function confirmRegion() {
  Object.assign(formData, {
    provinceCode: tempRegion.provinceCode,
    provinceName: tempRegion.provinceName,
    cityCode: tempRegion.cityCode,
    cityName: tempRegion.cityName,
    districtCode: tempRegion.districtCode,
    districtName: tempRegion.districtName
  })
  hideRegionPicker()
}

onLoad(async (options = {}) => {
  await fetchProvinceList()
  if (options.id) {
    isEdit.value = true
    formData.id = options.id
    loadAddressDetail(options.id)
  }
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

	.address-edit {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	/* 表单内容 */
	.form-content {
		background-color: #fff;
		margin-top: 20rpx;
	}

	.form-item {
		display: flex;
		align-items: flex-start;
		padding: 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		transition: background-color 0.2s ease;
	}

	.form-item:active {
		background-color: #f8f8f8;
	}

	.label {
		width: 140rpx;
		font-size: 28rpx;
		color: #333;
		display: flex;
		align-items: center;
	}
	
	.required {
		color: #ff4757;
		margin-right: 5rpx;
		font-size: 32rpx;
	}

	.input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		padding: 15rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		background-color: #fafafa;
		transition: all 0.2s ease;
	}

	.input:focus {
		border-color: #ff4757;
		background-color: #fff;
		outline: none;
	}

	.textarea {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		padding: 15rpx;
		height: 150rpx;
		resize: none;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		background-color: #fafafa;
		transition: all 0.2s ease;
	}

	.textarea:focus {
		border-color: #ff4757;
		background-color: #fff;
		outline: none;
	}

	.placeholder {
		color: #999;
		font-size: 28rpx;
	}

	.region-picker {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.region-text {
		font-size: 28rpx;
		color: #333;
	}

	.arrow-icon {
		font-size: 24rpx;
		color: #999;
	}

	.default-item {
		justify-content: space-between;
	}

	.switch-container {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}

	/* 地区选择器容器 */
	.picker-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background-color: #fff;
	}
	
	/* 选择器顶部操作栏 */
	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 80rpx;
		padding: 0 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.picker-header .cancel-btn {
		font-size: 32rpx;
		color: #666;
	}
	
	.picker-header .confirm-btn {
		font-size: 32rpx;
		color: #ff4757;
		font-weight: bold;
	}
	
	/* 选择器内容 */
	.picker-view {
		height: 500rpx;
		background-color: #fff;
	}

	.picker-item {
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		font-size: 28rpx;
	}

	.picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
	}
	
	/* 底部保存按钮 */
	.bottom-save-bar {
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
		z-index: 100;
	}
	
	.save-btn {
		width: 90%;
		height: 70rpx;
		line-height: 70rpx;
		background-color: #ff4757;
		color: #fff;
		border-radius: 35rpx;
		font-size: 30rpx;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.3);
	}
	
	.save-btn:active {
		transform: scale(0.98);
		background-color: #ff3747;
	}
</style>
