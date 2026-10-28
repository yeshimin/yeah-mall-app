<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import wsManager from '@/utils/websocket.js'

function ensureRealtimeConnection() {
  if (uni.getStorageSync('token') && !wsManager.getConnectionStatus()) {
    wsManager.init()
  }
}

onLaunch(() => {
  // 刷新或冷启动恢复登录态后，立即恢复客服长连接。
  ensureRealtimeConnection()
})

onShow(() => {
  // 从后台回到前台时检查连接，系统回收连接后可自动恢复。
  ensureRealtimeConnection()
})

</script>

<style>
	/*每个页面公共css */
	/* 禁用所有滚动条 */
	::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none;
		background: transparent;
	}
	
	/* 页面容器样式 */
	page {
		height: 100%;
		--ym-ink: #17251f;
		--ym-ink-secondary: #30423a;
		--ym-brand: #24634f;
		--ym-brand-strong: #174b3b;
		--ym-brand-soft: #e8f2ed;
		--ym-price: #be412b;
		--ym-price-soft: #f9ebe7;
		--ym-paper: #f4f6f3;
		--ym-surface: #ffffff;
		--ym-line: #dce4de;
		--ym-line-strong: #c8d4cc;
		--ym-muted: #65726a;
		--ym-muted-light: #6b776f;
		--ym-warning: #986019;
		--ym-danger: #b6403a;
		--ym-surface-subtle: #f8faf8;
		--ym-radius-card: 24rpx;
		--ym-radius-control: 16rpx;
		--ym-shadow-card: 0 8rpx 24rpx rgba(18, 38, 29, 0.06);
		color: var(--ym-ink);
		background-color: var(--ym-paper);
	}

	/* 设置页面根元素的样式 */
	uni-page-body {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: var(--ym-paper);
	}
	
	/* 设置页面主要内容区域的样式 */
	.page-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		height: 100%;
	}
	
	/* 设置固定定位元素的基准 */
	.fixed-bottom {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 100;
		background-color: #fff;
	}

	button {
		box-sizing: border-box;
	}

	button::after {
		border: 0;
	}

	/*
	 * App 内的卡片、图标和操作文本不需要被选中。统一关闭长按选择、
	 * H5 系统呼出菜单和点击高亮，避免每个页面重复处理。
	 */
	view,
	text,
	image,
	button,
	uni-view,
	uni-text,
	uni-image,
	uni-button {
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		user-select: none;
	}

	image,
	uni-image {
		background-color: #edf1ee;
		-webkit-user-drag: none;
	}

	input,
	textarea {
		box-sizing: border-box;
		color: var(--ym-ink-secondary);
	}

	/* 输入与富文本内容保留光标、选择和复制能力。 */
	input,
	textarea,
	rich-text,
	uni-input,
	uni-textarea,
	uni-rich-text {
		-webkit-touch-callout: default;
		-webkit-user-select: text;
		user-select: text;
	}
</style>
