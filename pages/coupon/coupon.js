import { setCouponList, setUsableCouponList,getCanUseList } from '../../api/api.js'
import { navigateGoUtil, formatTimeDate } from '../../utils/util.js'
let _this, pages, app;
Page({
    data: {
        screen: true,
        options: null,
        couponList: [],
        canUse: [],
        canNotUse: [],
        shadePanel: false,
        imgName: '79'
    },
    onLoad() {
        _this = this, pages = getCurrentPages(), app = getApp();
        try {
            let options = wx.getStorageSync('o') || '';
            _this.setData({
                options: (options + '' != '{}') ? options : null
            })
            wx.removeStorageSync('o')
        } catch (e) {}
    },
    onShow() {
      if (_this.data.options.oderNo) {
        _this.setUsableCouponList()
      } else if (_this.data.options.parkingId) {
        _this.getCanUseList()
      } else {
         _this.setCouponList()
      }
    },
    //获取优惠卷列表
    setCouponList() {
        setCouponList().then(data => {
            let r = false;
            if (data.code == 200 && data.rs) {
                r = data.rs;
                for (let i = 0; i < r.length; i++) {
                    r[i].couponEndText = formatTimeDate(new Date(parseInt(r[i].couponEndDate) * 1000))
                }
            }
            _this.setData({
                couponList: r || []
            })
            if (_this.data.screen) {
                setTimeout(() => {
                    _this.setData({
                        screen: false
                    })
                }, 900)
            }
        })
    },
    //获取可使用的优惠卷
    setUsableCouponList() {
      let o = _this.data.options;
      setUsableCouponList({
        oderNo: o.oderNo,
        useWay: parseInt(o.useWay),
        parkAmount: o.useWay == 0 ? 0 : (o.parkAmount || 0)
      }).then(data => {
        let r = false,
          o = _this.data.options;
        if (data.code == 200 && data.rs) {
          r = data.rs;
          for (let i = 0; i < r.canUse.length; i++) {
            r.canUse[i].couponEndText = formatTimeDate(new Date(parseInt(r.canUse[i].couponEndDate) * 1000))
            if (o.useWay == 0 && o.couponSubscribe) {
              r.canUse[i].isActive = o.couponSubscribe.tid == r.canUse[i].tid
            } else if (o.useWay == 1 && o.couponPark) {
              r.canUse[i].isActive = o.couponPark.tid == r.canUse[i].tid
            }
          }
          for (let i = 0; i < r.canNotUse.length; i++) {
            r.canNotUse[i].couponEndText = formatTimeDate(new Date(parseInt(r.canNotUse[i].couponEndDate) * 1000))
          }
        }
        _this.setData({
          canUse: r.canUse || [],
          canNotUse: r.canNotUse || []
        })
        if (_this.data.screen) {
          _this.setData({
            screen: false
          })
        }
      })
    },
    //获取可使用的优惠卷-新
    getCanUseList() {
      let o = _this.data.options;
      getCanUseList({
        parkingId: o.parkingId,
        parkAmount: o.parkAmount
      }).then(data => {
        let r = false,
          o = _this.data.options;
        if (data.code == 200 && data.rs) {
          r = data.rs;
          for (let i = 0; i < r.canUse.length; i++) {
            r.canUse[i].couponEndText = formatTimeDate(new Date(parseInt(r.canUse[i].couponEndDate) * 1000))
            if (o.useWay == 0 && o.couponSubscribe) {
              r.canUse[i].isActive = o.couponSubscribe.tid == r.canUse[i].tid
            } else if (o.couponPark) {
              r.canUse[i].isActive = o.couponPark.tid == r.canUse[i].tid
            }
          }
          for (let i = 0; i < r.canNotUse.length; i++) {
            r.canNotUse[i].couponEndText = formatTimeDate(new Date(parseInt(r.canNotUse[i].couponEndDate) * 1000))
          }
        }
        _this.setData({
          canUse: r.canUse || [],
          canNotUse: r.canNotUse || []
        })
        if (_this.data.screen) {
          _this.setData({
            screen: false
          })
        }
      })
    },
    //点击操作按钮
    clickButton() {
        navigateGoUtil('switchTab', 'home')
    },
    clickCoupon(e) {
        let i = e.currentTarget.dataset.index;
        _this.data.canUse[i].isActive = !_this.data.canUse[i].isActive;
        _this.setData({
            canUse: _this.data.canUse
        })
        if (_this.data.canUse[i].useWay == 0) {
            pages[pages.length - 2].setData({
                'orderInfo.couponSubscribe': _this.data.canUse[i].isActive ? _this.data.canUse[i] : null
            })
        } else if (_this.data.options.useWay){
            pages[pages.length - 2].setData({
                'orderInfo.couponPark': _this.data.canUse[i].isActive ? _this.data.canUse[i] : null
            })
        }
        else{
            pages[pages.length - 2].setData({
              'couponPark': _this.data.canUse[i].isActive ? _this.data.canUse[i] : null
            })
        }
        wx.navigateBack()
    },
    clickMsg(e) {
        let i = e.currentTarget.dataset.index;
        _this.data.canNotUse[i].isMsg = !_this.data.canNotUse[i].isMsg;
        _this.setData({
            canNotUse: _this.data.canNotUse
        })
    },
    couponTap(e) {
        _this.setData({
            imgName: ['78', '79', '78', '77', '78', '78', '77', '80', '78'][e.currentTarget.dataset.i],
            shadePanel: true
        })
    },
    shadePanel() {
        _this.setData({
            shadePanel: false
        })
    }
})