   import { navigateGoUtil } from '../utils/util.js'

   //请求头参数
   export let header = {
       'Content-Type': 'application/json'
   }

   //request请求体
   export const http = {
       request(method, url, data, headers) {
           return new Promise((resolve, reject) => {
               let headerNew = header;
               for (let key in headers) {
                   headerNew[key] = headers[key]
               }
               wx.request({
                   url: url,
                   data: data,
                   method: method,
                   header: headerNew,
                   success: res => {
                       //    console.log(url, res.data)
                     if ((res.data.code == 1406 && getApp().globalData.userInfo) || res.data.code == 1404) {
                           getApp().login()
                       } else if (res.data.code == 1900) {
                           wx.showToast({
                               title: '服务器错误',
                               image: '../../images/02.png',
                               mask: true
                           })
                       } else if (res.data.code != 200 && res.data.code != 1406 && res.data.code != 1701) {
                           wx.showToast({
                               title: res.data.msg || '请求出错',
                               image: '../../images/02.png',
                               mask: true
                           })
                       }
                       resolve(res)
                   },
                   fail: res => {
                       navigateGoUtil('redirectTo', '404', { length: getCurrentPages().length })
                   }
               })
           })
       },
       //get方法：用来获取数据
       get(url, data, headers) {
           return this.request('GET', url, data, headers || null)
       },
       //post方法：用来更新数据
       post(url, data, headers) {
           return this.request('POST', url, data, headers || null)
       }
   }