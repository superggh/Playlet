<template>
	<view class="page">
		<!-- 顶部信息 -->
		<m-navbar i18n :borderBottom="false" value="page.充值"></m-navbar>
		<m-scroll-y :isLoading="false" :isCustomRefresh="false" :scrollStyle="scrollStyle">
			<view class="content p-3">
				<view class="title pl-5 d-flex flex-column j-center">
					<view class="title-text text-white font-weight">
						{{$t('当前余额')}}
					</view>
					<view class="d-flex a-center">
						<u-image width="36rpx" height="36rpx" src="/static/img/my/icon.png"></u-image>
						<span class="ml-1 text-white font-weight font-lg">{{userinfo.balance}}</span>
					</view>
				</view>
				<view class="d-flex a-center j-sb mt-2"
					@click="$tools.Navigate.navigateTo('/pages-common/balance-detail/index')">
					<span class="text-white">{{$t('余额明细')}}</span>
					<u-icon name="arrow-right" color="#ddd" size="18"></u-icon>
				</view>
				<view class="recharge mt-5">
					<view class="recharge-title d-flex a-center">
						<u-image width="40rpx" height="40rpx" src="/static/img/my/re-icon.png"></u-image>
						<view class="line-h text-white ml-1">
							{{$t('余额充值')}}
						</view>
					</view>
					<view class="list d-flex flex-wrap a-center">
						<view @click="changeRecharge(i)" :class="rechargeCurrent == i ? 'active' : ''"
							class="item mt-2 hidden d-flex flex-column" v-for="(item, i) in rechargeList" :key="i">
							<view class="item-t d-flex a-center j-center">
								<u-image width="50rpx" height="50rpx" src="/static/img/my/re-coin.png"></u-image>
								<view class="item-coin ml-1">
									{{item.gold}}
								</view>
							</view>
							<view class="item-b d-flex a-center j-center"
								:class="rechargeCurrent == i ? 'bactive' : ''">
								<view class="item-price">
									{{$store.state.moneySymbol}}{{item.amount}}
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="bottom mt-3">
					<u-input fontSize="28rpx" @change="inputChange" color="#fff" maxlength="16"
						placeholderStyle="color: #808080;font-size: 28rpx;"
						:customStyle="{height: '110rpx', caretColor: '#fff'}" type="number" border="none"
						:placeholder="$t('输入自定义金额')" v-model="amount">
						<view slot="suffix" class="gold px-2">
							{{gold}} {{$t('金币')}}
						</view>
					</u-input>
				</view>

				<view class="notice mt-2">
					{{$t('充值说明')}}: 1{{$store.state.moneySymbol}}={{rate}}{{$t('金币')}}
				</view>
				<view class="notice d-flex a-center flex-column j-center mt-5">
					<span>Tips</span>
					<span class="text-center mt-1">{{tips}}</span>
				</view>
				<view class="w-100" style="height: 140rpx;"></view>
			</view>
		</m-scroll-y>
		<!-- 	<view class="bottombox position-fixed bottom-0 left-0 p-2 w-100">
			<u-button :hairline="false" loadingSize="16" :text="$t('付费')" :loading="req" @click="pay_with_paypal"
				class="btons d-flex a-center j-center">
			</u-button>
		</view> -->
		<u-toast ref="uToast"></u-toast>

		<view class=" d-flex j-center" style="z-index:9999">
			<div id="paypal-button"></div>

		</view>

		<!-- <script src="https://www.paypal.com/sdk/js?client-id=BAAWtTPwE6Wq45YE8yjnHjyFKmY44VRR84ZrlPe4NrjHmEVPT3YmiUyg2YcHldKIWGZ5-Ql4YR_9DKDOKs&components=hosted-buttons&disable-funding=venmo&currency=USD"></script> -->

	</view>
</template>

<script>
	import Vue from 'vue'


	import {
		getRechargeConfig
	} from '@/utils/request/api/get.js'
	import {
		rechargeGold
	} from '@/utils/request/api/post.js'

	export default {
		data() {
			return {
				paypalc: {
					sandbox: "AdFjcqGcUurgPE1b4jFP7VftDeHNUZQN1SWEefah-w-1CVwHjBTRfv8cQk9RuxOz1IWXDRMSQTt0H7wX",
					production: "AaxVwiNMF2lHBuj7Qyo1RayWbHbzdb7BmQckYCmd_zN0HXT_taif73-m2_3K4sRSNHdlLOnWdfjr7TUb",

				},
				userinfo: '',
				rechargeList: [],
				rechargeCurrent: 0,
				query: {
					amount: '1',
					code: 'paypal',
					return_url: window.location.origin + '/pages-common/pay/return',
					cancel_url: window.location.origin + '/pages-common/pay/cancel'
				},
				amount: '',
				gold: 0,
				rate: 0,
				tips: '',
				req: false
			}
		},
		components: {

		},
		onLoad() {
			this.$nextTick(() => {
				this.initPaypal()
			})
		},
		onShow() {
			this.init()

		},
		methods: {

			async initPaypal() {
				let obj = {}
				this.$getapi("Dj/makeOrder", obj).then(res => {
					if (res.code == 0) {
						let order_sn = res.data
						paypal.Button.render({
							env: 'sandbox',
							client: {
								sandbox: this.paypalc.sandbox,
								production: this.paypalc.production
							},

							locale: 'en_US',
							style: {
								size: 'large',
								color: 'gold',
								shape: 'pill',
							},

							commit: false,

							payment: (data, actions) => {
								console.log("payment", data)
								return actions.payment.create({
									transactions: [{
										amount: {
											total: this.query.amount,
											currency: 'USD'
										},
										custom: order_sn
									}]
								});
							},


							onAuthorize:  (data, actions)=> {
								console.log("onAuthorize", data, actions)
								return actions.payment.execute().then((res) => {
									console.log(res)
									let obj = {}
									obj.order_id = res.cart
									obj.order_sn = res.transactions[0].custom
									obj.payment_id = res.id
									obj.payer_id = res.payer.payer_info.payer_id
									obj.payer_email = res.payer.payer_info.email
									obj.first_name = res.payer.payer_info.first_name
									obj.last_name = res.payer.payer_info.last_name
									obj.middle_name = res.payer.payer_info.middle_name
									obj.total = res.transactions[0].amount.total
									obj.currency = res.transactions[0].amount.currency
									console.log(obj)

									this.$getapi("Dj/handleRecharge", obj).then(res => {
										if (res.code == 0) {
											uni.showToast({
												icon: 'none',
												title: this.$t('购买成功')
											})
											uni.navigateBack()
										}
									})

								});
							}
						}, '#paypal-button');

					}
				});




			},
			// 初始化
			init() {
				this.getRechargeList()
				this.getInfo()
			},
			// 获取充值列表
			getInfo() {
				let obj = {}
				this.$getapi("Dj/getMyInfo", obj).then(res => {
					if (res.code == 0) {
						this.userinfo = res.data
					}
				});


			},
			async getRechargeList() {
				let {
					code,
					data
				} = await getRechargeConfig()
				if (code == 0) {
					this.rate = data.rate
					this.tips = data.tips
					this.rechargeList = data.options
					this.query.amount = data.options[0].amount
				}
			},
			// 选择价格
			changeRecharge(i) {
				this.query.amount = this.rechargeList[i].amount
				this.rechargeCurrent = i

			},
			// 输入价格
			inputChange(e) {
				this.gold = e * this.rate
				this.query.amount = this.amount
			},
			// 支付
			async openPay() {
				this.req = true
				this.$refs.uToast.show({
					type: 'loading',
					message: "loading",
					duration: 60000
				})
				if (this.amount) {
					this.query.amount = this.amount
				}
				let {
					code,
					data
				} = await rechargeGold(this.query)
				if (code == 200) {
					this.$store.dispatch('getUserinfo')
					// #ifdef APP-PLUS
					plus.runtime.openURL(data.url)
					// #endif
					// #ifdef H5
					location.href = data.url
					// #endif
					this.$refs.uToast.hide()
					this.req = false
				} else {
					this.req = false
					this.$refs.uToast.hide()
				}
				let time = setTimeout(() => {
					this.req = false
					clearTimeout(time)
				}, 60000)
			}
		},
		computed: {
			scrollStyle() {
				return {
					height: `calc(100vh - env(safe-area-inset-bottom) - ${this.$store.state.statusHeight}px - ${this.$store.state.navbarHeight}px - ${this.$store.state.browserFitHeight}px)`
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		.content {

			.title {
				width: 100%;
				height: 212.15rpx;
				background: url('/static/img/my/re-card.png') no-repeat;
				background-size: cover;
			}

			.bottom {
				background-color: #28272C;
				border-radius: 20rpx;
				padding: 0 30rpx;

				.code {
					border-radius: 20rpx;
				}

				.code:active {
					background-color: #f2729980;
				}

				.gold {
					height: 100%;
					background-color: #333;
					color: #EE7623;
				}
			}

			.notice {
				font-size: 28rpx;
				font-weight: 400;
				color: #EE7623;
				line-height: 32rpx;
			}

			.recharge {

				.recharge-title {}

				.list {

					.item {
						width: 48.5%;
						background: #333;
						border-radius: 20rpx;
						margin-right: 3%;

						.item-t {
							height: 84rpx;

							.item-coin {
								color: #E8C78A;
								font-size: 40rpx;
							}
						}

						.item-b {
							background: #5B5B5B;
							height: 68rpx;

							.item-price {
								font-size: 32rpx;
								color: #191919;
							}
						}

						.bactive {
							background-color: #FF8C3C;
						}
					}

					.active {
						border: 4rpx solid #FF8C3C;

						.item-t {
							height: 80rpx;
						}

						.item-b {
							height: 64rpx;
						}
					}

					.item:nth-child(2n) {
						margin-right: 0 !important;
					}
				}
			}
		}

		.bottombox {
			background-color: #000000;

			.btons {
				height: 100rpx;
				background: #EE7623;
				color: #fff;
				border: none;
				border-radius: 16rpx;
			}
		}
	}
</style>