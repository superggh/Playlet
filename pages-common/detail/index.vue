<template>
	<view class="page" :style="scrollStyle">
		<yingbing-video :srt="srt" :barrage-show="barrages_show" :barrageConfig="barrageConfig" :barrages="barrages" autoplay
			ref="video" v-if="!$check.isEmptyObject(detail)" :style="scrollStyle" :poster="detail.list[current].img"
			:initialTime="initialTime" :src="detail.list[current].videourl ? detail.list[current].videourl : '123.mp4'"
			settings="playbackRate" @play="monitorPlay" @pause="monitorPause" @ended="ended" @timeupdate="timeupdate">
			<template #controls>
				<view style="position:absolute;top:0;left:0;right:0;">
					<m-navbar :borderBottom="false" bgColor="#00000080" :value="detail.list[current].name">
					</m-navbar>
				</view>
				<view class="position-absolute top-half left-half tf-half-xy text-white">
					<u-icon @click="$refs.video.play()" v-if="status == 0" name="play-right-fill" size="50"
						color="#ffffff80"></u-icon>
					<u-icon @click="$refs.video.pause()" v-else name="pause" size="50" color="#ffffff80"></u-icon>
				</view>
				<view class="d-flex a-center j-center flex-column" style="position:absolute;right:20rpx;bottom: 100px;">
					<view class="d-flex a-center j-center flex-column" @click.stop="openLike">
						<image style="width: 70rpx; height: 70rpx;"
							:src="`/static/img/common/${detail.love == 0 ? 'like' : 'like-active'}.png`"></image>
						<view class="font" :style="{color: detail.love == 0 ? '#fff': '#F73648'}">
							{{$t('点赞')}}
						</view>
					</view>
					<view class="d-flex a-center j-center flex-column mt-3" @click.stop="openCollect">
						<image style="width: 70rpx; height: 70rpx;"
							:src="`/static/img/common/${detail.collect == 0 ? 'collect' : 'collect-active'}.png`">
						</image>
						<view class="font" :style="{color: detail.collect == 0 ? '#fff': '#F8B33B'}">
							{{$t('追剧')}}
						</view>
					</view>
					<view class="d-flex a-center j-center flex-column mt-3" @click.stop="doshowComment">
						<image style="width: 70rpx; height: 70rpx;" src="/static/img/tabbar/theater-active.png"></image>
						<view class="font text-white">
							{{$t('评论')}}
						</view>
					</view>
					<view class="d-flex a-center j-center flex-column mt-3" @click.stop="selectEpisode">
						<image style="width: 70rpx; height: 70rpx;" src="/static/img/common/episode.png"></image>
						<view class="font text-white">
							{{$t('剧集')}}
						</view>
					</view>
			
				</view>
				<view class="text-white" style="position:absolute;left:20rpx;bottom: 100px;">
					<view class="text-ellipsis5" style="width: 500rpx;">
						{{detail.info.name}}
					</view>
					<view class="text-ellipsis5 mt-2" style="width: 500rpx;">
						{{detail.info.story}}
					</view>
					<!-- <view class="d-flex a-center" @click.stop="selectEpisode">
						<span class="text-white mr-1">{{$t('选择剧集')}}</span>
						<u-icon name="arrow-right" color="#fff" size="14"></u-icon>
					</view> -->
				</view>
			</template>
		</yingbing-video>

		<m-popup :show="show" i18n @close="showClose" title="选择剧集">
			<m-scroll-y :scrollTop="scrollTop" bgColor="#111" :isLoading="false" :scrollStyle="{height: '60vh',paddingBottom:'50px'}" :isCustomRefresh="false" @scroll="scroll">
				<view class="select w-100 d-flex flex-wrap p-3">
					<view @click="openVideo(i)" class="item hidden mt-2 d-flex flex-column position-relative"
						v-for="(item, i) in detail.list" :key="i">
						<u-image width="100%" height="120rpx" :src="item.img"></u-image>
						<view class="text-white p-2 line-h">
							{{item.name}}
						</view>
						<view v-if="current == i"
							class="position-absolute top-0 left-0 right-0 bottom-0 text-white d-flex a-center j-center"
							style="background-color: #00000090;">
							{{$t('当前播放')}}
						</view>
						<view v-if="item.is_play == 0"
							class="pay d-flex a-center j-center position-absolute top-0 right-0">
							<u-image width="26rpx" height="26rpx" src="/static/img/common/pay.png"></u-image>
							<view class="pay-name ml-1 font-weight">
								{{$t('付费')}}
							</view>
						</view>
					</view>
				</view>
			</m-scroll-y>
		</m-popup>

		<m-popup :show="showComment" i18n @close="showComment=false" :title="$t('评论')">
			<view class="d-flex flex-column p-5" style="background-color: #000;">

				<textarea auto-focus @confirm="doComment" :height="500" class="uni-textarea" :placeholder="$t('评论')"
					color="#fff" maxlength="100" v-model="comment" />


				<u-button :hairline="false" loadingSize="16" :text="$t('评论')" @click="doComment"
					class="btons d-flex a-center j-center mt-4">
				</u-button>
			</view>
		</m-popup>
		<!-- 购买剧集弹窗 -->
		<m-popup :show="payShow" i18n @close="payShowClose" title="购买剧集">
			<view class="d-flex flex-column p-3" style="background-color: #000;">
				<view v-if="$store.state.token" class="money font-md text-white">
					{{$t('我的余额')}}: {{$store.state.userinfo.money}}
				</view>
				<view v-else class="money font-md text-white">
					{{$t('您还未登录。请登录后购买！')}}
				</view>
				<view class="d-flex a-center text-white j-sb mt-2">
					<view class="money-btn d-flex a-center j-center flex-column py-2 px-2 main-bg-color"
						@click="openPayVideo(false)">
						<span class="line-h-md">{{$t('购买单集视频')}}</span>
						<span class="line-h-md">{{detail.list && detail.list[current].price}}</span>
					</view>
					<view class="money-btn d-flex a-center j-center flex-column py-2 px-2 main-bg-color"
						@click="openPayVideo(true)">
						<span class="line-h-md">{{$t('购买整部视频')}}</span>
						<span class="line-h-md">{{detail.info && detail.info.price}}</span>
					</view>
				</view>
				<view class="mt-4 font-weight w-100 font-md text-center" style="color: #d27804;">
					{{$t('VIP用户权益')}}
				</view>
				<view class="d-flex a-center text-white j-sb">
					<view class="font-md d-flex a-center j-center flex-column">
						<span>{{$t('VIP单集视频')}}</span>
						<span>{{detail.list && detail.list[current].vipprice}}</span>
					</view>
					<view class="font-md d-flex a-center j-center flex-column">
						<span>{{$t('VIP整部视频')}}</span>
						<span>{{detail.info && detail.info.vipprice}}</span>
					</view>
				</view>
				<view class="text-center text-danger font mt-2">
					{{$t('开通VIP尊享更多优惠福利')}}
				</view>
				<view class="btn main-bg-color d-flex a-center j-center w-100 py-2 mt-1"
					@click="$tools.Navigate.navigateTo('/pages-common/vip/index')">
					{{$t('开通会员')}}
				</view>
			</view>
		</m-popup>
		<!-- 取消收藏弹窗 -->
		<m-modal :show="collShow" title="温馨提示" i18n @cancel="collShow = false" @confirm="delCollect">
			<view class="d-flex a-center j-center">
				{{$t('确定要取消收藏吗？')}}
			</view>
		</m-modal>
		<!-- 确认购买弹窗 -->
		<m-modal :show="viewShow" title="温馨提示" i18n @cancel="viewShow = false" @confirm="openPay">
			<view class="d-flex a-center j-center">
				{{$t(payText)}}
			</view>
		</m-modal>
		<!-- 倒计时弹窗 -->
		<u-popup zIndex="999999" :show="timeShow" :overlay="false" :round="10" mode="center" @close="timeShow = false">
			<view class="time text-light-muted d-flex a-center j-center flex-column">
				<view class="font-big">
					{{time}}
				</view>
				<view class="w-100 text-center px-2">
					{{$t('3秒后自动播放下一集')}}
				</view>
			</view>
		</u-popup>
		<!-- 充值 -->
		<u-overlay :show="upShow" @click="()=>{}">
			<view class="position-absolute top-half left-half tf-half-xy">
				<view class="position-relative top-up p-3">
					<view class="recharge">
						<view class="recharge-title d-flex a-center j-center py-2">
							<view class="line-h text-white font-md ml-1">
								{{$t('余额不足，请充值')}}
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
						<u-input fontSize="28rpx" @change="inputChange" color="#111" maxlength="16"
							placeholderStyle="color: #808080;font-size: 28rpx;"
							:customStyle="{height: '110rpx', caretColor: '#111'}" type="number" border="none"
							:placeholder="$t('输入自定义金额')" v-model="amount">
							<view slot="suffix" class="gold px-2">
								{{gold}} {{$t('金币')}}
							</view>
						</u-input>
					</view>
					<view class="notice mt-2 font">
						{{$t('充值说明')}}: 1{{$store.state.moneySymbol}}={{rate}}{{$t('金币')}}
					</view>
					<u-button :hairline="false" loadingSize="16" :text="$t('付费')" :loading="req" @click="openTopUp"
						class="btons d-flex a-center j-center mt-4">
					</u-button>
					<view class="notice d-flex a-center flex-column">
						<span class="mt-1 text-white font">{{tips}}</span>
					</view>
					<view class="position-absolute left-half tf-half-x" style="bottom: -120rpx;"
						@click="upShow = false">
						<u-image width="76rpx" height="76rpx" src="/static/img/common/close.svg" mode=""></u-image>
					</view>
				</view>
			</view>
		</u-overlay>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		fetchTrack,
		srt2vtt,
		transformSrtTracks
	} from 'srt-support-for-html5-videos';
	var parser = require('subtitles-parser');

	import MPopup from '@/main_modules/main-ui/m-popup/index.vue'
	import {
		getVideoInfo,
		getRechargeConfig
	} from '@/utils/request/api/get.js'
	import {
		addCollect,
		buyVideo,
		videoLog,
		setLike,
		rechargeGold
	} from '@/utils/request/api/post.js'
	export default {
		components: {
			MPopup
		},
		data() {
			return {
				scrollTop:0,
				oldscrolltop:0,
				barrages_show:true,
				barrages: [],
				showComment: false,
				comment: '',
				query: {
					mid: 0,
					vid: 0,
					type: 0
				},
				srt_data: '',
				srt: 'https://vjs.zencdn.net/v/oceans.vtt',
				current: 0,
				detail: {},
				status: 0,
				show: false,
				collShow: false,
				payShow: false,
				viewShow: false,
				upShow: false,
				payText: '',
				isAll: false,
				timeShow: false,
				time: 3,
				isObject: false,
				initialTime: 0,
				scheduleTime: 0,
				timeout: null,
				rechargeList: [],
				rechargeCurrent: 0,
				topUpQuery: {
					amount: '',
					code: 'paypal',
					return_url: window.location.origin + '/pages-common/pay/return',
					cancel_url: window.location.origin + '/pages-common/pay/cancel'
				},
				amount: '',
				gold: 0,
				rate: 0,
				tips: '',
				req: false,
				barrageConfig: {
					speed: 10,
					FontSize: 36,

				}
			}
		},
		onLoad(args) {
			let value = this.$tools.Navigate.receivePageData(args)
			this.isObject = this.$check.isObject(value)
			console.log("value", value)
			if (this.isObject) {

				this.query.vid = value.vid
				this.query.mid = value.mid


			} else {
				this.query.mid = value
				this.query.mid = value

			}
			this.init()
			// let barrages = []
			// for (let i = 0; i < 1000; i++) {
			// 	barrages.push({
			// 		text: '视频1：这是第' + (i + 1) + '条弹幕',
			// 		color: '#fff',
			// 		fontSize: 18,
			// 		time: i * 1
			// 	})
			// }
			// this.src = 'https://ydtnt-jw.oss-cn-zhangjiakou.aliyuncs.com/jw-video/%E8%A7%86%E9%A2%91/%E8%8B%B1%E8%AF%AD/%E5%94%90%E8%BF%9F%E8%AF%8D%E6%B1%87%E7%9A%84%E9%80%BB%E8%BE%91%E5%8D%95%E8%AF%8D%E8%AF%BE/Unit1-1_batch.mp4'
			// this.barrages = barrages
			
 
		},
		onUnload() {
			clearInterval(this.timeout)
		},
		methods: {
			scroll(e){
				 
				  this.oldscrolltop = e.scrollTop
			},
			getComment(){
				let obj = {}
				obj.movie_id = this.query.mid
				obj.video_id = this.query.vid
				this.barrages = []
	 
				this.$getapi("Dj/getComment", obj, 1).then(res => {
					if (res.code == 0) {
					 this.barrages = res.data.list 
					}
				})
			},
			// 初始化
			getSrt(srt) {
				fetchTrack(srt).then(srt => {
					let vtt = srt2vtt(srt);
					var data = parser.fromSrt(srt, true);
					let video = document.querySelector("video");
					let track = video.addTextTrack("captions", "Captions", "en");
					track.mode = "showing";
					data.forEach(v => {
						track.addCue(new VTTCue(v.startTime / 1000, v.endTime / 1000, v.text));
					})
					// 
				})
			},
			init() {
				this.getData()
				this.getRechargeList()
			},
			// 获取充值列表
			async getRechargeList() {
				let {
					code,
					data
				} = await getRechargeConfig()
				if (code == 200) {
					this.rate = data.rate
					this.tips = data.tips
					this.rechargeList = data.options
					this.topUpQuery.amount = data.options[0].amount
				}
			},
			// 选择价格
			changeRecharge(i) {
				this.topUpQuery.amount = this.rechargeList[i].amount
				this.rechargeCurrent = i
			},
			// 输入价格
			inputChange(e) {
				this.gold = e * this.rate
			},
			// 支付
			async openTopUp() {
				this.req = true
				this.$refs.uToast.show({
					type: 'loading',
					message: "loading",
					duration: 60000
				})
				if (this.amount) {
					this.topUpQuery.amount = this.amount
				}
				let {
					code,
					data
				} = await rechargeGold(this.topUpQuery)
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
			},
			doComment() {

				let obj = {}
				obj.text = this.comment
				obj.movie_id = this.query.mid
				obj.video_id = this.query.vid
				obj.time = this.scheduleTime
				console.log(obj)
				this.$getapi("Dj/addComment", obj, 1).then(res => {
					if (res.code == 0) {
						this.comment = ''
						this.showComment = false
						uni.showToast({
							icon: 'none',
							title: this.$t('成功')
						})
					   this.getComment()
					}
				})
			},
			// 获取数据
			async getData() {

				this.$getapi("Dj/videoInfo", this.query).then(res => {
					if (res.code == 0) {
						if (!this.query.vid) this.query.vid = res.data.vid
						res.data.list.forEach((item, i) => {
							if (item.id == res.data.vid) {
								this.current = i
							}
							if (res.data.is_play == 0) {
								this.payShow = true
							}
							
						})
						this.detail = res.data
						this.getSrt(res.data.srt)
						this.getComment()
					}
				});



			},
			// 播放进度上报
			async playScheduleReport() {
				console.log("playschedulereport")
				await videoLog({
					vid: this.query.vid,
					mid: this.query.mid,
					vtime: this.scheduleTime
				})
			},
			doshowComment() {
				this.showComment = true
			},
			// 打开选剧集弹框
			selectEpisode() {
				this.$refs.video.pause()
				this.show = true
				
			 
			 
			},
			// 购买视频
			openPayVideo(i) {
				if (!this.$store.state.token) {
					return this.$tools.Navigate.navigateTo('/pages-common/account/login/index')
				}
				this.isAll = i
				let obj = {
					vid: this.query.vid,
					mid: this.query.mid,
					vtime: this.scheduleTime
				}
				this.topUpQuery.return_url = this.topUpQuery.return_url + this.$tools.Navigate.setPlaintext(obj)
				this.topUpQuery.cancel_url = this.topUpQuery.cancel_url + this.$tools.Navigate.setPlaintext(obj)
				if (!i) {
					this.payText = '确定购买单集视频吗？'
					if (this.$store.state.userinfo.money >= this.detail.list[this.current].price) {
						this.viewShow = true
					} else {
						this.upShow = true

					}
				} else {
					this.payText = '确定购买整部视频吗？'
					if (this.$store.state.userinfo.money >= this.detail.info.price) {
						this.viewShow = true
					} else {
						this.upShow = true
					}
				}
			},
			// 点赞
			async openLike() {

				if (this.detail.love == 0) {
					this.query.type = 1
				} else {
					this.query.type = 0
				}
				this.$getapi("Dj/setLike", this.query).then(res => {
					if (res.code == 0) {
						if (res.data == 1) {
							this.detail.love = 1
							uni.showToast({
								icon: 'none',
								title: this.$t('点赞成功')
							})
						} else {
							this.detail.love = 0
							uni.showToast({
								icon: 'none',
								title: this.$t('已取消点赞')
							})
						}
					}
				});



			},
			// 收藏
			async openCollect() {
				if (this.detail.collect == 1) {
					this.collShow = true
				} else {

					this.$getapi("Dj/addFollow", this.query).then(res => {
						if (res.code == 0) {
							this.detail.collect = 1
							uni.showToast({
								icon: 'none',
								title: this.$t('添加收藏成功')
							})
						}
					});
				}


			},
			// 取消追剧
			async delCollect() {

				this.$getapi("Dj/removeFollow", this.query).then(res => {
					if (res.code == 0) {
						this.detail.collect = 0
						this.collShow = false
						uni.showToast({
							icon: 'none',
							title: this.$t('取消收藏成功')
						})
					}
				});

			},
			// 购买剧集
			async openPay() {
				// 调接口购买
				if (this.isAll) {
					this.query.type = 1
				} else {
					this.query.type = 2
					this.query.mid = this.detail.list[this.current].id
				}
				let {
					code,
					data
				} = await buyVideo(this.query)
				if (code == 200) {
					this.getData()
					uni.showToast({
						icon: 'none',
						title: this.$t('购买成功')
					})
				}
				this.viewShow = false
				this.payShow = false
			},
			// 点击播放剧集
			openVideo(i) {

				this.current = i
				if (this.detail.list[i].is_play == 0) {
					this.show = false
					this.payShow = true
				} else {
					this.show = false
					this.query.vid = this.detail.list[this.current].id
				
				}


				this.$getapi("Dj/updateHistory", this.query).then(res => {
					if (res.code == 0) {

					}
				});

			},
			// 播放结束事件
			ended() {
				if (this.current < this.detail.list.length - 1) {
					this.timeShow = true
					let time = setInterval(() => {
						this.time--
						if (this.time <= 0) {
							this.timeShow = false
							this.current++
							this.query.vid = this.detail.list[this.current].id
						

							this.$getapi("Dj/updateHistory", this.query).then(res => {
								this.$refs.video.play()
								this.getComment()
							});

							let date = setTimeout(() => {
								this.time = 3
								clearTimeout(date)
							}, 1000)
							clearInterval(time)
						}
					}, 1000)
				}
			},
			// 关闭选集弹框
			showClose() {
				this.show = false
				this.$refs.video.play()
			},
			// 关闭购买视频弹框
			payShowClose() {
				this.payShow = false
			},
			// 监听播放事件
			monitorPlay() {
				this.status = 1
				if (this.$store.state.token) {
					clearInterval(this.timeout)
					// this.timeout = setInterval(() => {
					// 	this.playScheduleReport()
					// }, 10000)
				}
			},
			// 监听暂停事件
			monitorPause() {
				this.status = 0
				if (this.$store.state.token) {
					clearInterval(this.timeout)
				}
			},
			// 监听播放进度事件
			timeupdate(e) {
				this.scheduleTime = e.currentTime
			}
		},
		computed: {
			scrollStyle() {
				return {
					height: `calc(100vh - env(safe-area-inset-bottom) - ${this.$store.state.browserFitHeight}px)`
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {

		/deep/ .u-popup__content {
			background-color: #00000099;
		}

		.bottom {
			background-color: #FFEDE2;
			border-radius: 20rpx;
			padding: 0 30rpx;

			.code {
				border-radius: 20rpx;
			}

			.gold {
				height: 100%;
				background-color: #333;
				border-radius: 4rpx;
				color: #EE7623;
			}
		}

		.notice {
			font-size: 28rpx;
			font-weight: 400;
			color: #000;
			line-height: 32rpx;
		}

		.recharge {

			.recharge-title {}

			.list {

				.item {
					width: 48.5%;
					background: #FFEDE2;
					border-radius: 20rpx;
					margin-right: 3%;

					.item-t {
						height: 84rpx;
						background: linear-gradient(180deg, #FEFAF5 0%, #F3B38E 100%);

						.item-coin {
							color: #E35D00;
							font-size: 40rpx;
						}
					}

					.item-b {
						height: 68rpx;

						.item-price {
							font-size: 32rpx;
							color: #381301;
						}
					}

					.bactive {
						background-color: #E02929;

						.item-price {
							color: #fff;
						}
					}
				}

				.active {
					border: 4rpx solid #E02929;

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

		.btons {
			height: 100rpx;
			background: #E02929;
			color: #fff;
			border: none;
			border-radius: 16rpx;
		}

		.top-up {
			width: 618rpx;
			height: 880rpx;
			background: url('/static/img/common/popbg.png') no-repeat;
			background-size: 100% 100%;
		}

		.select {
			background-color: #111;
	
			.item {
				width: 19%;
				margin-right: 1%;
				background-color: #333;
				border-radius: 16rpx;

				.item-state {
					color: #EE7623;
					font-size: 24rpx;
				}

				.pay {
					padding: 0 16rpx;
					height: 44rpx;
					background: linear-gradient(90deg, #D6BCA0 0%, #FDE4CE 100%);
					border-radius: 0rpx 12rpx 0rpx 12rpx;

					.pay-name {
						font-size: 20rpx;
						color: #834E21;
					}
				}
			}

		 

		.item:nth-child(5n) {
			margin-right: 0 !important;
		}
	}

	.money-btn {
		border-radius: 20rpx;
		width: 45%;
	}

	.btn {
		border-radius: 20rpx;
		color: #6d4006;
	}

	.time {
		width: 400rpx;
		height: 280rpx;
	}
	}
</style>