<route lang="json5" type="page">
{
  style: {
    navigationBarTitleText: '演示页面',
  },
}
</route>

<template>
  <view>
    <h1>items</h1>
    <view class="border border-#ccc bg-#eee">
      <view v-for="(item, index) in items" :key="index" class="flex">
        <text>{{ item.name }}</text>
        <view class="text-red" @click="deleteListItem(item.id)">删除</view>
      </view>
    </view>

    <uni-badge text="1"></uni-badge>

    <h1>获取items</h1>
    <!-- <uni-button @click="getList">点击</uni-button> -->

    <h1>新增item</h1>
    <!-- <uni-button @click="addListItem">点击</uni-button> -->

    <h1>上传附件</h1>
    <wd-upload :file-list="fileList" image-mode="aspectFill" @change="select"></wd-upload>
    <!-- <uni-file-picker
      v-model="fileList"
      fileMediatype="all"
      mode="grid"
      @select="select"
      @progress="progress"
      @success="success"
      @fail="fail"
    /> -->
    {{ fileList }}

    <h1>下载附件</h1>
    <wd-button @click="downloadFile">点击</wd-button>
    <uni-button @click="downloadFile">点击</uni-button>
  </view>
</template>

<script setup lang="ts">
import { getItems, deleteItem, addItem, uploadAttachment, downloadAttachment } from '@/service/demo'

const items = ref([])

function getList() {
  getItems()
    .then((data) => {
      items.value = data || []
    })
    .catch((err) => {
      console.error('获取items失败:', err)
    })
}

function deleteListItem(id) {
  deleteItem(id)
    .then(() => {
      // 删除成功后重新获取列表
      getList()
      uni.showToast({
        title: '删除成功',
        icon: 'success',
      })
    })
    .catch((err) => {
      console.error('删除失败:', err)
    })
}

function addListItem() {
  addItem({
    name: '新添加的item' + Math.random().toFixed(2),
    id: Math.random().toString(36).substring(2, 15), // 生成一个随机id
  })
    .then(() => {
      // 添加成功后重新获取列表
      getList()
      uni.showToast({
        title: '添加成功',
        icon: 'success',
      })
    })
    .catch((err) => {
      console.error('添加失败:', err)
    })
}

// 上传
const fileList = ref([])
function select(file) {
  console.log('select', file)
  const data = { file: file.tempFiles[0].file }
  uploadAttachment(data)
}
function progress(e) {
  console.log('progress', e)
}
function success(e) {
  console.log('success', e)
}
function fail(e) {
  console.log('fail', e)
}

// 下载
function downloadFile() {
  downloadAttachment('ak.png')
    .then((res) => {
      console.log('下载成功:', res)
      uni.showToast({
        title: '下载成功',
        icon: 'success',
      })
    })
    .catch((err) => {
      console.error('下载失败:', err)
      uni.showToast({
        title: '下载失败',
        icon: 'none',
      })
    })
}
</script>
