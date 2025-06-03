import { CustomRequestOptions } from '@/interceptors/request'

export const http = <T>(options: CustomRequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<IResData<T>>((resolve, reject) => {
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      // 响应成功
      success(res) {
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as IResData<T>)
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          // userStore.clearUserInfo()
          // uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          !options.hideErrorToast &&
            uni.showToast({
              icon: 'none',
              title: (res.data as IResData<T>).msg || '请求错误',
            })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

/**
 * GET 请求
 * @param url 后台地址
 * @param query 请求query参数
 * @param header 请求头，默认为json格式
 * @returns
 */
export const httpGet = <T>(
  url: string,
  query?: Record<string, any>,
  header?: Record<string, any>,
) => {
  return http<T>({
    url,
    query,
    method: 'GET',
    header,
  })
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @param query 请求query参数，post请求也支持query，很多微信接口都需要
 * @param header 请求头，默认为json格式
 * @returns
 */
export const httpPost = <T>(
  url: string,
  data?: Record<string, any>,
  query?: Record<string, any>,
  header?: Record<string, any>,
) => {
  return http<T>({
    url,
    query,
    data,
    method: 'POST',
    header,
  })
}
/**
 * PUT 请求
 */
export const httpPut = <T>(
  url: string,
  data?: Record<string, any>,
  query?: Record<string, any>,
  header?: Record<string, any>,
) => {
  return http<T>({
    url,
    data,
    query,
    method: 'PUT',
    header,
  })
}

/**
 * DELETE 请求（无请求体，仅 query）
 */
export const httpDelete = <T>(
  url: string,
  query?: Record<string, any>,
  header?: Record<string, any>,
) => {
  return http<T>({
    url,
    query,
    method: 'DELETE',
    header,
  })
}

/**
 * 下载文件
 * @param url 后台地址
 * @param query 请求query参数
 * @param header 请求头
 * @returns Promise，成功时返回临时文件路径，失败时返回错误信息
 */
export const httpDownload = (
  url: string,
  query?: Record<string, any>,
  header?: Record<string, any>,
): Promise<string> => {
  // 构建完整的 URL，包含 query 参数
  const fullUrl = query
    ? url +
      '?' +
      Object.keys(query)
        .map((key) => `${key}=${encodeURIComponent(query[key])}`)
        .join('&')
    : url

  return new Promise<string>((resolve, reject) => {
    uni.downloadFile({
      url: fullUrl,
      header: header || {}, // 确保 header 是一个对象
      success: (res) => {
        // 只要 statusCode 是 2xx，都表示成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.tempFilePath)
        } else {
          // 其他状态码表示下载失败
          uni.showToast({
            icon: 'none',
            title: `下载失败，状态码: ${res.statusCode}`,
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          icon: 'none',
          title: '下载失败，网络错误',
        })
        reject(err)
      },
    })
  })
}

/**
 * 上传文件
 * @param url 后台地址
 * @param data 额外的 form data (传入一个Object，自动将内容用FormData包裹)
 * @param header 请求头
 * @returns Promise，成功时返回响应数据，失败时返回错误信息
 */
export const httpUpload = <T>(
  url: string,
  data?: Record<string, any>,
  header?: Record<string, any>,
): Promise<IResData<T>> => {
  const files = data.files ? data.files : [data.file]
  const otherData = {} // 除了files的其他字段
  for (const key in data) {
    if (key !== 'files' && key !== 'file') {
      otherData[key] = data[key]
    }
  }
  return new Promise<IResData<T>>((resolve, reject) => {
    uni.uploadFile({
      url: url,
      files: files,
      formData: data || otherData || {}, // 将传入的 data 对象作为 formData
      header: header || {},
      success: (res) => {
        // uni.uploadFile 的 success 返回的是 UniApp.UploadFileSuccessCallbackResult
        // data 是一个字符串，需要手动解析
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // 尝试解析 JSON 字符串
            const resData = JSON.parse(res.data) as IResData<T>
            // 假设 IResData 有 code 和 msg 字段，且 code 为 0 表示业务成功
            // 请根据实际后端返回结构调整这里的判断
            if (resData && resData.code === 0) {
              resolve(resData)
            } else {
              // 业务逻辑错误
              // 假设可以通过 header 或其他方式控制是否显示错误提示
              // !header?.hideErrorToast && // 如果需要根据 header 控制
              uni.showToast({
                icon: 'none',
                title: resData?.msg || '上传业务处理失败',
              })
              reject(resData) // Reject with the parsed data
            }
          } catch (e) {
            // 解析失败，可能是非 JSON 响应
            uni.showToast({
              icon: 'none',
              title: '上传成功，但响应数据解析错误',
            })
            reject(res) // Reject with the raw response
          }
        } else {
          // HTTP 状态码错误
          uni.showToast({
            icon: 'none',
            title: `上传失败，状态码: ${res.statusCode}`,
          })
          reject(res) // Reject with the raw response
        }
      },
      fail: (err) => {
        uni.showToast({
          icon: 'none',
          title: '上传失败，网络错误',
        })
        reject(err)
      },
    })
  })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete
http.download = httpDownload
http.upload = httpUpload // 将新的方法添加到 http 对象上
