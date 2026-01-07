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
export const genPayInfo = (orderNo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/genPayInfo`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        orderNo: orderNo
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
export const fetchPaymentInfo = (orderNo) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_API}/app/order/genPayInfo`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        orderNo: orderNo
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

// 查询订单支付结果接口
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
export const fetchOrderList = (aggreStatus, page = 1, size = 10) => {
  return new Promise((resolve, reject) => {
    const params = {
      'conditions_': 'createTime:sort:desc'
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
