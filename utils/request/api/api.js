import axios from "axios";
import md5 from "js-md5";

import tools from '@/main_modules/tools/index.js'
import {
	stringify
} from "qs";
export function getUrl() {
	return "https://api.angula.net/";
}
axios.defaults.retry = 3;
axios.defaults.retryDelay = 2000;

axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
	(res) => {
	 
		if (res.data.code == 400 || res.data.code == 1) {
			let msg = ''
			if (res.data.msg) msg = (res.data.msg);
			if (res.data.message) msg = (res.data.message);
			uni.showToast({
				icon: 'none',
				title: msg
			})
			uni.hideLoading();
		}
		if (res.data.code == 888) {
			localStorage.clear();
			uni.setStorageSync('_show_first',1)
			uni.setStorageSync('game_forbidden',1)
			window.location.href = "https://www.baidu.com";
			return;
		}
		if (res.data.code == 401) {
			uni.clearStorageSync()
			uni.setStorageSync('_show_first',1)
 
			setTimeout(() => {
				tools.Navigate.navigateTo('/pages-common/account/login/index')
			}, 1000);

		}
		return res; // data数据
	},
	(error) => {
		// 请求失败
		// Toast('网络异常' )
		let status = error.response
		if (status) {
			switch (status.status) {
				case 500:
					let msg = ''
					if (status.data.code == 1) {
						msg = status.data.message
					}
					uni.showToast({
						icon: 'none',
						title: '服务器异常:' + msg
					})

					break;
				default:
					// return Promise.reject(error)
					var config = error.config;
					config.retry = 3;
					config.retryDelay = 5000;
					// If config does not exist or the retry option is not set, reject
					if (!config || !config.retry) return Promise.reject(error);
					// Set the variable for keeping track of the retry count
					config.__retryCount = config.__retryCount || 0;
					// Check if we've maxed out the total number of retries
					if (config.__retryCount >= config.retry) {
						// Reject with the error
						return Promise.reject(error);
					}
					// Increase the retry count
					config.__retryCount += 1;
					// Create new promise to handle exponential backoff
					var backoff = new Promise(function(resolve) {
						setTimeout(function() {
							resolve();
						}, config.retryDelay || 1);
					});
					// Return the promise in which recalls axios to retry the request
					return backoff.then(function() {
						return axios(config);
					});
					break;
			}
		}

	}
);

function ksort(o) {
	let sorted = {},
		keys = Object.keys(o);
	keys.sort();
	keys.forEach((key) => {
		sorted[key] = o[key];
	});
	return sorted;
}


export function getData(url, data, showTast = false) {
	// console.log(white.white)
	// console.log(url, white.white.indexOf(url))
	try {
		if (localStorage["game_forbidden"]) {
			window.location.href = "https://www.baidu.com";
			return;
		}
	data.uid = uni.getStorageSync('uid') || ''
	data.token = uni.getStorageSync('token') || ''
	let str = uni.getStorageSync('lang')
    data.lang = str == 'zh-Hans' ? 'zh-cn' : (str == 'zh-Hant' ? 'zh-hk' : 'en')
	} catch (e) {
		console.log(e);
	}
	var timestamp = Date.parse(new Date()) / 1000;
	data.timestamp = timestamp;
	var WVS$1 = "\x70\x70";
	var Y$OXfB2 = "\x70\x70";
	var d3 = "\x70\x70" + "888";
	var str = WVS$1 + Y$OXfB2 + d3;
	data = ksort(data);
	// console.log('data',data)
	let dataStr = "";

	for (let key in data) {
		dataStr += data[key];
	}
	data.sign = md5(str + dataStr + timestamp);

	let postdata = {};
	// postdata.odata = data;
	// postdata.dataStr = dataStr;
	// let finalStr = JSON.stringify(data);
	// let aesStr = crypto.getAES(finalStr);
	// postdata.data = aesStr;
	postdata = data
	if (showTast) {
		uni.showLoading({
		    title: 'loading',
			mask:true
		});
	}


	return axios.post(url, stringify(postdata)).then((res) => {
		  if (showTast) {
			setTimeout(() => {
				uni.hideLoading();
			}, 1000);

		}

		return Promise.resolve(res.data);
	});
}

function get(urls, obj, showToast) {
	const url = getUrl() + urls;
	const data = obj;
	return getData(url, data, showToast);
}
export function getapi(api, obj, showToast = false) {
	return get(api, obj, showToast);
}