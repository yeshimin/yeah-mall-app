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

<script>
	import { createAddress, updateAddress, getAddressDetail, fetchProvinces, fetchCities, fetchDistricts } from '../../utils/api.js';
	
	export default {
		data() {
			return {
				// 表单数据
				formData: {
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
				},
				// 是否为编辑模式
				isEdit: false,
				// 地区选择器
			showPicker: false,
			pickerValue: [0, 0, 0],
			// 地区数据
			provinces: [],
			cities: [],
			districts: [],
			// 临时存储选择的地区，点击确认后才更新到表单
			tempRegion: {
				provinceCode: '',
				provinceName: '',
				cityCode: '',
				cityName: '',
				districtCode: '',
				districtName: ''
			},
			};
		},
		onLoad(options) {
			// 初始化省份数据
			this.fetchProvinceList();
			
			// 检查是否为编辑模式
			if (options.id) {
				this.isEdit = true;
				this.formData.id = options.id;
				// 加载地址详情
				this.loadAddressDetail(options.id);
			}
		},
		methods: {
			// 处理switch变化
			onSwitchChange(e) {
				this.formData.isDefault = e.detail.value;
			},
			
			// 加载地址详情
			loadAddressDetail(id) {
				getAddressDetail(id)
					.then(data => {
						this.formData = {
							id: data.id,
							name: data.name,
							contact: data.contact,
							provinceCode: data.provinceCode,
							provinceName: data.provinceName,
							cityCode: data.cityCode,
							cityName: data.cityName,
							districtCode: data.districtCode,
							districtName: data.districtName,
							detailAddress: data.detailAddress,
							postalCode: data.postalCode,
							isDefault: data.isDefault
						};
					})
					.catch(error => {
						console.error('获取地址详情失败:', error);
						uni.showToast({
							title: '获取地址详情失败',
							icon: 'none'
						});
					});
			},
			
			// 保存地址
			saveAddress() {
				// 表单验证
				if (!this.formData.name) {
					uni.showToast({
						title: '请输入收货人姓名',
						icon: 'none'
					});
					return;
				}
				
				if (!this.formData.contact || !/^1[3-9]\d{9}$/.test(this.formData.contact)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}
				
				if (!this.formData.provinceCode || !this.formData.cityCode || !this.formData.districtCode) {
					uni.showToast({
						title: '请选择所在地区',
						icon: 'none'
					});
					return;
				}
				
				if (!this.formData.detailAddress) {
					uni.showToast({
						title: '请输入详细地址',
						icon: 'none'
					});
					return;
				}
				
				// 提交数据
				const addressData = { ...this.formData };
				
				if (this.isEdit) {
					// 更新地址
					updateAddress(addressData)
						.then(() => {
							uni.showToast({
								title: '更新地址成功',
								icon: 'success'
							});
							// 返回上一页
							uni.navigateBack();
						})
						.catch(error => {
							console.error('更新地址失败:', error);
							uni.showToast({
								title: error.message || '更新地址失败',
								icon: 'none'
							});
						});
				} else {
					// 创建地址
					createAddress(addressData)
						.then(() => {
							uni.showToast({
								title: '添加地址成功',
								icon: 'success'
							});
							// 返回上一页
							uni.navigateBack();
						})
						.catch(error => {
							console.error('添加地址失败:', error);
							uni.showToast({
								title: error.message || '添加地址失败',
								icon: 'none'
							});
						});
				}
			},
			
			// 显示地区选择器
			showRegionPicker() {
				// 初始化临时地区数据为当前表单值
				this.tempRegion = {
					provinceCode: this.formData.provinceCode,
					provinceName: this.formData.provinceName,
					cityCode: this.formData.cityCode,
					cityName: this.formData.cityName,
					districtCode: this.formData.districtCode,
					districtName: this.formData.districtName
				};
				this.showPicker = true;
			},
			
			// 隐藏地区选择器
			hideRegionPicker() {
				this.showPicker = false;
			},
			
			// 获取省份列表
			fetchProvinceList() {
				fetchProvinces()
					.then(data => {
						this.provinces = data;
						// 默认选中第一个省份，获取对应城市
						if (data && data.length > 0) {
							this.fetchCityList(data[0].code);
						}
					})
					.catch(error => {
						console.error('获取省份列表失败:', error);
						uni.showToast({
							title: '获取省份列表失败',
							icon: 'none'
						});
					});
			},
			
			// 获取城市列表
			fetchCityList(provinceCode) {
				fetchCities(provinceCode)
					.then(data => {
						this.cities = data;
						// 默认选中第一个城市，获取对应区县
						if (data && data.length > 0) {
							this.fetchDistrictList(data[0].code);
						} else {
							this.districts = [];
						}
					})
					.catch(error => {
						console.error('获取城市列表失败:', error);
						uni.showToast({
							title: '获取城市列表失败',
							icon: 'none'
						});
					});
			},
			
			// 获取区县列表
			fetchDistrictList(cityCode) {
				fetchDistricts(cityCode)
					.then(data => {
						this.districts = data;
					})
					.catch(error => {
						console.error('获取区县列表失败:', error);
						uni.showToast({
							title: '获取区县列表失败',
							icon: 'none'
						});
					});
			},
			
			// 地区选择器变化
			pickerChange(e) {
				const value = e.detail.value;
				const oldValue = this.pickerValue;
				this.pickerValue = value;
				
				// 更新选中的省份到临时变量
				const province = this.provinces[value[0]];
				if (province) {
					this.tempRegion.provinceCode = province.code;
					this.tempRegion.provinceName = province.name;
					
					// 如果省份变化，重新加载城市列表
					if (oldValue[0] !== value[0]) {
						this.pickerValue[1] = 0; // 重置城市选择
						this.pickerValue[2] = 0; // 重置区县选择
						this.fetchCityList(province.code);
						return; // 等待城市列表加载完成后再更新
					}
					
					// 更新选中的城市到临时变量
					const city = this.cities[value[1]];
					if (city) {
						this.tempRegion.cityCode = city.code;
						this.tempRegion.cityName = city.name;
						
						// 如果城市变化，重新加载区县列表
						if (oldValue[1] !== value[1]) {
							this.pickerValue[2] = 0; // 重置区县选择
							this.fetchDistrictList(city.code);
							return; // 等待区县列表加载完成后再更新
						}
						
						// 更新选中的区县到临时变量
						const district = this.districts[value[2]];
						if (district) {
							this.tempRegion.districtCode = district.code;
							this.tempRegion.districtName = district.name;
						}
					}
				}
			},
			
			// 确认选中的地区
			confirmRegion() {
				// 将临时选择的地区更新到表单数据
				this.formData.provinceCode = this.tempRegion.provinceCode;
				this.formData.provinceName = this.tempRegion.provinceName;
				this.formData.cityCode = this.tempRegion.cityCode;
				this.formData.cityName = this.tempRegion.cityName;
				this.formData.districtCode = this.tempRegion.districtCode;
				this.formData.districtName = this.tempRegion.districtName;
				
				// 隐藏选择器
				this.hideRegionPicker();
			}
		}
	};
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
