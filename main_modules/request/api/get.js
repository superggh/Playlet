import http from '../method.js'

// 获取系统配置
export const getSysConfig = (params, config = {}) => http.get('/sysConfig', params, config)

// 获取用户信息
export const getUserInfo = (params, config = {}) => http.post('/userInfo', params, config)

// 获取语言配置
export const getLangConfig = (params, config = {}) => http.get('/langConfig', params, config)
