// pages/pay/pay.js
import QQMapWX from '../../libs/qqmap-wx-jssdk.min.js'
import { getParkingAndCar, createOrder, setInitePay, getPayState, getCanUseList } from "../../api/api.js"
import { navigateGoUtil } from '../../utils/util.js'
var _this, COUPNUM, MapApi,timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plateNo: '',
    userCarId: '',
    cityName: '',
    plateNoArray: null,
    pageData: {},
    parkingId: '',
    totalMoney: 0,
    couponNum: 0,
    discountMoney: 0,
    showPlate: false,
    plateIndex: -1,
    couponType: 1,
    couponPark: null,
    realMoney: "0.00"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(decodeURIComponent(options.parkingId))
    MapApi = new QQMapWX({ key: 'DCRBZ-DSZKS-ADGOO-6S3U2-IW4OT-IDBWZ' });
    _this = this
    if (options.scene){
      this.setData({
        parkingId: decodeURIComponent(options.scene)
      })
      this.getPos()
    }
    else{
      this.setData({
        parkingId: decodeURIComponent(options.parkingId),
        cityName: options.cityName
      })
    }
    wx.showLoading({
      title: '正在加载停车场数据',
    })
  },
  //获取可用优惠券第一个
  getCanUseList(val) {
    getCanUseList({
      parkingId: this.data.parkingId,
      parkAmount: val || 0
    }).then(res => {
      if(res.code == 200){
        if(res.rs.canUse[0]){
          _this.setData({
            couponPark: res.rs.canUse[0]
          })
        }
        else{
          _this.setData({
            couponPark: null
          })
        }
        _this.calReal()
      }
    })
  },
  getCoupon () {
    wx.setStorageSync('o', {
      parkingId: this.data.parkingId,
      parkAmount: this.data.totalMoney,
      couponPark: this.data.couponPark
    })
    navigateGoUtil('navigateTo', 'coupon', {})
  },
  //定位
  getPos () {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        MapApi.reverseGeocoder({
          location: { latitude: res.latitude, longitude: res.longitude },
          success: res => {
            _this.setData({
              cityName: res.result.ad_info.city
            })
          }
        })
      }
    })
  },
  //获取停车场信息及车辆信息
  getParkingAndCar () {
    getParkingAndCar({
      parkingId: this.data.parkingId
    }).then(res => {
      // console.log(res)
      if(res.code == 200){
        if(res.rs.carList.length == 0){ wx.navigateTo({ url: '/pages/plate/plate' })}
        else{
          res.rs.carList.forEach((item,index) => {
            if (item.isChecked){
              this.setData({ plateNo: item.plateNo, userCarId: item.tid })
            }
          })
        }
        wx.hideLoading()
        this.setData({ plateNoArray: res.rs.carList, pageData: res.rs.parkingInfo })
      }
    })
  },
  //输入合计金额
  inputMoney (e) {
    if (isNaN(Number(e.detail.value))){ return }
    this.setData({
      totalMoney: e.detail.value,
      discountMoney: (e.detail.value * (1 - (this.data.pageData.discount || 0))).toFixed(2) || 0
    })
    clearTimeout(timer)
    timer = setTimeout(() => {
      _this.getCanUseList(e.detail.value)
    },1000)
    this.calReal()
  },
  //显示修改车牌
  selOn() {
    this.setData({
      showPlate: true
    })
  },
  //隐藏修改车牌
  selCancel () {
    this.setData({
      showPlate: false
    })
  },
  //车牌处理函数
  plateIndexChange(e) {
    let d = e.currentTarget.dataset;
    if (d.next) {
      let pna = _this.data.plateNoArray;
      let pdx = _this.data.plateIndex;
      _this.setData({
        userCarId: pna[pdx].tid,
        plateNo: pna[pdx].plateNo
      })
      _this.selCancel()
      // _this.isLoading(3, 900)
    } else {
      _this.setData({
        plateIndex: d.i
      })
    }
  },
  calReal () {
    this.setData({
      realMoney: (this.data.totalMoney - (this.data.couponType == 1 ? this.data.discountMoney : (this.data.couponPark ? this.data.couponPark.couponPrice : 0))).toFixed(2)
    })
  },
  //生成订单
  createOrder () {
    wx.showLoading({
      title: '正在生成订单',
    })
    createOrder ({
      parkingId: this.data.parkingId,
      parkAmount: this.data.totalMoney || 0,
      couponType: this.data.couponType,
      parkCouponId: this.data.couponPark ? this.data.couponPark.tid : -1,
      carId: this.data.userCarId,
      cityName: this.data.cityName,
      destinationGaodeLng: this.data.pageData.gaodeLng,
      destinationGaodeLat: this.data.pageData.gaodeLat
    }).then(res => {
      if(res.code == 200){
        this.setInitePay(res.rs)
      }
    })
  },
  //切换优惠方式
  couponChange (e) {
    this.setData({
      couponType: e.detail.value
    })
    this.calReal()
  },
  //调起微信支付
  setInitePay(oderNo) {
    wx.showLoading({
      title: '准备支付',
      mask: true
    })
    wx.login({
      success: res => {
        setInitePay({ method: 'smallRoutine', oderNo: oderNo, code: res.code }).then(data => {
          if (data.code == 200) {
            wx.requestPayment({
              'timeStamp': data.rs.timeStamp,
              'nonceStr': data.rs.nonceStr,
              'package': data.rs.wxpackage,
              'signType': data.rs.signType,
              'paySign': data.rs.sign,
              'success': res => {
                wx.showLoading({
                  title: '获取支付状态...',
                  mask: true
                })
                _this.getPayState(oderNo)
              },
              'fail': res => {
                wx.hideLoading()
                wx.showToast({
                  title: res.errMsg == 'requestPayment:fail cancel' ? '取消发单' : '支付失败',
                  image: '../../images/02.png',
                  mask: true
                })
              }
            })
          }
        })
      }
    })
  },
  //查询订单发送是否成功
  getPayState(oderNo) {
    getPayState({ oderNo: oderNo }).then(data => {
      if (data.code == 200){
        if (data.rs.state == 1) {
          _this.billNav(oderNo)
        } else if (data.rs.state == 0) {
          setTimeout(() => {
            //查询超过5次 默认发单成功
            if (COUPNUM == 5) {
              _this.billNav(oderNo)
              return COUPNUM = 0
            } else {
              _this.getPayState(oderNo)
              COUPNUM++
            }
          }, 500)
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '支付失败',
            image: '../../images/02.png',
            mask: true
          })
        }
      }
    })
  },
  //订单发送成功跳转路由
  billNav(oderNo) {
    wx.showLoading({
      title: '跳转中...',
      mask: true
    })
    wx.reLaunch({
      url: '/pages/indent/indent?oderNo=' + oderNo,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getParkingAndCar()
    this.calReal()
  }
})