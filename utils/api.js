// utils/api.js
import { getToken } from './auth.js';
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
        // 统一处理认证失败
        if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
          reject(new Error('AUTH_401'))
          return
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