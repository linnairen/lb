import QQMapWX from '../../libs/qqmap-wx-jssdk.min.js'
import { getSeekParking, setSaveOrder, getPlateNum, getAccessFee, setAccessFee, getLineItem, getServerTime, getPointLine, UploadFormId, setOrderSuccess, setInitePay } from '../../api/api.js'
import { Custom, navigateGoUtil, getDateTextUtil, getTimeDataUtil, formatNumUtil, formatTimeUtil } from '../../utils/util.js'
let MapApi, wxMap, _this, COUPNUM, timer, timerGet, PlateGet, once, pages, app;
Page({
    data: {
        none: false,
        isLoading: [true, false, false, false],
        bottom: [-568, -568, -568, -568], //控制选择器弹出与隐藏 定位高度
        starting: '', //起点坐标
        options: false, //目标地点信息
        markers: [], //地图标记
        points: [], //地图视野
        content: '向当前地点发单', //终点标记上使用的文字
        swiperArray: [], //附近停车地点列表
        swiperIndex: 0, //附近停车地点选中下标
        parkAmount: '', //搜索到停车场数量
        defaultRange: '', //搜索停车场范围
        islocation: false, //是否显示定位小标
        parkFee: '', //tingche费
        plateNoArray: false, //车牌号列表
        plateIndex: 0, //车牌号高亮下标
        userCarId: '', //选中的车牌tid 
        plateNo: '', //选中的车牌号
        timeList: [], //总时间数据数组
        timeArray: [], //使用中时间数据数组
        timeIndex: [0, 0, 0], //时间被选中下标
        preArrivalText: '预计到达时间', //预计到达时间显示文字
        preArrivalTime: 0, //预计到达时间时间戳
        feeArray: [], //加急费列表 
        feeIndex: 0, //选中加急费 默认第一项
        untFeeArray: ['0元'], //其他加急费列表
        untFeeIndex: [0], //其他加急费选中下标
        thankFee: '0.00', //最终加急费
        orderInfo: false, //重新发单需要此数据
        lastPrice: '0.00',
        couponPrice: '0.00',
        couponUserTid: null,
        isDetail: false,
        actuallyPaid: '0.00',
        totalPaid: '0.00',
        preArrivalFee: '0.00'
    },
    onLoad(options) {
        _this = this, COUPNUM = 0, pages = getCurrentPages(), once = true, app = getApp(), wxMap = wx.createMapContext('wxMap'), MapApi = new QQMapWX({ key: 'DCRBZ-DSZKS-ADGOO-6S3U2-IW4OT-IDBWZ' });
        _this.firstTime(options)
    },
    onShow() {
        _this.isLoading(3, true)
        if (!once) {
            _this.getPlateNum() //检查有没有车牌号
        }
    },
    onHide() {
        _this.popUpChange()
        clearTimeout(PlateGet)
    },
    onUnload() {
        clearTimeout(timerGet)
        clearTimeout(PlateGet)
    },
    //初次加载处理函数  判断传值没有oderNo为新建订单 否则为重新发单
    firstTime(options) {
        _this.getTimeData()
        getServerTime().then(data => {
            let nt = getTimeDataUtil(new Date((data.rs + 300) * 1000))
            _this.setData({
                timeList: nt[0],
                timeArray: nt[1]
            })
            if (options.oderNo) {
                _this.isLoading(0, true)
                let no = {
                    latitude: options.destinationGaodeLat,
                    longitude: options.destinationGaodeLng,
                    detailName: options.destination,
                    thankFee: parseFloat(options.thankFee).toFixed(2),
                    cityName: options.cityName,
                    address: options.address
                }
                _this.setData({
                    orderInfo: options
                })
                _this.setDestMark(no)
                _this.getTimeNed(no)
            } else {
                _this.getSeekParking(options) //判断有没有停车场
            }
        })
    },
    //判断有没有停车场 rs返回1：代表附近800M有车位  rs返回0： 代表附近800M没有车位， 并且附近5km内没有推荐目的地  rs返回一下数据： 代表附近5km内的推荐目的地（ 可能有多个）
    getSeekParking(options) {
        getSeekParking({
            longitude: options.longitude,
            latitude: options.latitude,
            content: options.detailName
        }).then(data => {
            if (data.code == 200) {
                _this.isLoading(0, data.rs == 1 ? true : 1800)
                if (data.rs == 0) {
                    _this.setData({
                        none: true,
                        markers: [{
                            id: 0,
                            latitude: parseFloat(options.latitude),
                            longitude: parseFloat(options.longitude),
                            iconPath: '../../images/41.png',
                            width: 22.8,
                            height: 37.2
                        }]
                    })
                    _this.setPoints(options)
                } else if (data.rs == 1) {
                    _this.setDestMark(options)
                    _this.getTimeNed(options)
                } else {
                    _this.setData({
                        swiperArray: data.rs
                    })
                    _this.swiperChange({
                        type: 'change',
                        detail: { current: 0 }
                    })
                }
            }
        })
    },
    // 再试试
    trial() {
        wx.navigateBack()
    },
    //判断有没有车牌号
    getPlateNum() {
        getPlateNum().then(data => {
            if (data.code == 200) {
                let a = _this.data.plateNoArray;
                let b;
                if (data.rs) {
                    b = data.rs;
                    for (let i = 0; i < data.rs.length; i++) {
                        if (data.rs[i].isChecked) {
                            _this.setData({
                                plateNoArray: data.rs,
                                userCarId: _this.data.orderInfo ? _this.data.orderInfo.userCarId : data.rs[i].tid,
                                plateNo: _this.data.orderInfo ? _this.data.orderInfo.plateNumber : data.rs[i].plateNo
                            })
                            break;
                        }
                    }
                    _this.isLoading(3, 900)
                    if (!a && b) {
                        setTimeout(() => {
                            _this.popUpChange(0)
                        }, 900)
                    }
                } else {
                    PlateGet = setTimeout(() => {
                        navigateGoUtil('navigateTo', 'plate')
                    }, 2000)
                }
                if (once) {
                    once = false;
                }
            }
        })
    },
    //定时获取时间数据
    getTimeData() {
        clearTimeout(timerGet)
        getServerTime().then(data => {
            let t = new Date((data.rs + 300) * 1000);
            if ((!t.getMinutes() % 5 && t.getSeconds() <= 20) ||
                (t.getMinutes() % 5 == 4 && t.getSeconds() >= 50) ||
                !_this.data.timeArray.length) {
                let nt = getTimeDataUtil(t)
                _this.setData({
                    timeList: nt[0],
                    timeArray: nt[1]
                })
            }
            timerGet = setTimeout(() => {
                _this.getTimeData()
            }, 30000)
        })
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
                    isLoading: [false, false, false, false]
                })
            }, 900)
        }
    },
    //获取行驶时间 并设置默认预计到达时间 顺便把默认地址设置了
    getTimeNed(options) {
        _this.setData({
            options: options ? options : false
        })
        MapApi.calculateDistance({
            mode: 'driving',
            to: options.latitude + ',' + options.longitude,
            success: res => {
                let nt = new Date(Math.ceil((Date.parse(new Date()) + res.result.elements[0].duration * 1000) / 300000) * 300000);
                let adxs = [0, 0, 0];
                _this.getIndexNum(adxs, 0, 0, [
                    nt.getFullYear(),
                    nt.getMonth() + 1,
                    nt.getDate()
                ].map(formatNumUtil).join('-'))
                _this.getIndexNum(adxs, 1, adxs[0] == 0 ? 1 : 3, 'T' + formatNumUtil(nt.getHours()) + ':')
                _this.getIndexNum(adxs, 2, adxs[0] == 0 && adxs[1] == 0 ? 2 : 4, formatNumUtil(nt.getMinutes()) + ':00+08:00')
                _this.timeArrayChange({
                    detail: {
                        value: adxs
                    }
                })
                _this.setData({
                    islocation: true
                })
                _this.getAccessFee() //获取预约费
            },
            fail: res => {
                _this.timeArrayChange({
                    detail: {
                        value: [0, 0, 0]
                    }
                })
                _this.setData({
                    islocation: true
                })
                _this.getAccessFee() //获取预约费
            }
        })
    },
    //获取下标 配合设置默认预计到达时间
    getIndexNum(adxs, adx, ldx, nv) {
        for (let i in _this.data.timeList[ldx]) {
            if (_this.data.timeList[ldx][i].v == nv) {
                return adxs[adx] = parseInt(i)
            }
        }
    },
    //推荐停车地点swiper滑动时触发事件和点击确定处理函数
    swiperChange(e) {
        let na = _this.data.swiperArray;
        let nm = [];
        let arr, sa, sdx;
        if (e.type == 'change') {
            _this.setData({
                swiperArray: na,
                swiperIndex: e.detail.current
            })
            arr = Object.assign(na);
            arr.push(na[e.detail.current])
            arr.splice(e.detail.current, 1)
            for (let i = 0; i < arr.length; i++)
                if (i == arr.length - 1) {
                    nm.push({
                        id: i,
                        latitude: na[i].latitude,
                        longitude: na[i].longitude,
                        iconPath: '../../images/42.png',
                        width: 21,
                        height: 25.5,
                        callout: {
                            content: na[i].detailName,
                            color: '#ffffff',
                            fontSize: 14,
                            borderRadius: 16,
                            bgColor: '#5D657C',
                            padding: 6,
                            display: 'ALWAYS',
                            textAlign: 'center'
                        }
                    })
                } else {
                    nm.push({
                        id: i,
                        latitude: na[i].latitude,
                        longitude: na[i].longitude,
                        iconPath: '../../images/42.png',
                        width: 21,
                        height: 25.5,
                        label: {
                            content: na[i].detailName,
                            color: '#5D657C'
                        }
                    })
                }
        }
        sa = _this.data.swiperArray;
        sdx = _this.data.swiperIndex;
        if (e.type == 'tap' && app.isClick()) {
            _this.isLoading(0, true)
            _this.getTimeNed(sa[sdx])
            _this.setDestMark(sa[sdx])
        } else {
            _this.setData({
                markers: nm,
                points: nm
            })
        }
    },
    //选择车牌号处理函数
    plateIndexChange(e) {
        let d = e.currentTarget.dataset;
        if (d.next) {
            let pna = _this.data.plateNoArray;
            let pdx = _this.data.plateIndex;
            _this.setData({
                userCarId: pna[pdx].tid,
                plateNo: pna[pdx].plateNo
            })
            _this.setPopupCancel()
            _this.isLoading(3, 900)
        } else {
            _this.setData({
                plateIndex: d.i
            })
        }
    },
    //获取预约费以及感谢费
    getAccessFee() {
        getAccessFee({
            preArrivalTime: _this.data.preArrivalTime / 1000 || '',
            lng: _this.data.options.longitude,
            lat: _this.data.options.latitude
        }).then(data => {
            if (data.code == 200) {
                if (data.rs) {
                    let untFeeArray = [];
                    for (let i = 0; i <= data.rs.other; i++) {
                        untFeeArray.push(i + '元')
                    }
                    _this.setData({
                        feeArray: data.rs.lists,
                        parkAmount: data.rs.parkAmount,
                        defaultRange: data.rs.defaultRange,
                        parkFee: data.rs.parkFee,
                        preArrivalFee: parseFloat(data.rs.preArrivalFee).toFixed(2),
                        untFeeArray: untFeeArray,
                        lastPrice: parseFloat(data.rs.lastPrice).toFixed(2),
                        couponPrice: parseFloat(data.rs.couponPrice || 0).toFixed(2),
                        couponUserTid: data.rs.couponUserTid || 0,
                        actuallyPaid: (parseFloat(data.rs.lastPrice) + parseFloat(_this.data.thankFee || 0)).toFixed(2),
                        totalPaid: (parseFloat(data.rs.preArrivalFee) + parseFloat(_this.data.thankFee || 0)).toFixed(2)
                    })
                }
            }
            _this.isLoading(0, false)
            if (once) {
                _this.getPlateNum()
            }
        })
    },
    //选择器取消处理函数
    setPopupCancel() {
        let b = _this.data.bottom;
        _this.setData({
            feeIndex: 0,
            plateIndex: !b[3] ? 0 : _this.data.plateIndex
        })
        _this.popUpChange(!b[2] ? 1 : false)
    },
    //改变选择器弹窗
    popUpChange(e) {
        let p = Custom.isObject(e) ? e.currentTarget.dataset.p : e;
        let b = [-568, -568, -568, -568];
        if (p || p === 0) {
            b[p] = 0;
        }
        _this.setData({
            bottom: b
        })
    },
    //时间选择器确定处理函数
    timeIndexChange() {
        let ta = _this.data.timeArray;
        let tdx = _this.data.timeIndex;
        let tn = Date.parse(ta[0][tdx[0]].v + ta[1][tdx[1]].v + ta[2][tdx[2]].v);
        _this.setData({
            preArrivalTime: tn,
            preArrivalText: getDateTextUtil(tn)
        })
        _this.popUpChange(false)
        _this.isLoading(1, 900)
    },
    //时间列表数组匹配
    timeArrayChange(e) {
        let ta = _this.data.timeArray;
        let tl = _this.data.timeList;
        let v = e.detail.value;
        ta[1] = v[0] == 0 ? tl[1] : tl[3];
        ta[2] = v[0] == 0 && v[1] == 0 ? tl[2] : tl[4];
        _this.setData({
            timeArray: ta,
            timeIndex: v
        })
    },
    //加急费选中及确定处理函数
    feeIndexChange(e) {
        if (e.type == 'change') {
            _this.setData({
                untFeeIndex: e.detail.value
            })
        } else {
            let d = e.currentTarget.dataset;
            if (d.i || d.i == 0) {
                if (d.i != 'down') {
                    _this.setData({
                        feeIndex: d.i
                    })
                } else {
                    _this.popUpChange(2)
                }
            } else {
                let fee = d.next ? parseFloat(_this.data.feeArray[_this.data.feeIndex] || 0) : parseFloat(_this.data.untFeeArray[_this.data.untFeeIndex]);
                _this.setData({
                    thankFee: parseFloat(fee).toFixed(2),
                    feeIndex: -1,
                    actuallyPaid: (parseFloat(_this.data.lastPrice) + parseFloat(fee)).toFixed(2),
                    totalPaid: (parseFloat(_this.data.preArrivalFee) + parseFloat(fee)).toFixed(2)
                })
                _this.popUpChange(_this.data.preArrivalTime == 0 ? 0 : false)
                _this.isLoading(2, 900)
            }
        }
    },
    //保存订单
    setSaveOrder(e) {
        _this.UploadFormId(e)
        wx.showLoading({
            title: '准备发单',
            mask: true
        })
        wx.getLocation({
            type: 'gcj02',
            complete: res => {
                _this.popUpChange(!_this.data.preArrivalTime ? 0 : false)
                if (_this.data.preArrivalTime) {
                    let o = _this.data.options;
                    let p = {
                        destinationGaodeLat: parseFloat(o.latitude),
                        destinationGaodeLng: parseFloat(o.longitude),
                        destination: o.detailName,
                        preArrivalTime: _this.data.preArrivalTime / 1000,
                        thankFee: parseFloat(_this.data.thankFee),
                        cityName: o.cityName || _this.data.orderInfo.cityName,
                        userCarId: _this.data.userCarId || _this.data.orderInfo.userCarId,
                        originGaodeLat: parseFloat(res.latitude || 0),
                        originGaodeLng: parseFloat(res.longitude || 0),
                        address: o.address,
                        appointCouponId: _this.data.couponUserTid || 0
                    };
                    if (_this.data.orderInfo) {
                        p.cancelOderNo = _this.data.orderInfo.oderNo;
                    }
                    setSaveOrder(p).then(data => {
                        if (data.code == 200) {
                            app.globalData.billOrder = false;
                            app.globalData.oderNo = data.rs;
                            _this.setInitePay(data.rs)
                        }
                    })
                } else {
                    wx.hideLoading()
                }
            }
        })
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
                                    title: '发单中...',
                                    mask: true
                                })
                                _this.setOrderSuccess(oderNo)
                            },
                            'fail': res => {
                                wx.hideLoading()
                                wx.showToast({
                                    title: res.errMsg ==
                                        'requestPayment:fail cancel' ? '取消发单' : '支付失败',
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
    setOrderSuccess(oderNo) {
        setOrderSuccess({ orderNo: oderNo }).then(data => {
            if (data.code == 200) {
                _this.billNav(oderNo)
            } else if (data.code == 501) {
                setTimeout(() => {
                    //查询超过5次 默认发单成功
                    if (COUPNUM == 5) {
                        _this.billNav(oderNo)
                        return COUPNUM = 0
                    } else {
                        _this.setOrderSuccess(oderNo)
                        COUPNUM++
                    }
                }, 500)
            } else {
                wx.hideLoading()
                wx.showToast({
                    title: '发单失败',
                    image: '../../images/02.png',
                    mask: true
                })
            }
        })
    },
    //订单发送成功跳转路由
    billNav(oderNo) {
        wx.showLoading({
            title: '跳转中...',
            mask: true
        })
        setTimeout(() => {
            wx.hideLoading()
            setTimeout(() => {
                navigateGoUtil('redirectTo', 'state', { oderNo: oderNo })
            }, 200);
        }, 500)
    },
    vaionNav() {
        if (app.isClick()) {
            navigateGoUtil('navigateTo', 'rules')
        }
    },
    // 获取formid
    UploadFormId(e) {
        UploadFormId({ formId: e.detail.formId, type: 1 }).then(data => {})
    },
    //设置终点标记图标
    setDestMark(options) {
        if (options.type) {
            options = _this.data.orderInfo ? _this.data.orderInfo : _this.data.options
        }
        _this.setData({
            markers: [{
                id: 0,
                latitude: parseFloat(options.latitude),
                longitude: parseFloat(options.longitude),
                iconPath: '../../images/41.png',
                width: 22.8,
                height: 37.2,
                callout: {
                    content: _this.data.content,
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 16,
                    bgColor: '#5D657C',
                    padding: 6,
                    display: 'ALWAYS',
                    textAlign: 'center'
                }
            }]
        })
        _this.setPoints(options)
    },
    setPoints(options) {
        _this.setData({
            points: [{
                latitude: parseFloat(options.latitude),
                longitude: parseFloat(options.longitude),
            }, {
                latitude: parseFloat(options.latitude) + 0.0025,
                longitude: parseFloat(options.longitude) + 0.0025
            }, {
                latitude: parseFloat(options.latitude) - 0.0025,
                longitude: parseFloat(options.longitude) - 0.0025
            }, {
                latitude: parseFloat(options.latitude) + 0.0025,
                longitude: parseFloat(options.longitude) - 0.0025
            }, {
                latitude: parseFloat(options.latitude) - 0.0025,
                longitude: parseFloat(options.longitude) + 0.0025
            }]
        })
    },
    isDetail() {
        _this.setData({
            isDetail: !_this.data.isDetail
        })
    },
    //禁止滑动事件
    stop(e) { return e = null }
})