/* eslint-disable no-param-reassign */
import qs from 'qs'
import { useUserStore } from '@/store'
import { platform } from '@/utils/platform'
import { getEnvBaseUrl } from '@/utils'

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
} & IUniUploadFileOptions // 添加uni.uploadFile参数类型

// 请求基准地址
const baseUrl = getEnvBaseUrl()

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      // console.log(__VITE_APP_PROXY__)
      if (JSON.parse(__VITE_APP_PROXY__)) {
        // 自动拼接代理前缀
        options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
      } else {
        options.url = baseUrl + options.url
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }
    // 1. 请求超时
    options.timeout = 10000 // 10s
    // 2. （可选）添加小程序端请求头标识
    options.header = {
      platform, // 可选，与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    }
    // 3. 添加 token 请求头标识
    const userStore = useUserStore()
    const { token } = userStore.userInfo as unknown as IUserInfo
    if (token) {
      options.header.Authorization = `Bearer ${token}`
    }
  },

  // 拦截成功返回
  success(
    response: UniApp.RequestSuccessCallbackResult | UniApp.UploadFileSuccessCallbackResult,
    options: CustomRequestOptions,
  ) {
    // 假设后端返回的数据结构为 { code: number, msg: string, data: any }
    const res = response.data as any // 根据实际后端返回类型调整
    const { statusCode } = response

    // HTTP 状态码非 2xx
    if (statusCode < 200 || statusCode >= 300) {
      if (!options.hideErrorToast) {
        uni.showToast({
          title: res?.msg || `请求失败: ${statusCode}`,
          icon: 'none',
        })
      }
      // 返回一个 rejected Promise，以便在调用处捕获错误
      return Promise.reject(response)
    }

    // 假设后端业务状态码非成功 (例如 401 表示未登录)
    // 请根据实际后端返回的业务状态码进行判断
    if (res?.code && res.code !== 200) {
      // 假设 200 表示成功
      if (!options.hideErrorToast) {
        uni.showToast({
          title: res.msg || '请求错误',
          icon: 'none',
        })
      }
      // 如果是未登录 (假设 code 为 401)，可以进行跳转登录页等操作
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.removeUserInfo() // 清除用户信息
        // TODO: 跳转到登录页
        // uni.navigateTo({ url: '/pages/login/login' })
      }
      // 返回一个 rejected Promise
      return Promise.reject(response)
    }

    // 请求成功，返回数据
    return response
  },

  // 拦截失败返回 (网络错误等)
  fail(error, options: CustomRequestOptions) {
    debugger
    if (!options.hideErrorToast) {
      uni.showToast({
        title: error?.errMsg || '网络错误，请稍后重试',
        icon: 'none',
      })
    }
    // 返回一个 rejected Promise
    return Promise.reject(error)
  },

  // 请求完成无论成功失败
  // complete(options) {
  //   console.log('请求完成', options)
  // },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor as any)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor as any)
  },
}
