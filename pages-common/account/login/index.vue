<template>
	<view class="page">
		<m-scroll-y :isLoading="false" :isCustomRefresh="false" :scrollStyle="scrollStyle">
			<m-navbar isFixed :borderBottom="false"></m-navbar>
			<view class="d-flex a-center  flex-column h-100">
				<u-image width="100vw" height="276rpx" src="/static/img/common/login-t.png"></u-image>
				<u-image width="205.86rpx" height="218.94rpx" src="/static/img/common/logo.png"></u-image>
				<view class="bottom mt-5">
					<u-input color="#fff" maxlength="50" placeholderStyle="{color: '#808080'}"
						:customStyle="{height: '110rpx', caretColor: '#fff'}" type="text" border="none"
						:placeholder="$t('邮箱')" v-model="query.account">
					</u-input>
				</view>
				<view class="bottom mt-5">
					<u-input color="#fff" maxlength="16" placeholderStyle="{color: '#808080'}"
						:customStyle="{height: '110rpx', caretColor: '#fff'}" type="password" border="none"
						:placeholder="$t('密码')" v-model="query.password">
					</u-input>
				</view>
				<view @click="submitLogin" class="mt-5 flex-shrink btons d-flex a-center j-center text-white">
					{{$t('立即登录')}}
				</view>
				<view class="notice mt-3 text-center"
					@click="$tools.Navigate.redirectTo('/pages-common/account/register/index')">
					{{$t('注册账号 ->')}}
				</view>
				<u-image class="mt-auto" width="100vw" height="426rpx" src="/static/img/common/login-b.png"></u-image>
			</view>
		</m-scroll-y>
	</view>
</template>

<script>
	import {
		login
	} from '@/utils/request/api/post.js'
	export default {
		data() {
			return {
				query: {
					account: '',
					password: '',
				},
				id: 0
			}
		},
		onLoad(options) {
			if (!this.$check.isEmptyObject(options)) {
				this.query.account = this.$tools.Navigate.receivePageData(options).account
			}
		},
		methods: {
			// 登录
			submitLogin() {
				let that = this
				if (!this.query.account) {
					return uni.showToast({
						icon: 'none',
						title: this.$t('请输入邮箱')
					})
				}
				if (!this.$check.isEmail(this.query.account)) {
					return uni.showToast({
						icon: 'none',
						title: this.$t('邮箱格式不正确')
					})
				}
				if (!this.query.password) {
					return uni.showToast({
						icon: 'none',
						title: this.$t('请输入密码')
					})
				}
				let obj = {}
				obj = this.query

				this.$getapi("Dj/login", obj, true).then(res => {
					if (res.code == 0) {
						uni.showToast({
							icon: 'none',
							title: this.$t('登录成功'),
							success() {
								that.$tools.Navigate.switchTab('/pages/tabbar/theater/index')
								uni.setStorageSync('uid', res.data.uid)
								uni.setStorageSync('token', res.data.token)
								uni.setStorageSync('email', res.data.email)
							}
						})

					}
				});

			}
		},
		computed: {
			scrollStyle() {
				return {
					height: `calc(100vh - env(safe-area-inset-bottom) - ${this.$store.state.browserFitHeight}px)`
				}
			}
		},
	}
</script>

<style lang="scss" scoped>
	.page {

		.bottom {
			width: 630rpx;
			background-color: transparent;
			border-radius: 20rpx;
			border: 2rpx solid #EE7623;
			padding: 0 30rpx;

			.code {
				border-radius: 20rpx;
			}

			.code:active {
				background-color: #f2729980;
			}
		}

		.btons {
			font-size: 30rpx;
			border-radius: 20rpx;
			height: 110rpx;
			width: 630rpx;
			background: #EE7623;
		}

		.btons:active {
			background: #EE762380;
		}

		.notice {
			font-size: 24rpx;
			color: #999;
			text-decoration: underline;
		}
	}
</style>