import {
	intercept
} from '@/main_modules/request'
import { errorMessage } from '@/main_modules/request/config.js'
/**
 * 响应拦截
 * @param {Object} http 
 */
import tools from '@/main_modules/tools/index.js'
module.exports = (vm) => {
	uni.$u.http.interceptors.response.use((response) => {
		/* 对响应成功做点什么 可使用async await 做异步操作*/
		console.log('response',response)
		if ((response.data && response.data.code == 400) || (response.data && response.data.code == 1)) {
			let msg = ''
			if (response.data.msg) msg = response.data.msg
			if (response.data.message) msg = response.data.message
			uni.showToast({
				icon: 'none',
				title: msg
			})
		}
		if (response.data && response.data.code == 401) {
			uni.clearStorageSync()
	 
			localStorage["_show_first"] = 1;
			setTimeout(() => {
				console.log('go login')
				tools.Navigate.navigateTo('/pages-common/account/login/index')
			}, 1000);
			return
		}
		errorMessage(response)
		// console.log(response)
		/* 返回成功数据 */
		return response.data || {}
	}, (response) => {
		
		/*  对响应错误做点什么 */
		errorMessage(response)
		// console.log(response)
		/* 返回错误数据 */
		return Promise.reject(response)
	})
}
