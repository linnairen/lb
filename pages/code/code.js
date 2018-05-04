 import { des, hexToString, base64encode } from '../../utils/des.js'
 import { getMessgCode, setMessgCode, setPhoneNumber, setMessgRestsCode } from '../../api/api.js'
 let _this, timer, timerGo, pages, app;
 Page({
     data: {
         captcha: '', //手机获取到的验证码
         mobile: '', //手机号码
         phone: '*** **** ****', //用来显示的转格式手机号码
         left: 14, //input框的位置
         isOld: '', //新号码可以直接获取验证码,不用等倒计时结束
         style: 0, //已输入的样式
         codeList: ['', '', '', ''], //未输入的默认值
         count: 60, //定时器时间
         shadePanel: false,
         registCoupon: []
     },
     onLoad(options) {
         _this = this, pages = getCurrentPages(), app = getApp();
         if (pages[pages.length - 3].route.beString('/safe/')) {
             wx.setNavigationBarTitle({ title: '更换号码' })
         }
         _this.setData({
             phone: options.mobile.replace(/\B(?=(?:\d{4})+$)/g, ' '),
             mobile: options.mobile,
             isOld: options.isOld
         })
         _this.getMessgCode()
     },
     //请求头加当前时间戳进行加密  //当定时器结束后,点击重新获取验证码,倒计时重新赋值为60秒,并且重新获取验证码,然后再次启动定时器
     getMessgCode() {
         if (!app.globalData.count || _this.data.isOld == 'true') {
             getMessgCode({
                 type: 'mobile',
                 mobile: _this.data.mobile,
                 pushType: pages[pages.length - 3].route.beString('/safe/') ? 4 : 2
             }, {
                 skytknAnn: base64encode(des('Jdhgqwiczuq36%32hz*2$FRa',
                     app.globalData.header.skytkn + new Date().getTime(), 1, 1, '01234567', 1))
             }).then(data => {
                 clearTimeout(timer)
                 app.globalData.count = 60;
                 _this.countDown()
                 _this.emptyInput()
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
     //多方格输入事件
     getCode(e) {
         let cl = _this.data.codeList;
         let ct = e.detail.value;
         let ctl = ct.split('');
         for (let i = 0; i < cl.length; i++) {
             cl[i] = ctl[i] || '';
         }
         _this.setData({
             captcha: ct,
             codeList: cl
         })
         if (ctl.length != 4) {
             _this.setData({
                 left: ctl.length * 120 + 14 || 14,
                 style: ctl.length
             })
         } else {
             wx.hideKeyboard()
             _this.setData({
                 left: 400,
                 style: 4
             })
             if (pages[pages.length - 3].route.beString('/safe/')) {
                 _this.setPhoneNumber()
             } else {
                 _this.setMessgCode()
             }
         }
     },
     //登录时的效验
     setMessgCode() {
         let d = {
             clientType: 5,
             captcha: _this.data.captcha,
             mobile: _this.data.mobile,
             loginType: 'sms'
         }
         if (app.globalData.fromInvite != null) {
             d.inviteCode = app.globalData.fromInvite
         }
         setMessgCode(d).then(data => {
             console.log(data)
             if (data.code == 200 && data.rs) {
                 if (!data.rs.registCoupon) {
                     _this.codeValid('登陆成功')
                 } else {
                     _this.setData({
                         registCoupon: data.rs.registCoupon
                     })
                     _this.codeValid()
                 }
             } else {
                 _this.emptyInput()
             }
         })
     },
     //修改手机号码时的效验
     setPhoneNumber() {
         setPhoneNumber({
             mobile: _this.data.mobile,
             captcha: _this.data.captcha
         }).then(data => {
             if (data.code == 200) {
                 _this.codeValid('修改成功')
             } else {
                 _this.emptyInput()
             }
         })
     },
     //请求成功的处理函数
     codeValid(msg) {
         if (msg) {
             wx.showToast({
                 title: msg,
                 image: '../../images/01.png',
                 mask: true
             })
         } else {
             _this.setData({
                 shadePanel: true
             })
         }
         clearTimeout(timer)
         app.globalData.hasLogOn = true;
         app.globalData.count = 0;
         app.login()
         timerGo = setTimeout(() => {
             if (pages[pages.length - 3].route.beString('/home/')) {
                 pages[pages.length - 3].getRackOrder()
             }
             wx.navigateBack({ delta: 2 })
         }, msg ? 1500 : 10000)
     },
     shadePanelShow() {
         clearTimeout(timerGo)
         if (pages[pages.length - 3].route.beString('/home/')) {
             pages[pages.length - 3].getRackOrder()
         }
         wx.navigateBack({ delta: 2 })
     },
     //验证错误清空输入框
     emptyInput() {
         _this.setData({
             captcha: '',
             codeList: ['', '', '', ''],
             left: 14,
             style: 0
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