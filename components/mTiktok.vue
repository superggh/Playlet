<template>
	<swiper class="m-tiktok-video-swiper" circular @change="swiperChange" :current="state.current" :vertical="true"
		duration="300">
		<swiper-item v-for="(item, index) in state.displaySwiperList" :key="index">
			<view class="swiper-item" @click="handleClick">
				<video :id="`video__${index}`" :controls="controls" :autoplay="false" :loop="loop" @ended="ended"
					@controlstoggle="controlstoggle" @play="onPlay" @error="emits('error')"
					class="m-tiktok-video-player" :src="item.src" v-if="index === 0 || !state.isFirstLoad"></video>
				<image v-if="item.poster && state.displayIndex != index" :src="item.poster"
					class="m-tiktok-video-poster" mode="aspectFit"></image>
				<slot :item="item"></slot>
			</view>
		</swiper-item>
	</swiper>
</template>

<script>
	export default {
		props: {
			show: {
				type: Boolean,
				default: () => {
					return false
				}
			}
		},
		data() {
			return {
				lang: ''
			}
		},
		created() {
			this.lang = this.$store.state.lang
		},
		methods: {
			// 确认
			swiperChange() {

			},
			// 取消
			handleClick(e) {

			},
			onPlay() {
				this.$emit("play", e);
			}
		}
	}
</script>


<style lang="scss">
.m-tiktok-video-swiper,
.m-tiktok-video-player {
  width: 100%;
  height: 100vh;
  background-color: #000;
}
.m-tiktok-video-swiper {
  .swiper-item {
    position: relative;
  }
  .m-tiktok-video-poster {
    background-color: #000;
    position: absolute;
    width: 100%;
    height: 100%;
  }
}
</style>
