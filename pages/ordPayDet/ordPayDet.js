import { getOrderInfo, createOrder } from '../../api/api.js'
import { navigateGoUtil, getDateTextUtil } from '../../utils/util.js'
let _this, app;
Page({
    data: {
        screen: true,
        orderInfo: false, //订单信息
        payInfo: false, //付款信息
    },
    onLoad(options) {
        _this = this, app = getApp();
        _this.setData({
            orderInfo: options
        })
    },
    onShow() {
        _this.getOrderInfo()
    },
    //跳转页面处理函数
    navigateTo(e) {
        if (app.isClick()) {
            navigateGoUtil('navigateTo', e.currentTarget.dataset.u,
                e.currentTarget.dataset.o || '')
        }
    },

    createOrder() {
      let obj = {
        parkingId: '',
        parkAmount: 0,
        couponType: 0,
        carId: ''
      }
      createOrder(obj).then(res => {
        if (res.code == 200) {

        }
      })
    },
    //获取支付明细信息
    getOrderInfo() {
        getOrderInfo({
            orderNo: _this.data.orderInfo.oderNo
        }).then(data => {
            if (data.code == 200) {
                let r = data.rs;
                r.parkStartText = r.parkStartTime ? getDateTextUtil(parseInt(r.parkStartTime) * 1000) : false
                r.parkEndText = r.parkEndTime ? getDateTextUtil(parseInt(r.parkEndTime) * 1000) : false
                r.parkTime = ~~((r.parkEndTime - r.parkStartTime) / 3600) + '时' + ~~((r.parkEndTime - r.parkStartTime) % 3600 / 60) + '分' + (r.parkEndTime - r.parkStartTime) % 60 + '秒';
                ['parkCouponAmount', 'discountAmount', 'realPayAmount', 'parkAmount'].forEach(item => {
                    r[item] = parseFloat(r[item] || 0).toFixed(2);
                })
                r.shouldPayment = (parseFloat(r.thankFee || 0) + parseFloat(r.delayMoney || 0) + parseFloat(r.appointmentMoney || 0)).toFixed(2); // 合计预约费
                r.actualPayment = (parseFloat(r.shouldPayment || 0) - parseFloat(r.appointCouponAmount || 0)).toFixed(2); //实际支付
                _this.setData({
                    payInfo: r
                })
                if (_this.data.screen) {
                    _this.setData({
                        screen: false
                    })
                }
            }
        })
    }
})