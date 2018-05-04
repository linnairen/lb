// pages/login/login.js
import { des, hexToString, base64encode } from '../../utils/des.js'
import { getMessgCode, setMessgCode } from '../../api/api.js'
let _this, timer, timerGo, pages, app;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    agree: true,
    mobile: '',
    code: '',
    count: 0,
    phoneOk: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this, pages = getCurrentPages(), app = getApp();
  },
  //切换是否同意协议
  changeAgree () {
    this.setData({
      agree: !this.data.agree
    })
  },
  //检测手机号
  checkMobile (mobile) {
    return /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile)
  },
  //输入事件
  input (e) {
    if (e.currentTarget.dataset.phone){
      this.setData({
        mobile: e.detail.value,
        phoneOk: _this.checkMobile(e.detail.value)
      })
    }
    else if (e.currentTarget.dataset.code){
      this.setData({
        code: e.detail.value
      })
    }
  },
  //请求头加当前时间戳进行加密  //当定时器结束后,点击重新获取验证码,倒计时重新赋值为60秒,并且重新获取验证码,然后再次启动定时器
  getMessgCode() {
    if(!this.data.phoneOk){
      wx.showToast({
        title: '手机号码不正确',
        icon: 'none'
      })
      return
    }
    else{
      wx.showLoading({
        title: '获取验证码',
      })
    }
    if (!app.globalData.count) {
      getMessgCode({
        type: 'mobile',
        mobile: _this.data.mobile,
        pushType: 2
      }, {
          skytknAnn: base64encode(des('Jdhgqwiczuq36%32hz*2$FRa', app.globalData.header.skytkn + new Date().getTime(), 1, 1, '01234567', 1))
      }).then(data => {
        wx.hideLoading()
        clearTimeout(timer)
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
  //登录时的效验
  setMessgCode() {
    let d = {
      clientType: 5,
      captcha: _this.data.code,
      mobile: _this.data.mobile,
      loginType: 'sms'
    }
    if (app.globalData.fromInvite != null) {
      d.inviteCode = app.globalData.fromInvite
    }
    setMessgCode(d).then(data => {
      if (data.code == 200 && data.rs) {
        if (!data.rs.registCoupon) {
          _this.codeValid('登陆成功')
        } else {
          _this.setData({
            registCoupon: data.rs.registCoupon
          })
          _this.codeValid()
        }
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
      wx.switchTab({
        url: '/pages/home/home',
      })
    }, msg ? 1500 : 10000)
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
  },
  shadePanelShow() {
    clearTimeout(timerGo)
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    try {
      old = wx.getStorageSync('mobile') || '';
      if (old) {
        _this.setData({
          mobile: old,
          phoneOk: _this.checkMobile(old)
        })
      }
    } catch (e) { }
  }
})