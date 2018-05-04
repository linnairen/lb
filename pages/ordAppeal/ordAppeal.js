import { api, getCompDet, getOrderInfo, getQiniuToken, getCompAbnormal, getAbnOrderText } from '../../api/api.js'
import { setUpload } from '../../api/upload.js'
import { getDateTextUtil, navigateGoUtil } from '../../utils/util.js'
let _this, app;
Page({
    data: {
        screen: true,
        disabled: false,
        token: '',
        orderInfo: false, //申诉的订单信息
        payInfo: false, //付款信息
        appealInfo: true, //申诉查询到的申诉信息
        reason: null, //原因说明
        reamrk: null, //其他原因说明
        imgList: [],
        causeList: [],

    },
    onLoad(options) {
        _this = this, app = getApp();
        _this.setData({
            orderInfo: options
        })
        _this.getOrderInfo()
    },
    //获取七牛token
    getQiniuToken() {
        getQiniuToken({ type: 1 }).then(data => {
            if (data.code == 200) {
                _this.setData({
                    token: data.rs
                })
            }
        })
    },
    //获取支付明细信息
    getOrderInfo() {
        getOrderInfo({
            orderNo: _this.data.orderInfo.oderNo,
        }).then(data => {
            if (data.code == 200) {
                let r = data.rs;
                r.preArrivalText = r.preArrivalTime ? getDateTextUtil(r.preArrivalTime * 1000) : false;
                r.grabText = r.grabTime ? getDateTextUtil(r.grabTime * 1000) : false;
                r.appointCoupon = (parseFloat(r.thankFee || 0) + parseFloat(r.delayMoney || 0) + parseFloat(r.appointmentMoney || 0)).toFixed(2); // 合计预约费
                if (r.parkAmount) {
                    r.parkAmount = parseFloat(r.parkAmount).toFixed(2); //停车费
                }
                if (r.appointCouponAmount) {
                    r.appointCouponAmount = parseFloat(r.appointCouponAmount).toFixed(2); //预约费优惠金额
                }
                if (r.parkCouponAmount) {
                    r.parkCouponAmount = parseFloat(r.parkCouponAmount).toFixed(2); //停车优惠金额
                }
                r.shouldPayment = parseFloat(r.appointCoupon || 0) + parseFloat(r.parkAmount || 0); //本应支付
                r.discountAmount = parseFloat(r.appointCouponAmount || 0) + parseFloat(r.parkCouponAmount || 0); // 优惠总金额
                r.actualPayment = (parseFloat(r.shouldPayment || 0) - parseFloat(r.discountAmount)).toFixed(2); //实际支付
                _this.setData({
                    payInfo: r
                })
                if (r.lifeCycle == -2) {
                    _this.getCompDet()
                } else {
                    _this.setData({
                        appealInfo: false
                    })
                    _this.getAbnOrderText()
                    _this.getQiniuToken()
                }
            }
        })
    },
    //获取申诉订单标签
    getAbnOrderText() {
        getAbnOrderText().then(data => {
            if (data.code == 200) {
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
    //查询申诉订单
    getCompDet() {
        getCompDet({ oderNo: _this.data.orderInfo.oderNo }).then(data => {
            if (data.code == 200) {
                if (data.rs.imgList && !_this.data.imgList.length) {
                    data.rs.imgList.forEach(item => {
                        _this.data.imgList.push(item.imgUrl)
                        _this.setData({
                            imgList: _this.data.imgList
                        })
                    })
                }
                _this.setData({
                    appealInfo: data.rs
                })
                if (_this.data.screen) {
                    _this.setData({
                        screen: false
                    })
                }
            }
        })
    },
    //点击原因
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
            reamrk: e.detail.value || null
        })
        _this.isDisabled()
    },
    //按钮是否可点击
    isDisabled() {
        let t = false;
        let c = _this.data.causeList;
        let s = '';
        for (let i = 0; i < c.length; i++) {
            if (c[i].isActive) {
                s += (c[i].tagName + '  ');
            }
        }
        if (_this.data.reamrk || s) {
            t = true;
        }
        _this.setData({
            reason: s || null,
            disabled: t
        })
    },
    //图片被点击
    imageClick(e) {
        wx.showActionSheet({
            itemList: ['查看', '重传', '删除'],
            itemColor: '#FF9938',
            success: res => {
                if (res.tapIndex == 0) {
                    _this.previewImage(e.currentTarget.dataset.i)
                } else if (res.tapIndex == 1) {
                    _this.chooseImage(e)
                } else if (res.tapIndex == 2) {
                    _this.data.imgList.splice(e.currentTarget.dataset.i, 1)
                    _this.setData({
                        imgList: _this.data.imgList
                    })
                }
            }
        })
    },
    //选择照片
    chooseImage(e) {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: res => {
                _this.setUpload(
                    res.tempFilePaths[0],
                    res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('/') + 1),
                    e.currentTarget.dataset.i)
            }
        })
    },
    //预览照片
    previewImage(i) {
        wx.previewImage({
            current: _this.data.imgList[i.currentTarget ? i.currentTarget.dataset.i : i],
            urls: _this.data.imgList
        })
    },
    //上传图片
    setUpload(filePath, fileName, i) {
        setUpload({
            qiniuToken: _this.data.token,
            filePath: filePath,
            fileName: fileName
        }).then(data => {
            if (i || i == 0) {
                _this.data.imgList.splice(i, 1, api.img + JSON.parse(data).key)
            } else {
                _this.data.imgList.push(api.img + JSON.parse(data).key)
            }
            _this.setData({
                imgList: _this.data.imgList
            })
        })
    },
    //申报异常订单
    getCompAbnormal() {
        if (app.isClick()) {
            wx.showLoading({
                title: '申报中...',
                mask: true
            })
            getCompAbnormal({
                oderNo: _this.data.orderInfo.oderNo,
                reason: _this.data.reason || null,
                reamrk: _this.data.reamrk || null,
                imgs: _this.data.imgList.join()
            }).then(data => {
                if (data.code == 200) {
                    wx.hideLoading()
                    wx.showToast({
                        title: '已提交',
                        image: '../../images/01.png',
                        mask: true
                    })
                    setTimeout(() => {
                        navigateGoUtil('switchTab', 'indent')
                    }, 500)
                }
            })
        }
    }
})