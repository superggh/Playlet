<template>
	<view @mousedown="mouseDown" @mouseup="mouseUp" @mouseout="mouseUp" @touchstart="mouseDown" @touchend="mouseUp"
		@touchcancel="mouseUp" id="k-container-id" style="height: 100vh;position: relative;width: 750rpx;">
		<swiper class="imgDetails" style="z-index: 2;position: absolute;top: 0;left: 0;bottom: 0;right: 0;"
			@change="change" :current="current" :vertical="true" :autoplay="false" @transition="transition">
			<swiper-item style="position: relative;" class="imgDetails" v-for="(item,index) in  videoList" :key="index">
				<image class="imgmh" :src="item.full_img"></image>
				<template>
					<view @click.stop="toPlay(item)" class="fgc" v-if="!isPlay">
						<image style="width: 36px;height:36px" mode="widthFix" src="../../../static/stop.png"></image>
					</view>
					<view class="text-white" style="position:absolute;left:20rpx;bottom: 120px;z-index:999">
						<view class="text-ellipsis5" style="width: 500rpx;">
							{{item.name}} - 第{{item.epi}}集
						</view>
						<view class="text-ellipsis5 mt-2" style="width: 500rpx;">
							{{item.story}}
						</view>
						<view class="d-flex a-center" @click.stop="selectEpisode(item)">
							<span class="text-white mr-1">{{$t('去看全集')}}</span>
							<u-icon name="arrow-right" color="#fff" size="14"></u-icon>
						</view>
					</view>
					<video @play="play" @click="toPause(item)" @pause="pause" v-if="index == current" :autoplay="true"
						:ref="'a'+item.id" class="video imgx" loop :show-center-play-btn="false" :controls="false"
						:enable-progress-gesture="false" :poster="item.full_img" :src="item.videourl"
						:show-fullscreen-btn="false" style="width: 750rpx;height: 100vh;align-items: center;"
						mode="widthFix" >
						<cover-view class="controls-hader" @tap.stop="" v-if="touches.isShow">
							<view>
								{{item.name}} - 第{{item.epi}}集
							</view>
						</cover-view>
					
					 
					</video>
				 
				</template>
			</swiper-item>
		</swiper>
		<view v-if="current==0" :style="'top:'+ tops +'px'" style="position: absolute;left: 0;text-align: center;
			z-index: 1;line-height: 30px;right: 0;">
			<view style="">{{tops>50?'释放刷新':'下拉刷新'}}</view>
		</view>
		<view style="position: absolute;left: 0;text-align: center;
			z-index: 1;line-height: 30px;right: 0;bottom: 20px;">
			<view style="">没有更多数据了</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				scale: 0.5,
				PageWidtht: 0,
				PageHidtht: 0,
				statusBarHeight: 0,
				current: 0,
				toUser: {
					nickName: '监控视频'
				},
				videoList: [],
				pageSize: 15,
				page: 1,
				tops: -30,
				isPlay: false,
				isNode: true,
				touches: {
					isShow: true,
					clientX: 0,
					clientY: 0,
				}
			}
		},
		onLoad(e) {
			this.getList()
			let that = this
			uni.getSystemInfo({
				success: function(e) {
					that.statusBarHeight = e.statusBarHeight
					// #ifdef APP-PLUS
					that.PageWidtht = e.screenWidth
					that.PageHidtht = e.screenHeight -80
					// #endif	

					// #ifdef H5
					that.PageWidtht = e.windowWidth
					that.PageHidtht = e.windowHeight -80
					// #endif

				}
			})
		},
		mounted() {
			// #ifdef H5
			let con = document.getElementById('k-container-id');
			con.ontouchmove = function(e) {
				e.preventDefault();
			}
			// #endif
		},
		methods: {
			selectEpisode(item) {
				let obj = {
					vid: item.vid,
					mid: item.id
				}
				this.$tools.Navigate.navigateTo('/pages-common/detail/index', obj)
			},
			//  数据驱动
			getList() {
				let that = this
				this.isNode = false
				let obj = {}
				obj.page = 1
				this.$getapi("Dj/getRecomment", obj).then(res => {
					if (res.code == 0) {
						that.isNode = true
						this.videoList = this.videoList.concat(res.data.list)
					}
				});


			},
			change(e) {
				this.current = e.target.current || e.currentTarget.current || 0;
				let amount = this.videoList.length
				// 自动播放
				let id = 'a' + this.videoList[this.current].id
				let that = this
				this.$nextTick(function() {
					that.$refs[id][0].play()
				})
				this.touches.isShow = true
				console.log(this.current, amount, this.isNode)
				if (this.current > (amount - 2) && this.isNode) { //还有两条时自动加载
					console.log('触底加载')
					this.getList()
				}
			},
			//  固定方法，实现暂停，播放，左滑右滑，显示弹框，关闭弹框
			close() {
				this.$refs.popup.close()
			},
			open() {
				// 通过组件定义的ref调用uni-popup方法 ,如果传入参数 ，type 属性将失效 ，仅支持 ['top','left','bottom','right','center']
				this.$refs.popup.open()
			},
			toPlay(item) {
				let id = 'a' + item.id
				this.$refs[id][0].play()
			},
			toPause(item) {
				let id = 'a' + item.id
				this.$refs[id][0].pause()
				this.isPlay = false
			},
			transition(e) {
				this.tops = -e.detail.dy - 30
			},
			play() {
				this.isPlay = true
			},
			pause() {
				this.isPlay = false
			},
			mouseDown(e) {
				let pas = {}
				if (e.changedTouches && e.changedTouches.length > 0) {
					pas = e.changedTouches[0]
				} else {
					pas = e
				}
				this.touches.clientX = pas.clientX
				this.touches.clientY = pas.clientY
			},
			mouseUp(e) {
				let pas = {}
				if (e.changedTouches && e.changedTouches.length > 0) {
					pas = e.changedTouches[0]
				} else {
					pas = e
				}
				let x = this.touches.clientX - pas.clientX
				let y = this.touches.clientY - pas.clientY
				if (y < 50 && y > -50 && this.isPlay) { // 拖动范围内
					if (x > 100) {
						console.log('100--------------------')
						this.touches.isShow = true
					}
					if (x < -100) {
						console.log('-100--------------------')
						this.touches.isShow = false
					}
				}
				// if (this.current == 0 && this.tops > 50) {
				// 	console.log('去刷新--------------------')
				// 	this.getList()
				// }
			},
		}
	}
</script>

<style lang="scss" scoped>
	.scroll-view-item {
		height: 45vh;
	}

	.uni-bg-green {
		background-color: #f55;
	}

	.popupx {
		background-color: #fff;
		border-radius: 15rpx;
		width: 660rpx;
		height: 85vh;
		padding: 20rpx;

		.scroll-Y {
			height: calc(85vh - 20px - 30rpx);
		}
	}

	.video {
		position: relative;

		.controls-hader {
			position: absolute;
			top: 0;
			color: #fff;
			left: 0;
			right: 0;
			width: 750rpx;
			background-color: rgba(0, 0, 0, .3);
			color: #fff;
			height: 80rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.controls-title {
			position: absolute;
			bottom: 150rpx;
			color: #fff;
			padding: 0 25rpx;
			left: 0;
			width: 600rpx;
			line-height: 45rpx;
			font-size: 32rpx;
			font-weight: 600;

			view {
				display: inline-block;
			}
		}

		.controls-but {
			position: absolute;
			bottom: 50rpx;
			color: #fff;
			padding: 0 25rpx;
			right: 0;
			text-align: center;
			color: #fff;
			width: 100rpx;

			.imngs {
				border-radius: 50%;
				width: 80rpx;
				height: 80rpx;
				border: 4rpx solid #fff;
			}

			view {
				margin-bottom: 15rpx;
			}
		}

		cover-view {
			word-break: break-all;
			word-wrap: break-word;
			white-space: pre-line;
		}
	}

	.rights {
		position: absolute;
		right: 20rpx;
		bottom: 100rpx;
		text-align: center;

		view {
			margin-bottom: 20rpx;
		}
	}

	.hader {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 3;
		width: 750rpx;
		background-color: rgba(0, 0, 0, .3);
		color: #fff;
		height: 80rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.imgmh {
		display: block;
		width: 100%;
		height: 100%;
		box-sizing: content-box;
		padding: 40px 30px;
		position: absolute;
		z-index: -1;
		top: -40px;
		left: -30px;
		filter: blur(20px);
	}

	.fgc {
		position: fixed;
		z-index: 1;
		
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, .3);
	}

	.imgDetails {
		width: 750rpx;
		height: calc(100vh);
	}
</style>