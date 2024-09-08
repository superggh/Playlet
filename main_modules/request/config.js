import store from '@/store/index.js'
// 接口报错提示处理
export const errorMessage = (res) => {
	const {
		data
	} = res
	if (data.code && data.code != 200) {
		let str = ''
		if (data.msg) {
			str = data.msg
		} else {
			str = 'error request!'
		}
	 
	}
}