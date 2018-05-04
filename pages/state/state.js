import QQMapWX from '../../libs/qqmap-wx-jssdk.min.js'
import { getRackOrder, setCanceOrder, setAccessFee, getLineItem, setSaapunut, setEndOrder, getServerTime, setContinueTake, setInitePay, getPayState, getShareOrderNo } from '../../api/api.js'
import { Custom, navigateGoUtil, getDateTextUtil, formatNumUtil } from '../../utils/util.js'
let MapApi, wxMap, timer, _this, app, once, COUPNUM;
Page({
    data: {
        oderNo: false, //查询订单信息
        isLoading: [true, false],
        markers: ['', ''], //地图标记
        points: [],
        changeTime: '', //倒计时
        content: '', //终点标记上使用的文字
        feeArray: [], //加急费列表 
        unFeeArray: [], //其他加急费列表
        unFeeIndex: [0], //其他加急费列表选中的下标
        orderInfo: false, //订单信息
        bottom: -468, //弹窗的高度
        details: true, //前往停车场状态下查看停车场详细信息
        tempMsg: false,
        delayedList: [],
        shareNo: false
    },
    onLoad(options) {
        _this = this, app = getApp(), once = true, COUPNUM = 0, wxMap = wx.createMapContext('wxMap'), MapApi = new QQMapWX({ key: 'DCRBZ-DSZKS-ADGOO-6S3U2-IW4OT-IDBWZ' });
        _this.setData({
            oderNo: options.oderNo,
            tempMsg: options.tempMsg ? true : false,
        })
    },
    onShow() {
        _this.getLineItem(_this.data.oderNo)
    },
    onUnload() {
        clearTimeout(timer)
    },
    //取消加载动画
    isLoading(i, t) {
        if (Custom.isNumber(i)) {
            if (Custom.isNumber(t) || t === true) {
                _this.data.isLoading[i] = true;
                _this.setData({
                    isLoading: _this.data.isLoading
                })
            }
            if (Custom.isNumber(t) || t === false) {
                setTimeout(() => {
                    _this.data.isLoading[i] = false;
                    _this.setData({
                        isLoading: _this.data.isLoading
                    })
                }, t === false ? 900 : t)
            }
        } else {
            setTimeout(() => {
                _this.setData({
                    isLoading: [false, false]
                })
            }, 900)
        }
    },
    //查询历史订单详情
    getLineItem(s) {
        getLineItem({ oderNo: s }).then(data => {
            if (data.code == 200) {
                clearTimeout(timer)
                let r = data.rs;
                if (r.preArrivalTime) {
                    r.preArrivalText = getDateTextUtil(r.preArrivalTime * 1000);
                }
                let delayedList = [];
                for (let i = 1; i < 5; i++) {
                    delayedList.push((15 * i) + '分钟：' + (parseFloat(r.parkFeeHourly) / 4 * i).toFixed(2) + '元')
                }
                r.shouldPayment = parseFloat(r.thankFee || 0) + parseFloat(r.delayMoney || 0) + parseFloat(r.appointmentMoney || 0); // 合计预约费
                r.actualPayment = (parseFloat(r.shouldPayment || 0) - parseFloat(r.appointCouponAmount || 0)).toFixed(2); //实际支付
                r.parkNum = app.globalData.parkNum; //被推送的停车场个数
                _this.setData({
                    orderInfo: r,
                    delayedList: delayedList
                })
                _this.setMark()
                if (r.lifeCycle != 0) {
                    wx.setNavigationBarTitle({
                        title: r.lifeCycle == 1 ?
                            '等待支付' : (r.lifeCycle == 2 ? '等待离场' : '已完成')
                    })
                    if (r.lifeCycle == 3) {
                        _this.getShareOrderNo()
                    }
                    clearTimeout(timer)
                } else {
                    getServerTime().then(data => {
                        wx.setNavigationBarTitle({
                            title: _this.data.orderInfo.state == 0 ? '等待接单' : '等待到场'
                        })
                        if (r.delayTime) {
                            r.delayText = getDateTextUtil((parseInt(r.delayTime) * 60 + parseInt(r.preArrivalTime)) * 1000);
                            _this.setData({
                                orderInfo: r
                            })
                        }
                        _this.changeTime(parseInt(r.delayTime || 0) * 60 + parseInt(r.preArrivalTime), data.rs)
                    })
                }
                _this.setPoints()
            }
            if (_this.data.isLoading[0]) {
                _this.isLoading(0, 1800)
            }
        })
    },
    changeTime(time, timeGo) {
        let change = time - timeGo;
        let day = Math.floor(change / 86400);
        let timeh = Math.floor((change % 86400) / 3600) || 0;
        let timem = Math.floor((change % 86400) % 3600 / 60) || 0;
        let times = (change % 86400) % 3600 % 60 || 0;
        if (change <= 0) {
            _this.setData({
                changeTime: '已超时' + Math.floor(((change * -1) / 60) || 1) + '分钟'
            })
            if (once && (_this.data.orderInfo.state == 1 || _this.data.orderInfo.state == 9)) {
                once = false;
                wx.showModal({
                    content: (_this.data.orderInfo.delayMoney ? '延时' : '预约') + '时间已到，您进场了吗？',
                    cancelColor: '#888888',
                    cancelText: '未到达',
                    confirmColor: '#FF9938',
                    confirmText: '确认到达',
                    success: res => {
                        if (res.confirm) {
                            _this.setSaapunut()
                        }
                    }
                })
            }
        } else {
            _this.setData({
                changeTime: (day >= 1 ? (day + '天') : '') + formatNumUtil(timeh) + ':' + formatNumUtil(timem) + ':' + formatNumUtil(times)
            })
        }
        timer = setTimeout(() => {
            _this.changeTime(time, timeGo + 1)
        }, 1000)
    },
    //取消被点击
    canceltap() {
        if (app.isClick()) {
            navigateGoUtil('navigateTo', 'delete', _this.data.orderInfo)
        }
    },
    //跳转页面处理函数
    navigateTo(e) {
        if (app.isClick()) {
            navigateGoUtil('navigateTo', e.currentTarget.dataset.u, e.currentTarget.dataset.p || '')
        }
    },
    previewImage() {
        wx.previewImage({
            urls: [_this.data.orderInfo.parkingImg]
        })
    },
    //点击显示车场详情
    detClick(e) {
        _this.setData({
            details: e.currentTarget.dataset.b == 'true'
        })
    },
    //点击确认到达
    setSaapunut(bool) {
        if (app.isClick() || bool) {
            wx.getSetting({
                success(res) {
                    if (res.authSetting['scope.userLocation']) {
                        wx.getLocation({
                            type: 'gcj02',
                            success: res => {
                                let o = _this.data.orderInfo;
                                setSaapunut({
                                    oderNo: o.oderNo,
                                    latitued: res.latitude,
                                    longitude: res.longitude
                                }).then(data => {
                                    if (data.code == 200) {
                                        setTimeout(() => {
                                            _this.getLineItem(_this.data.oderNo)
                                            const innerAudioContext = wx.createInnerAudioContext()
                                            innerAudioContext.autoplay = true
                                            innerAudioContext.src = 'https://img.cheweiditu.com/20180302164841133.mp3'
                                            innerAudioContext.onPlay(() => {
                                                // console.log('开始播放')
                                            })
                                            innerAudioContext.onError((res) => {
                                                // console.log(res.errMsg)
                                                // console.log(res.errCode)
                                            })
                                        }, 500)
                                    }
                                })
                            }
                        })
                    } else {
                        wx.authorize({
                            scope: 'scope.userLocation',
                            success: res => {
                                _this.setSaapunut(true)
                            },
                            fail: res => {
                                console.log(res)
                                wx.showModal({
                                    title: '提示',
                                    content: '需要地图授权才能确认到场',
                                    cancelText: '稍后',
                                    cancelColor: '#888888',
                                    confirmText: '授权',
                                    confirmColor: '#ff9938',
                                    success: res => {
                                        if (res.confirm) {
                                            wx.openSetting({
                                                success: res => {
                                                    _this.setSaapunut(true)
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    },
    //获取分享单号
    getShareOrderNo() {
        getShareOrderNo({ oderNo: _this.data.oderNo }).then(res => {
            if (res.code == 200) {
                this.setData({
                    shareNo: res.rs
                })
            }
        })
    },
    onShareAppMessage(res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        return {
            title: '快来领取优惠券!',
            path: '/pages/reivCoupon/reivCoupon?oderNo=' + this.data.shareNo,
            imageUrl: '../../images/122.png',
            success: res => {
                // 转发成功
            },
            fail: res => {
                // wx.showToast({
                //     title: '分享失败',
                //     image: '../../images/02.png',
                //     mask: true
                // })
            }
        }
    },
    setContinueTake() {
        wx.showActionSheet({
            itemList: _this.data.delayedList,
            itemColor: '#FF9938',
            success: res => {
                let il = [15, 30, 45, 60];
                setContinueTake({
                    oderNo: _this.data.oderNo,
                    minute: il[res.tapIndex]
                }).then(data => {
                    if (data.code == 200) {
                        if (data.rs.ifNeedPay == 1) {
                            _this.setInitePay(data.rs.payOderNo)
                        }
                    }
                })
            }
        })
    },
    //调起微信支付
    setInitePay(pay) {
        wx.showLoading({
            title: '准备支付',
            mask: true
        })
        wx.login({
            success: res => {
                setInitePay({ method: 'smallRoutine', oderNo: pay, code: res.code }).then(data => {
                    if (data.code == 200)
                        wx.requestPayment({
                            'timeStamp': data.rs.timeStamp,
                            'nonceStr': data.rs.nonceStr,
                            'package': data.rs.wxpackage,
                            'signType': data.rs.signType,
                            'paySign': data.rs.sign,
                            'success': res => {
                                wx.showLoading({
                                    title: '支付中...',
                                    mask: true
                                })
                                setTimeout(() => {
                                    _this.getPayState(pay)
                                }, 1000)
                            },
                            'fail': res => {
                                wx.hideLoading()
                                wx.showToast({
                                    title: res.errMsg == 'requestPayment:fail cancel' ?
                                        '取消支付' : '支付失败',
                                    image: '../../images/02.png',
                                    mask: true
                                })
                            }
                        })
                })
            }
        })
    },
    //查询支付是否成功
    getPayState(pay) {
        getPayState({ oderNo: pay }).then(data => {
            if (data.code == 200) {
                if (data.rs.state == 0) {
                    setTimeout(() => {
                        //查询超过5次 默认支付失败
                        if (COUPNUM == 5) {
                            wx.hideLoading()
                            wx.showToast({
                                title: '支付失败',
                                image: '../../images/02.png',
                                mask: true
                            })
                            return COUPNUM = 0
                        } else {
                            _this.getPayState(pay)
                            COUPNUM++
                        }
                    }, 500)
                } else if (data.rs.state == 1) {
                    wx.hideLoading()
                    wx.showToast({
                        title: '延时成功',
                        image: '../../images/01.png',
                        mask: true
                    })
                    _this.getLineItem(_this.data.oderNo)
                } else {
                    wx.hideLoading()
                    wx.showToast({
                        title: '支付失败',
                        image: '../../images/02.png',
                        mask: true
                    })
                }
            } else {
                wx.hideLoading()
                wx.showToast({
                    title: '支付失败',
                    image: '../../images/02.png',
                    mask: true
                })
            }
        })
    },
    vaionNav() {
        navigateGoUtil('navigateTo', 'web-view', { index: 1 })
    },
    call() {
        wx.makePhoneCall({
            phoneNumber: _this.data.orderInfo.customerTel
        })
    },
    callPark() {
        wx.makePhoneCall({
            phoneNumber: _this.data.orderInfo.telphone
        })
    },
    //设置起点标记图标
    setMark() {
        let o = _this.data.orderInfo;
        let markers;
        if (o.parkGaodeLat) {
            markers = [{
                id: 0,
                latitude: o.destinationGaodeLat,
                longitude: o.destinationGaodeLng,
                iconPath: '../../images/41.png',
                width: 22.8,
                height: 37.2
            }, {
                id: 1,
                latitude: o.parkGaodeLat,
                longitude: o.parkGaodeLng,
                iconPath: '../../images/47.png',
                width: 22.8,
                height: 37.2,
                callout: {
                    content: o.parkingName,
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 16,
                    bgColor: '#5D657C',
                    padding: 6,
                    display: 'ALWAYS',
                    textAlign: 'center'
                }
            }]
        } else {
            markers = [{
                id: 0,
                latitude: o.destinationGaodeLat,
                longitude: o.destinationGaodeLng,
                iconPath: '../../images/41.png',
                width: 22.8,
                height: 37.2,
                callout: {
                    content: o.destination,
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 16,
                    bgColor: '#5D657C',
                    padding: 6,
                    display: 'ALWAYS',
                    textAlign: 'center'
                }
            }]
        }
        _this.setData({
            markers: markers
        })
        _this.setPoints()
    },
    setPoints() {
        let o = _this.data.orderInfo;
        let points = [{
            latitude: parseFloat(o.destinationGaodeLat),
            longitude: parseFloat(o.destinationGaodeLng),
        }, {
            latitude: parseFloat(o.destinationGaodeLat) + 0.0025,
            longitude: parseFloat(o.destinationGaodeLng) + 0.0025
        }, {
            latitude: parseFloat(o.destinationGaodeLat) - 0.0025,
            longitude: parseFloat(o.destinationGaodeLng) - 0.0025
        }, {
            latitude: parseFloat(o.destinationGaodeLat) + 0.0025,
            longitude: parseFloat(o.destinationGaodeLng) - 0.0025
        }, {
            latitude: parseFloat(o.destinationGaodeLat) - 0.0025,
            longitude: parseFloat(o.destinationGaodeLng) + 0.0025
        }]
        if (o.parkGaodeLat) points.push({
            latitude: parseFloat(o.parkGaodeLat),
            longitude: parseFloat(o.parkGaodeLng),
        }, {
            latitude: parseFloat(o.parkGaodeLat) + 0.0025,
            longitude: parseFloat(o.parkGaodeLng) + 0.0025
        }, {
            latitude: parseFloat(o.parkGaodeLat) - 0.0025,
            longitude: parseFloat(o.parkGaodeLng) - 0.0025
        }, {
            latitude: parseFloat(o.parkGaodeLat) + 0.0025,
            longitude: parseFloat(o.parkGaodeLng) - 0.0025
        }, {
            latitude: parseFloat(o.parkGaodeLat) - 0.0025,
            longitude: parseFloat(o.parkGaodeLng) + 0.0025
        })
        _this.setData({
            points: points
        })
    },
    //禁止滑动事件
    stopTouchmove(e) {
        return e = null
    },
    //返回首页
    goHome() {
        navigateGoUtil('switchTab', 'home')
    },
    //导航至目的地
    openLocationDest() {
        let o = _this.data.orderInfo;
        wx.openLocation({
            latitude: o.destinationGaodeLat,
            longitude: o.destinationGaodeLng,
            name: o.destination,
            address: o.address,
            scale: 18
        })
    },
    //导航至停车场
    openLocationPark() {
        let o = _this.data.orderInfo;
        wx.openLocation({
            latitude: o.parkGaodeLat,
            longitude: o.parkGaodeLng,
            name: o.parkingName,
            address: o.parkingAddr,
            scale: 18
        })
    }
})