// WebSocket 管理工具
import { getToken } from './auth.js';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.heartbeatInterval = null;
    this.reconnectInterval = null;
    this.isConnected = false;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatIntervalTime = 30000; // 30秒
    this.reconnectDelay = 3000; // 3秒
    this.url = 'ws://192.168.31.61:8080/ws/ns/default';
    this.messageHandlers = {};
    this.isWechatMiniProgram = typeof wx !== 'undefined' && typeof wx.connectSocket !== 'undefined';
  }

  // 初始化 WebSocket 连接
  init() {
    const token = getToken();
    if (!token) {
      console.log('WebSocket: 未登录，无法连接');
      return;
    }

    // 构建 WebSocket URL，携带 token 参数
    const wsUrl = `${this.url}?token=${token}`;

    try {
      if (this.isWechatMiniProgram) {
        // 在微信小程序环境中使用 wx.connectSocket
        this.initWechatWebSocket(wsUrl);
      } else {
        // 在浏览器环境中使用标准 WebSocket
        this.initBrowserWebSocket(wsUrl);
      }
    } catch (error) {
      console.error('WebSocket: 创建连接失败', error);
      this.attemptReconnect();
    }
  }

  // 初始化浏览器环境中的 WebSocket 连接
  initBrowserWebSocket(wsUrl) {
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket: 连接成功');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('WebSocket: 解析消息失败', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket: 错误', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket: 连接关闭');
      this.isConnected = false;
      this.stopHeartbeat();
      this.attemptReconnect();
    };
  }

  // 初始化微信小程序环境中的 WebSocket 连接
  initWechatWebSocket(wsUrl) {
    // 关闭之前的连接
    if (this.ws) {
      wx.closeSocket();
      this.ws = null;
    }

    // 连接 WebSocket
    wx.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket: 连接请求发送成功');
      },
      fail: (error) => {
        console.error('WebSocket: 连接请求发送失败', error);
        this.attemptReconnect();
      }
    });

    // 监听 WebSocket 连接打开事件
    wx.onSocketOpen(() => {
      console.log('WebSocket: 连接成功');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      this.startHeartbeat();
    });

    // 监听 WebSocket 接收到服务器的消息事件
    wx.onSocketMessage((res) => {
      try {
        const message = JSON.parse(res.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('WebSocket: 解析消息失败', error);
      }
    });

    // 监听 WebSocket 错误事件
    wx.onSocketError((error) => {
      console.error('WebSocket: 错误', error);
    });

    // 监听 WebSocket 连接关闭事件
    wx.onSocketClose(() => {
      console.log('WebSocket: 连接关闭');
      this.isConnected = false;
      this.stopHeartbeat();
      this.attemptReconnect();
    });

    // 保存连接状态
    this.ws = { isWechatSocket: true };
  }

  // 处理接收到的消息
  handleMessage(message) {
    const { category, command } = message;
    console.log('WebSocket: 收到消息', message);

    // 处理心跳响应
    if (category === 'heartbeat' && command === 'pong') {
      console.log('WebSocket: 收到心跳响应:', message);
      return;
    }

    // 处理其他消息
    const handlerKey = `${category}:${command}`;
    if (this.messageHandlers[handlerKey]) {
      this.messageHandlers[handlerKey](message);
    }
  }

  // 发送消息
  send(message) {
    if (!this.isConnected) {
      console.error('WebSocket: 连接未就绪，无法发送消息');
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      if (this.isWechatMiniProgram) {
        // 在微信小程序环境中使用 wx.sendSocketMessage
        try {
          wx.sendSocketMessage({
            data: messageStr,
            success: () => {
              console.log('WebSocket: 消息发送成功');
            },
            fail: (error) => {
              console.error('WebSocket: 发送消息失败', error);
            }
          });
          return true;
        } catch (wxError) {
          console.error('WebSocket: 微信小程序发送消息失败', wxError);
          return false;
        }
      } else {
        // 在浏览器环境中使用标准 WebSocket 的 send 方法
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(messageStr);
          return true;
        } else {
          console.error('WebSocket: 连接未就绪，无法发送消息');
          return false;
        }
      }
    } catch (error) {
      console.error('WebSocket: 发送消息失败', error);
      return false;
    }
  }

  // 启动心跳机制
  startHeartbeat() {
    this.stopHeartbeat();
    console.log('WebSocket: 启动心跳机制，每30秒发送一次心跳包');
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatIntervalTime);
  }

  // 停止心跳机制
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 发送心跳包
  sendHeartbeat() {
    const heartbeatMessage = {
      category: 'heartbeat',
      command: 'ping',
      payload: {}
    };
    console.log('WebSocket: 发送心跳包:', heartbeatMessage);
    this.send(heartbeatMessage);
  }

  // 尝试重连
  attemptReconnect() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('WebSocket: 未登录，停止重连');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`WebSocket: 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectInterval = setTimeout(() => {
      this.isReconnecting = false;
      this.init();
    }, this.reconnectDelay);
  }

  // 停止重连
  stopReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
  }

  // 关闭 WebSocket 连接
  close() {
    this.stopHeartbeat();
    this.stopReconnect();
    if (this.isWechatMiniProgram) {
      // 在微信小程序环境中使用 wx.closeSocket
      wx.closeSocket();
    } else if (this.ws) {
      // 在浏览器环境中使用标准 WebSocket 的 close 方法
      this.ws.close();
    }
    this.ws = null;
    this.isConnected = false;
    console.log('WebSocket: 连接已关闭');
  }

  // 注册消息处理器
  on(category, command, callback) {
    const handlerKey = `${category}:${command}`;
    this.messageHandlers[handlerKey] = callback;
  }

  // 移除消息处理器
  off(category, command) {
    const handlerKey = `${category}:${command}`;
    delete this.messageHandlers[handlerKey];
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected;
  }
}

// 导出单例
const wsManager = new WebSocketManager();
export default wsManager;