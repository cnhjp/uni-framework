<route lang="json5">
{
  layout: 'demo',
  style: {
    navigationBarTitleText: '请求',
  },
}
</route>

<template>
  <view>
    <wd-button @click="gotoDemo">跳转到demo页</wd-button>
  </view>
</template>

<script setup lang="ts">
function gotoDemo() {
  uni.navigateTo({
    url: '/pages/demo/index',
  })
}
</script>
