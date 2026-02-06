// utils/api.js
import { getToken, handleAuthFailure } from './auth.js';
import { BASE_API } from './config.js';

// Function to fetch product category tree
export const fetchProductCategoryTree = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/productCategory/tree`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || 'Failed to fetch category data'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 生成支付信息接口
export const genPayInfo = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/genPayInfo`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        orderId: orderId
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '生成支付信息失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 获取支付信息接口（与genPayInfo功能相同，用于兼容旧代码）
export const fetchPaymentInfo = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/genPayInfo`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        orderId: orderId
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '获取支付信息失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询订单支付结果接口（用于支付状态轮询）
export const queryPayOrderInfo = (orderNo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/queryPayOrderInfo?orderNo=${orderNo}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询订单支付结果失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询支付结果接口（新的接口，使用不同的URL）
export const queryPayResult = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/queryPayResult?orderId=${orderId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询支付结果失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to fetch cart items
export const fetchCartItems = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/cartItem/query`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || 'Failed to fetch cart data'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to fetch order preview data
export const fetchOrderPreview = (items) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/preview`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        items: items
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || 'Failed to fetch order preview data'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to submit order
export const submitOrder = (data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/submit`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: data,
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || 'Failed to submit order'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to update cart item quantity
export const updateCartItemQuantity = (id, quantity) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/cartItem/update`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        id: id,
        quantity: quantity
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || 'Failed to update cart item quantity'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to delete cart items
export const deleteCartItems = (ids) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/cartItem/delete`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: ids,
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || 'Failed to delete cart items'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to fetch personal order counts
export const fetchOrderCounts = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/count`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || 'Failed to fetch order counts'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// Function to fetch order list
export const fetchOrderList = (aggreStatus, page = 1, size = 10, conditions = '') => {
  return new Promise((resolve, reject) => {
    // 构建conditions_参数
    let conditionsParam = 'createTime:sort:desc';
    if (conditions) {
      conditionsParam = `${conditions};${conditionsParam}`;
    }
    
    const params = {
      'conditions_': conditionsParam
    };
    
    // 如果指定了聚合状态，则添加到参数中
    if (aggreStatus && aggreStatus !== 0) {
      params.aggreStatus = aggreStatus;
    }
    
    // 添加分页参数
    params.current = page;
    params.size = size;
    
    uni.request({
      url: `${BASE_API}/app/order/query`,
      method: 'GET',
      data: params,
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || 'Failed to fetch order list'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 地址相关API接口
// 创建地址
export const createAddress = (addressData) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/memberAddress/create`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: addressData,
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '创建地址失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询地址列表
export const queryAddressList = (params) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/memberAddress/query`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: params,
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询地址列表失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 获取地址详情
export const getAddressDetail = (id) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/memberAddress/detail?id=${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '获取地址详情失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 更新地址
export const updateAddress = (addressData) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/memberAddress/update`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: addressData,
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '更新地址失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 删除地址
export const deleteAddress = (id) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/memberAddress/delete`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: { id },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '删除地址失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询省份列表
export const fetchProvinces = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/area/province/query`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询省份列表失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询城市列表
export const fetchCities = (provinceCode) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/area/city/query?provinceCode=${provinceCode}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询城市列表失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询区县列表
export const fetchDistricts = (cityCode) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/area/district/query?cityCode=${cityCode}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询区县列表失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 确认收货
export const confirmReceive = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/confirmReceive`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        orderId: orderId
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '确认收货失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 取消订单
export const cancelOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/cancel`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        id: orderId
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '取消订单失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 申请退款
export const applyRefund = (orderId, reason) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/applyRefund`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        orderId: orderId,
        reason: reason
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '申请退款失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 获取订单详情
export const fetchOrderDetail = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/detail?orderId=${orderId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '获取订单详情失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 查询物流信息
export const queryTracking = (orderId) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/queryTracking?orderId=${orderId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '查询物流信息失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 提交评价
export const submitReview = (data) => {
  return new Promise((resolve, reject) => {
    // 构建请求数据
    const requestData = {
      orderId: data.orderId,
      descriptionRating: data.descriptionRating,
      deliveryRating: data.deliveryRating,
      serviceRating: data.serviceRating,
      isAnonymous: data.isAnonymous,
      items: data.items
    };
    
    console.log('提交评价数据:', requestData);
    
    uni.request({
      url: `${BASE_API}/app/review/publish`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: (res) => {
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || '评价失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 上传图片
export const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_API}/app/storage/upload`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${getToken()}`
      },
      success: (res) => {
        if (res.statusCode === 401 || (JSON.parse(res.data) && JSON.parse(res.data).code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200) {
          const response = JSON.parse(res.data);
          if (response.code === 0) {
            // 返回fileKey值
            resolve(response.data.fileKey);
          } else {
            reject(new Error(response.message || '上传失败'));
          }
        } else {
          reject(new Error('上传失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 获取商品评价列表
export const fetchProductReviews = (productId, params) => {
  return new Promise((resolve, reject) => {
    // 模拟评价列表数据
    const mockReviews = [
      {
        id: 1,
        userId: 101,
        userName: '用户8888',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        rate: 5, // 综合评分
        content: '非常好的商品，物流很快，包装也很严实，值得购买！',
        images: [
           'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop',
           'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=300&auto=format&fit=crop'
        ],
        skuInfo: '颜色:红色;尺码:M',
        createTime: '2023-10-25 14:30:00',
        reply: '感谢您的支持，我们会继续努力！'
      },
      {
        id: 2,
        userId: 102,
        userName: '匿名用户',
        userAvatar: '', // 匿名默认头像
        rate: 4,
        content: '总体不错，就是稍微有点色差，不过可以接受。',
        images: [],
        skuInfo: '颜色:蓝色;尺码:L',
        createTime: '2023-10-24 09:15:00',
        reply: ''
      },
       {
        id: 3,
        userId: 103,
        userName: '小***猫',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
        rate: 5,
        content: '回购好几次了，一如既往的好，强烈推荐！',
        images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=300&auto=format&fit=crop'],
        skuInfo: '颜色:红色;尺码:S',
        createTime: '2023-10-20 18:20:00',
        reply: ''
      }
    ];
    
    setTimeout(() => {
        resolve({
            total: 100,
            list: mockReviews,
            goodRate: 98 // 好评率
        });
    }, 500);

    // 实际对接后端时请解开以下代码
    /*
    uni.request({
      url: `${BASE_API}/app/product/review/list?productId=${productId}`,
      method: 'GET',
      data: params,
      // ...
    });
    */
  });
};

// 获取商品评价概览（用于详情页展示）
export const fetchReviewSummary = (productId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalCount: 128,
                goodRate: 98,
                topReviews: [
                     {
                        id: 1,
                        userName: '用户8888',
                        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                        rate: 5,
                        content: '非常好的商品，物流很快，包装也很严实，值得购买！',
                         createTime: '2023-10-25'
                     }
                ]
            });
        }, 300);
    });
};

// 获取用户信息
export const fetchUserDetail = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/member/detail`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '获取用户信息失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 更新个人信息
export const updateProfile = (data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/member/updateProfile`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: data,
      success: (res) => {
        // 全局认证失败处理
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          handleAuthFailure();
          reject(new Error('AUTH_401'));
          return;
        }
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '更新个人信息失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};