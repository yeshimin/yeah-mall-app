// 认证相关工具函数

/**
 * 解析JWT token获取payload
 * @param {string} token JWT token
 * @returns {object|null} 解析后的payload对象
 */
function parseJwt(token) {
	try {
		const base64Url = token.split('.')[1]
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
		}).join(''))
		
		return JSON.parse(jsonPayload)
	} catch (error) {
		console.error('解析JWT token失败', error)
		return null
	}
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated() {
	const token = uni.getStorageSync('token')
	return !!token
}

/**
 * 获取用户ID
 * @returns {string|null} 用户ID
 */
export function getUserId() {
	// 首先尝试从本地存储获取userId
	let userId = uni.getStorageSync('userId')
	if (userId) {
		return userId
	}
	
	// 如果本地存储中没有userId，尝试从token中解析
	const token = uni.getStorageSync('token')
	if (token) {
		const payload = parseJwt(token)
		if (payload && payload.aud) {
			// 保存userId到本地存储以便下次直接获取
			uni.setStorageSync('userId', payload.aud)
			return payload.aud
		}
	}
	
	return null
}

/**
 * 获取认证token
 * @returns {string|null} 认证token
 */
export function getToken() {
	return uni.getStorageSync('token') || null
}

/**
 * 清除认证信息
 */
export function clearAuthInfo() {
	uni.removeStorageSync('token')
	uni.removeStorageSync('userId')
}

/**
 * 处理认证失败
 * @param {Function} callback 回调函数
 */
export function handleAuthFailure(callback) {
	// 清除本地认证信息
	clearAuthInfo()
	
	// 显示提示信息
	uni.showToast({
		title: '请先登录',
		icon: 'none'
	})
	
	// 跳转到登录页面
	setTimeout(() => {
		uni.navigateTo({
			url: '/pages/login/index'
		})
	}, 1000)
	
	// 执行回调函数（如果提供）
	if (typeof callback === 'function') {
		callback()
	}
}

/**
 * 发送带认证的请求
 * @param {Object} options 请求选项
 * @param {Function} successCallback 成功回调
 * @param {Function} errorCallback 错误回调
 */
export function authRequest(options, successCallback, errorCallback) {
	// 添加认证头
	const token = getToken()
	if (token) {
		options.header = options.header || {}
		options.header['Authorization'] = `Bearer ${token}`
	}
	
	// 发送请求
	uni.request({
		...options,
		success: (res) => {
			// 检查认证失败
			if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
				handleAuthFailure()
				if (typeof errorCallback === 'function') {
					errorCallback(res)
				}
				return
			}
			
			// 调用成功回调
			if (typeof successCallback === 'function') {
				successCallback(res)
			}
		},
		fail: (err) => {
			// 调用错误回调
			if (typeof errorCallback === 'function') {
				errorCallback(err)
			}
		}
	})
}

export default {
	isAuthenticated,
	getUserId,
	getToken,
	clearAuthInfo,
	handleAuthFailure,
	authRequest
}