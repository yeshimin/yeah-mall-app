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
		overflow: hidden;
	}
	
	/* 设置页面根元素的样式 */
	uni-page-body {
		height: 100%;
		overflow: hidden;
	}
</style>
