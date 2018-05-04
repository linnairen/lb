import { getOrderListNew } from '../../api/api.js'
import { navigateGoUtil, getDateTextUtil } from '../../utils/util.js'
let _this, once, app, pages;
Page({
    data: {
        screen: true,
        pageNo: 0, //显示的页数
        userInfo: false, //用户信息
        orderList: [], //订单列表
        isNULL: true
    },
    onLoad(options) {
      console.log(options)
        if (options.oderNo){
          navigateGoUtil('navigateTo', 'ordPayDet', { oderNo: options.oderNo })
        }
        _this = this, once = true, app = getApp(), pages = getCurrentPages();
    },
    onShow() {
        _this.setData({
            userInfo: app.globalData.userInfo,
            pageNo: 0
        })
        _this.getOrderListNew(false)
    },
    //获取订单列表
    getOrderListNew(add) {
        if (app.globalData.userInfo.bindState == 0) {
            return
        }
        if (once) {
            wx.showLoading({
                title: '加载中...',
                mask: true
            })
        }
        getOrderListNew({ pageNo: _this.data.pageNo }).then(data => {
            if (data.code == 200) {
                let r = data.rs;
                let il = [1,2];
                let it = ['已完成','申诉中'];
                for (let i = 0; i < r.length; i++) {
                    for (let j = 0; j < il.length; j++) {
                        if (r[i].state == il[j]) {
                            r[i].stateText = it[j];
                        }
                        r[i].parkStartText = r[i].parkStartTime ? getDateTextUtil(parseInt(r[i].parkStartTime) * 1000) : false
                        r[i].parkEndText = r[i].parkEndTime ? getDateTextUtil(parseInt(r[i].parkEndTime) * 1000) : false
                        r[i].parkTime = ~~((r[i].parkEndTime - r[i].parkStartTime) / 3600) + '时' + ~~((r[i].parkEndTime - r[i].parkStartTime) % 3600 / 60) + '分' + (r[i].parkEndTime - r[i].parkStartTime) % 60 + '秒'
                    }
                }
                _this.setData({
                    isNULL: r.length < 10,
                    pageNo: ++_this.data.pageNo,
                    orderList: add ? [..._this.data.orderList, ...r] : (r.length > 0 ? r : false)
                })
                if (once) {
                    wx.hideLoading()
                    once = false;
                    if (_this.data.screen) {
                        _this.setData({
                            screen: false
                        })
                    }
                }
                if (!add) {
                    wx.stopPullDownRefresh()
                }
            }
        })
    },
    //跳转路由
    navigateTo(e) {
        if (app.isClick()) {
            navigateGoUtil('navigateTo','ordPayDet', e.currentTarget.dataset.o)
        }
    },
    //监听下拉刷新
    onPullDownRefresh() {
        _this.setData({
            pageNo: 0
        })
        _this.getOrderListNew(false)
    },
    //上拉快触底时提前加载数据
    onReachBottom() {
        if (_this.data.orderList === false || _this.data.isNULL) {
            return
        }
        _this.getOrderListNew(true)
    }
})