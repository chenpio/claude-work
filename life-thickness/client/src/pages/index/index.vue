<template>
  <view class="home">
    <text class="title">人生厚度</text>
    <text class="sub">记录人生的长度，沉淀生活的厚度</text>
    <view class="btn" @tap="goWrite">写日记</view>
    <view class="btn" @tap="goReview">复盘</view>
    <text v-if="msg">{{ msg }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'

const msg = ref('Hello World')

function goWrite() {
  Taro.navigateTo({ url: '/pages/write/index' })
}

function goReview() {
  Taro.switchTab({ url: '/pages/review/index' })
}
</script>

<style lang="scss">
.home { padding: 24rpx; min-height: 100vh; background: #FAF7F2; text-align: center; padding-top: 100rpx; }
.title { font-size: 44rpx; font-weight: 700; color: #3D3D3D; display: block; }
.sub { font-size: 26rpx; color: #9E9E9E; margin-top: 12rpx; display: block; }
.btn { margin: 32rpx auto; padding: 24rpx 48rpx; background: #8B7F6E; color: #fff; border-radius: 48rpx; font-size: 32rpx; display: inline-block; }
</style>
