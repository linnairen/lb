import { setCanceOrder, setCanceConfirm, getCancelState, setCanceText, getServerTime } from '../../api/api.js'
import { navigateGoUtil, getDateTextUtil } from '../../utils/util.js'
let _this, COUPNUM, pages, app;
Page({
    data: {
        screen: true,
        disabled: false,
        orderInfo: '', //订单编号
        causeText: '', //其他原因说明
        causeList: [], //取消的原因
    },
    onLoad(options) {
        _this = this, COUPNUM = 0, pages = getCurrentPages(), app = getApp();
        _this.setData({
            orderInfo: options
        })
        _this.setCanceText()
    },
    //点击取消原因
    isActive(e) {
        let i = e.currentTarget.dataset.i;
        let c = _this.data.causeList;
        c[i].isActive = !c[i].isActive;
        _this.setData({
            causeList: c
        })
        _this.isDisabled()
    },
    //输入框失去焦点或者点击完成触发事件
    inputChange(e) {
        _this.setData({
            causeText: e.detail.value
        })
        _this.isDisabled()
    },
    //取消按钮是否可点击
    isDisabled() {
        let t = false;
        let c = _this.data.causeList;
        for (let i = 0; i < c.length; i++) {
            if (c[i].isActive) {
                t = true;
                break;
            }
        }
        _this.setData({
            disabled: _this.data.causeText != '' || t ? true : false
        })
    },
    cancelSet() {
        wx.navigateBack()
    },
    //小程序获取取消原因标签
    setCanceText() {
        setCanceText().then(data => {
            if (data.code == 200) {
                data.rs.forEach(key => {
                    key.isActive = false
                })
                _this.setData({
                    causeList: data.rs
                })
                if (_this.data.screen) {
                    _this.setData({
                        screen: false
                    })
                }
            }
        })
    },
    //确认取消订单
    setCanceOrder() {
        let d = {
            oderNo: _this.data.orderInfo.oderNo,
            reason: ''
        };
        let c = _this.data.causeList;
        let t = _this.data.causeText.skyString();
        for (let i = 0; i < c.length; i++) {
            if (c[i].isActive) {
                d.reason = d.reason + c[i].tagName + ',';

            }
        }
        if (t != '') {
            d.reason += t;
        } else {
            d.reason = d.reason.substring(0, d.reason.lastIndexOf(','));
        }
        setCanceOrder(d).then(data => {
            if (data.code == 200) {
                if (data.rs.submitState == 1) {
                    wx.showLoading({
                        title: '取消订单',
                        mask: true
                    })
                    setTimeout(() => {
                        _this.getCancelState(d)
                    }, 1000)
                } else if (data.rs.submitState == 0) {
                    getServerTime().then(res => {
                        var over = (res.rs - data.rs.grabTime > 180)
                        _this.setCanceConfirm(d, over)
                    })
                }
            }
        })
    },
    //如果有人接单.确认是否继续
    setCanceConfirm(d, over) {
        wx.showModal({
            title: '提示',
            content: over ? '您本次取消订单有责，取消将需要支付预约费，是否继续?' : '您的订单现在已被接单, 是否前往查看 ? ',
            cancelText: over ? '继续' : '取消订单',
            cancelColor: '#999999',
            confirmText: over ? '取消' : '去查看',
            confirmColor: '#ff9938',
            success: function(res) {
                if (res.confirm) {
                    wx.navigateBack()
                } else if (res.cancel) {
                    wx.showLoading({
                        title: '取消订单',
                        mask: true
                    })
                    setCanceConfirm(d).then(data => {
                        if (data.code == 200) {
                            setTimeout(() => {
                                _this.getCancelState(d)
                            }, 1000)
                        }
                    })
                }
            }
        })
    },
    //查询取消订单是否成功
    getCancelState(d) {
        getCancelState({ oderNo: d.oderNo }).then(data => {
            console.log(data)
            if (data.code == 200) {
                if (data.rs.state == 0) {
                    setTimeout(() => {
                        //查询超过5次 默认取消失败
                        if (COUPNUM >= 5) {
                            wx.showToast({
                                title: '取消失败',
                                image: '../../images/02.png',
                                mask: true
                            })
                            return COUPNUM = 0
                        } else {
                            _this.getCancelState(d)
                            COUPNUM++
                        }
                    }, 500)
                } else if (data.rs.state == 1) {
                    app.globalData.billOrder = true;
                    pages[pages.length - 2].setData({
                        oderNo: d.oderNo
                    })
                    wx.hideLoading()
                    wx.navigateBack()
                } else {
                    wx.hideLoading()
                    wx.showToast({
                        title: '取消失败',
                        image: '../../images/02.png',
                        mask: true
                    })
                }
            }
        })
    }
})