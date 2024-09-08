<template>
	<view class="page">
 
		<swiper vertical :style="scrollStyle" :current="current" @change="swiperChange" @transition="transition">
			<swiper-item class="h-100" v-for="(item, i) in list" :key="i" :item-id="i.toString()">
				<yingbing-video :autoplay="i == 0" :ref="'video' + i" class="h-100"
					:poster="item.full_img" :src="item.videourl"
					@play="monitorPlay" @ended="ended" @pause="monitorPause" @timeupdate="timeupdate">
			
					<template #controls>
						<view class="position-absolute top-half left-half tf-half-xy text-white">
							<u-icon @click="videoPlay(i)" v-if="item.playstatus == 0" name="play-right-fill"
								size="50" color="#ffffff80"></u-icon>
							<u-icon @click="videoPause(i)" v-else name="pause" size="50"
								color="#ffffff80"></u-icon>
						</view>
						<view class="d-flex a-center j-center flex-column"
							style="position:absolute;right:20rpx;bottom: 100px;">
							<!-- <view class="d-flex a-center j-center flex-column" @click.stop="openLike(item, i)">
								<image style="width: 70rpx; height: 70rpx;"
									:src="`/static/img/common/${item.love == 0 ? 'like' : 'like-active'}.png`"></image>
								<view class="font" :style="{color: item.love == 0 ? '#fff': '#F73648'}">
									{{$t('点赞')}}	 
								</view>
							</view>
							<view class="d-flex a-center j-center flex-column mt-3" @click.stop="openCollect(item, i)">
								<image style="width: 70rpx; height: 70rpx;"
									:src="`/static/img/common/${item.collect == 0 ? 'collect' : 'collect-active'}.png`"></image>
								<view class="font" :style="{color: item.collect == 0 ? '#fff': '#F8B33B'}">
									{{$t('追剧')}}
								</view>
							</view> -->
						</view>
						<view class="text-white" style="position:absolute;left:20rpx;bottom: 100px;">
							<view class="text-ellipsis5" style="width: 500rpx;">
								{{item.name}}
							</view>
							<view class="text-ellipsis5 mt-2" style="width: 500rpx;">
								{{item.story}}
							</view>
							<view class="d-flex a-center" @click.stop="selectEpisode(item)">
								<span class="text-white mr-1">{{$t('去看全集')}}</span>
								<u-icon name="arrow-right" color="#fff" size="14"></u-icon>
							</view>
						</view>
					</template>
				</yingbing-video>
			</swiper-item>
		</swiper>
		<!-- 取消收藏弹窗 -->
		<m-modal :show="collShow" title="温馨提示" i18n @cancel="collShow = false" @confirm="delCollect">
			<view class="d-flex a-center j-center">
				{{$t('确定要取消收藏吗？')}}
			</view>
		</m-modal>
	</view>
</template>

<script>
	import {
		getRecommendVideo
	} from '@/utils/request/api/get.js'
	import {
		addCollect,
		videoLog,
		setLike
	} from '@/utils/request/api/post.js'
	export default {
		data() {
			return {
				
				list: [],
				current: 0,
				tempQuery: {
					vid: 0,
					type: 0
				},
				likeQuery: {
					vid: 0,
					mid: 0,
					type: 0
				},
				collShow: false,
				scheduleTime: 0,
				timeout: null
			}
		},
		
		onShow() {
			this.init()
		},
		onUnload() {
			clearInterval(this.timeout)
		},
		methods: {
			init() {
				this.getData()
			},
			// 获取数据
			async getData(e) {
				let obj = {}
				obj.page = 1
				this.$getapi("Dj/getRecomment", obj).then(res => {
					if (res.code == 0) {
						this.list = res.data.list
					}
				});
				
				
				 
			},
			// 打开选剧集弹框
			selectEpisode(item) {
				let obj = {
					vid: item.vid,
					mid: item.id
				}
				this.$tools.Navigate.navigateTo('/pages-common/detail/index', obj)
			},
			// 点赞
			async openLike(item, i) {
				console.log(item,i)
				return
				if (item.love == 0) {
					this.likeQuery.type = 1
				} else {
					this.likeQuery.type = 0
				}
				this.$getapi("Dj/setLike", this.likeQuery).then(res => {
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
				
		 
				this.likeQuery.vid = item.id
				this.likeQuery.mid = item.id
				if (item.love == 0) {
					this.likeQuery.type = 1
				} else {
					this.likeQuery.type = 0
				}
				let {
					code
				} = await setLike(this.likeQuery)
				if (code == 200) {
					if (this.likeQuery.type == 1) {
						this.list[i].love = 1
						uni.showToast({
							icon: 'none',
							title: this.$t('点赞成功')
						})
					} else {
						this.list[i].love = 0
						uni.showToast({
							icon: 'none',
							title: this.$t('已取消点赞')
						})
					}
				}
			},
			// 收藏
			async openCollect(item, i) {
				console.log(item,i)
				 return
				if (!this.$store.state.token) {
					return this.$tools.Navigate.navigateTo('/pages-common/account/login/index')
				}
				this.tempQuery.vid = item.videolist.id
				if (item.collect == 0) {
					this.tempQuery.type = 1
					let {
						code,
						data
					} = await addCollect(this.tempQuery)
					if (code == 200) {
						this.list[i].collect = 1
						uni.showToast({
							icon: 'none',
							title: this.$t('添加收藏成功')
						})
					}
				} else {
					this.collShow = true
				}
			},
			// 取消追剧
			async delCollect(i) {
				this.tempQuery.type = 0
				let {
					code,
					data
				} = await addCollect(this.tempQuery)
				if (code == 200) {
					this.list[this.current].collect = 0
					this.collShow = false
					uni.showToast({
						icon: 'none',
						title: this.$t('取消收藏成功')
					})
				}
			},
			// 点击播放
			videoPlay(i) {
				
				this.$refs[`video${i}`][0].play()
			},
			// 点击暂停
			videoPause(i) {
				 
				this.$refs[`video${i}`][0].pause()
			},
			// 播放进度上报
			async playScheduleReport() {
				// await videoLog({
				// 	vid: this.list[this.current].videolist.id,
				// 	mid: this.list[this.current].id,
				// 	vtime: this.scheduleTime
				// })
			},
			// 监听播放事件
			monitorPlay() {
				console.log(this.current)
				this.list[this.current].playstatus = 1
			 		console.log(this.list)
			},
			// 监听暂停事件
			monitorPause() {
					console.log(this.current)
				this.list[this.current].playstatus = 0
				console.log(this.list)
			},
			// 监听播放进度事件
			timeupdate(e) {
				this.scheduleTime = e.currentTime
			},
			transition(i){
				console.log(i)
			    this.$refs[`video${this.current}`][0].pause()
			},
			// 滚动切换
			swiperChange(i) {
				console.log(i,this.current,i.detail.current)
				this.$refs[`video${this.current}`][0].pause()
				console.log('stop' + this.current)
				clearInterval(this.timeout)
				if (i.detail.current > this.current) {
					this.$refs[`video${i.detail.current - 1}`][0].toggle()
				}else if (i.detail.current < this.current) {
					this.$refs[`video${i.detail.current + 1}`][0].toggle()
				}
				setTimeout(function() {
					this.current = i.detail.current
					this.$refs[`video${i.detail.current}`][0].play()
							console.log('play' + i.detail.current)
				}, 200);
				
				// if (i.detail.current < (this.list.length - 1)) {
				// 	this.getData('S')
				// }
			},
			// 播放结束事件
			ended() {
				this.current++
				// if (this.current < this.detail.list.length - 1) {
				// 	this.timeShow = true
				// 	let time = setInterval(() => {
				// 		this.time--
				// 		if (this.time <= 0) {
				// 			this.timeShow = false
				// 			this.current++
				// 			this.query.mid = this.detail.list[this.current].id
				// 			let date = setTimeout(() => {
				// 				this.time = 3
				// 				clearTimeout(date)
				// 			}, 1000)
				// 			clearInterval(time)
				// 		}
				// 	}, 1000)
				// }
			},
		},
		computed: {
			scrollStyle() {
				return {
					height: `calc(100vh - env(safe-area-inset-bottom) - ${this.$store.state.tabbarHeight}px - ${this.$store.state.browserFitHeight}px)`
				}
			}
		},
	}
</script>

<style lang="scss" scoped>

</style>