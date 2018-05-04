 import { des, hexToString, base64encode } from '../../utils/des.js'
 import { getMessgCode, setMessgRestsCode } from '../../api/api.js'
 import { navigateGoUtil } from '../../utils/util.js'
 let _this, timer, app;
 Page({
     data: {
         phone: '',
         mobile: '',
         code: '',
         count: 60,
         showNocode: false
     },
     onLoad(options) {
         _this = this, app = getApp();
         _this.setData({
             phone: options.mobile.substr(0, 3) + '****' + options.mobile.substr(7, 4),
             mobile: options.mobile
         })
         _this.getMessgCode()
     },
     //控制弹窗
     showNo() {
         _this.setData({
             showNocode: !_this.data.showNocode
         })
     },
     //验证码输入
     changeCode(e) {
         _this.setData({
             code: e.detail.value
         })
         if (e.detail.value.length == 4) {
             wx.hideKeyboard()
         }
     },
     //获取验证码
     getMessgCode() {
         if (!app.globalData.count) {
             getMessgCode({ type: 'mobile', mobile: _this.data.mobile, pushType: 4 }, {
                 skytknAnn: base64encode(des('Jdhgqwiczuq36%32hz*2$FRa', app.globalData.header.skytkn +
                     new Date().getTime(), 1, 1, '01234567', 1))
             }).then(data => {
                 app.globalData.count = 60;
                 _this.countDown()
                 if (data.code != 200) {
                     wx.showToast({
                         title: data.msg || '获取失败',
                         image: '../../images/02.png',
                         mask: true
                     })
                 }
             })
         }
     },
     //验证code是否正确的请求
     setMessgRestsCode() {
         setMessgRestsCode({
             pushType: 4,
             captcha: _this.data.code,
             mobile: _this.data.mobile
         }).then(data => {
             if (data.code == 200) {
                 if (data.rs) {
                     clearTimeout(timer)
                     app.globalData.count = 0;
                     navigateGoUtil('redirectTo', 'phone')
                 } else {
                     wx.showToast({
                         title: '验证码错误',
                         image: '../../images/02.png',
                         mask: true
                     })
                     _this.setData({
                         code: ''
                     })
                 }
             }
         })
     },
     //验证码倒计时
     countDown() {
         if (app.globalData.count > 0) {
             timer = setTimeout(() => {
                 app.globalData.count = app.globalData.count - 1;
                 _this.setData({
                     count: app.globalData.count
                 })
                 _this.countDown()
             }, 1000)
         }
     }
 })