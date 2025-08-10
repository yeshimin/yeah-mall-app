// utils/api.js

// Function to fetch product category tree
export const fetchProductCategoryTree = () => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://localhost:8080/app/productCategory/tree',
      method: 'GET',
      header: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxIiwiaWF0IjoxNzU0ODMxOTI0LCJzdWIiOiJhcHAiLCJ0ZXJtIjoiYXBwIiwiaWF0TXMiOjE3NTQ4MzE5MjQ5NjksImV4cE1zIjoxNzU0ODM1NTI0OTY5fQ.T5UGHYy6ThASbwIae6aM1tJue15rJaAFnyXI945UhSk',
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