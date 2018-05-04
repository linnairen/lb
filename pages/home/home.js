import QQMapWX from '../../libs/qqmap-wx-jssdk.min.js'
import { getRackOrder, getCityList, getSeekParking, searchParking, getParkingDetail } from '../../api/api.js'
import { navigateGoUtil } from '../../utils/util.js'
let MapApi, wxMap, _this, timer, timerGet, app, once, l, f, b;
Page({
    data: {
        scale: 15, //地图视野缩放等级
        isHint: 'del', //中心点标记文字显示隐藏控制
        width: 0, //中心点标记文字宽度控制
        location: { latitude: 30.29193, longitude: 120.076 }, //用户当前定位坐标
        options: {
            cityName: null,
            detailName: null,
            address: null,
            latitude: 30.29193,
            longitude: 120.076
        }, //目标地点信息
        points: [], //控制视野范围的坐标点
        isExceed: false, //定位的detailName是否需要滚动
        l: { f: 0, b: 0 }, //定位的detailName滚动的位置
        markers: [], //标记点
        showState: 1,
        simpleInfo: {
          orgName: '',
          parkFeeHouly: 0
        },
        detailData: {},
        selectPos: null,
        fromSearch: null
    },
    onLoad(op) {
        _this = this, once = false, app = getApp(), wxMap = wx.createMapContext('wxMap'), MapApi = new QQMapWX({ key: 'DCRBZ-DSZKS-ADGOO-6S3U2-IW4OT-IDBWZ' });
        
        if (op.inviteCode) {
            app.globalData.fromInvite = op.inviteCode
        }
        if (op.address){
            this.setData({
              fromSearch: op,
              location: { latitude: op.latitude, longitude: op.longitude }
            })
        }
        else{
            _this.getLocation()
        }
    },
    onShow() {
        _this.getCenterLocation()
    },
    onReady() {
        _this.watchHome() //监听token请求完成没有
    },
    //联系停车场
    callPark () {
      wx.makePhoneCall({
        phoneNumber: this.data.detailData.parkingTelphone //仅为示例，并非真实的电话号码
      })
    },
    //点击标记
    markerTap(e) {
      if (e.markerId == 999 || this.data.simpleInfo.parkingIdEncr == this.data.markData[e.markerId].parkingIdEncr){
        return
      }
      wx.showLoading()
      this.data.simpleInfo = this.data.markData[e.markerId]
      for (let i = 0; i < this.data.markers.length; i++){
        if (this.data.markers[i].id != 999){
          if (this.data.markers[i].id == e.markerId){
            this.data.markers[i].width = 20
            this.data.markers[i].height = 29
            this.data.markers[i].iconPath = '../../images/203.png'
          }
          else{
            this.data.markers[i].width = 19
            this.data.markers[i].height = 24
            this.data.markers[i].iconPath = '../../images/202.png'
          }
        }
      }
      this.setData({
        simpleInfo: this.data.simpleInfo,
        markers: this.data.markers,
        showState: this.data.showState == 1 ? 3 : this.data.showState
      })
      this.getParkingDetail(this.data.markData[e.markerId].parkingIdEncr)
    },
    //停车场详情
    getParkingDetail (id) {
      getParkingDetail({
        parkingId: id
      }).then(res => {
        if(res.code == 200){
          res.rs.parkingId = id
          _this.setData({
            detailData: res.rs,
            selectPos: id
          })
          wx.hideLoading()
        }
      })
    },
    //获取停车场列表
    searchParking (loc,str) {
      searchParking({
        longitude: loc.longitude,
        latitude: loc.latitude,
        content: str || ''
      }).then(data => {
          if(data.code == 200){
            data.rs && _this.setMark(data.rs)
          }
      })
    },
    //导航至停车场
    openLocationPark() {
      let o = _this.data.detailData
      wx.openLocation({
        latitude: o.gaodeLat,
        longitude: o.gaodeLng,
        name: o.parkingName,
        address: o.parkingAddr,
        scale: 18
      })
    },
    //详细信息开关
    openDetail (e) {
      this.setData({
        showState: e.currentTarget.dataset.state
      })
    },
    //设置marker
    setMark (obj) {
      let marks = []
      for(let i = 0; i < obj.length; i++){
        marks.push({
          id: i,
          latitude: Number(obj[i].gaodeLat),
          longitude: Number(obj[i].gaodeLng),
          iconPath: _this.data.selectPos == obj[i].parkingIdEncr ? '../../images/203.png' : '../../images/202.png',
          width: _this.data.selectPos == obj[i].parkingIdEncr ? 20 : 19,
          height: _this.data.selectPos == obj[i].parkingIdEncr ? 29 : 24,
          callout: {
            content: obj[i].orgName,
            borderRadius: 4,
            padding: 5,
            display: 'ALWAYS',
            textAlign: 'center',
            bgColor: '#758099',
            color: '#ffffff',
            fontSize: 12
          }
        })
      }
      _this.setData({
        markers: marks,
        markData: obj
      })
    },
    //监听token是否请求完成 然后执行钩子函数
    watchHome() {
        if (app.globalData.watchHome) {
            // _this.getRackOrder()
            return
        }
        setTimeout(() => {
            _this.watchHome()
        }, 100)
    },
    //获取正在进行中的订单
    getRackOrder() {
        getRackOrder().then(data => {
            if (data.code == 200) {
                let r = data.rs;
                if (r) {
                    app.globalData.oderNo = r.oderNo;
                    if (!once) {
                        wx.showLoading({
                            title: '恢复订单中...',
                            mask: true
                        })
                        setTimeout(() => {
                            navigateGoUtil('navigateTo', 'state', { oderNo: r.oderNo })
                            wx.hideLoading()
                        }, 1000)
                    }
                }
                once = true;
                _this.setData({
                    orderInfo: r ? true : false
                })
            } else {
                app.globalData.billOrder = null;
                _this.setData({
                    orderInfo: false
                })
            }
        })
    },
    //获取当前所在定位  地图视野会主动移动到当前定位处
    getLocation() {
        wxMap.moveToLocation()
        wx.getLocation({
            type: 'gcj02',
            success: res => {
                _this.setData({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    scale: 15
                })
            }
        })
    },
    // 地图视野发生变化的时候，获取地图中间点坐标
    regionchange(e) {
        if (e.type == 'begin') {
            clearTimeout(timer)
            _this.setData({
                'options.detailName': null,
                'options.address': null,
                isHint: 'del',
                isExceed: false
            })
        } else if (e.type == 'end') {
            timer = setTimeout(() => {
                _this.getCenterLocation()
            }, 300)
        }
    },
    //获取中间点的经纬度设为目的地
    getCenterLocation() {
        wxMap.getCenterLocation({
            success: res => {
                MapApi.reverseGeocoder({
                  location: { latitude: res.latitude, longitude: res.longitude },
                    success: d => {
                        let options = {
                            cityName: d.result.ad_info.city,
                            detailName: d.result.address_reference.landmark_l2.title,
                            address: d.result.address.replace(d.result.ad_info.province + d.result.ad_info.city, ''),
                            latitude: d.result.location.lat,
                            longitude: d.result.location.lng
                        };
                        _this.setData({
                            options: options,
                            width: options.detailName.length * 26 + 46,
                            isHint: 'add',
                            points: []
                        })
                        _this.isFontScrol()
                    }
              })
              _this.searchParking(res)
            }
        })
    },
    //判断是否需要滚动
    isFontScrol() {
        if (_this.data.options.detailName.length * 28 > 328) {
            l = _this.data.options.detailName.length * 28 + 14;
            f = 0;
            b = l;
            _this.setData({
                'l.b': b
            })
            _this.setFontScrol()
        }
        _this.setData({
            isExceed: _this.data.options.detailName.length * 28 > 328
        })
    },
    //设置滚动
    setFontScrol() {
        clearTimeout(timer)
        f -= 1;
        b -= 1;
        _this.setData({
            'l.f': f,
            'l.b': b
        })
        timer = setTimeout(() => {
            if (f == -l) {
                f = l
            }
            if (b == -l) {
                b = l
            }
            _this.setFontScrol()
        }, 30)
    },
    //前往支付页面
    toPay () {
      if (app.isBindState()){
        navigateGoUtil('navigateTo', 'pay', { parkingId: encodeURIComponent(this.data.selectPos), cityName: this.data.options.cityName })
      }
    },
    //并前往发单页面
    navigateToMap() {
        if (app.isClick() && app.isBindState()) {
            if (!_this.data.options.detailName) {
                return wx.showToast({
                    title: '获取定位中...',
                    image: '../../images/02.png',
                    mask: true
                })
            }
            if (app.globalData.billOrder == null) {
                // wx.showModal({
                //     title: '提示',
                //     content: '服务器出错,请重新打开小程序',
                //     confirmText: '好的',
                //     confirmColor: '#ff9938',
                //     success: res => {

                //     }
                // })
                return navigateGoUtil('redirectTo', '404', { length: getCurrentPages().length })
            }
            if (app.globalData.billOrder) {
                navigateGoUtil('navigateTo', 'bill', _this.data.options)
            } else {
                wx.showModal({
                    title: '提示',
                    content: '您有订单未结束',
                    cancelText: '知道了',
                    cancelColor: '#999999',
                    confirmText: '去查看',
                    confirmColor: '#ff9938',
                    success: res => {
                        if (res.confirm) {
                            navigateGoUtil('navigateTo', 'state', {
                                oderNo: app.globalData.oderNo
                            })
                        }
                    }
                })
            }
        }
    }
})