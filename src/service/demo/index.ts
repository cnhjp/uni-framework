import { http } from '@/utils/http'

// 获取列表
export function getItems() {
  return http.get('http://localhost:3000/items')
}

// 删除项
export function deleteItem(id: string) {
  return http.delete(`http://localhost:3000/items/${id}`)
}

// 新增项
export function addItem(params: { id: string; name: string }) {
  return http.post('http://localhost:3000/items', params)
}

// 上传附件
export function uploadAttachment(params) {
  return http.post('/upload', params)
}
