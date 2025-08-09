<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
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
	}
	
	/* 设置页面根元素的样式 */
	uni-page-body {
		height: 100%;
		display: flex;
		flex-direction: column;
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
</style>
