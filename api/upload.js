 import { api } from './api.js'
 export const setUpload = ({ qiniuToken, filePath, fileName }) => {
     wx.showLoading({
         title: '正在上传',
         mask: true
     })
     return new Promise((resolve, reject) => {
         wx.uploadFile({
             url: api.qn,
             filePath: filePath,
             name: 'file',
             header: {
                 'Content-Type': 'multipart/form-data; boundary=' + qiniuToken
             },
             formData: {
                 'token': qiniuToken,
                 'fileName': fileName
             },
             success: res => {
                 wx.hideLoading()
                 wx.showToast({
                     title: '上传成功',
                     image: '../../images/01.png',
                     mask: true
                 })
                 resolve(res.data)
             },
             fail: res => {
                 wx.hideLoading()
                 wx.showToast({
                     title: '上传失败',
                     image: '../../images/02.png',
                     mask: true
                 })
                 reject(res)
             }
         })
     })
 }