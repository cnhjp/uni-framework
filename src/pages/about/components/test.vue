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
    <wd-button @click="gotoLogin">跳转到登录页</wd-button>
  </view>
</template>

<script setup lang="ts">
function gotoLogin() {
  uni.navigateTo({
    url: '/pages/login/index',
  })
}
</script>
