import { des, hexToString, base64encode } from '../../utils/des.js'
import { navigateGoUtil } from '../../utils/util.js'
import { getMessgCode } from '../../api/api.js'
let _this, old, pages, app;
Page({
    data: {
        disabled: false, //控制按钮是否可以点击
        mobile: '', //手机号码
        radio: true //法律条款是否同意
    },
    onLoad() {
        _this = this, pages = getCurrentPages(), app = getApp();
        if (pages[pages.length - 2].route.beString('/safe/')) {
            wx.setNavigationBarTitle({
                title: '更换号码'
            })
            try {
                wx.removeStorageSync('mobile')
            } catch (e) {}
        }
    },
    onShow() {
        try {
            old = wx.getStorageSync('mobile') || '';
            if (old) {
                _this.setData({
                    mobile: old,
                    disabled: true
                })
            }
        } catch (e) {}
    },
    //验证手机号码格式
    setTel(e) {
        let mobile = e.detail.value;
        if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile)) {
            try {
                wx.setStorageSync('mobile', mobile) //如果验证手机号码正确,直接存到本地,下次默认使用
            } catch (e) {}
        }
        _this.setData({
            mobile: mobile,
            disabled: /^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile) && _this.data.radio
        })
    },
    //单选框选项
    setRadio() {
        _this.setData({
            radio: !_this.data.radio
        })
        _this.setTel({
            detail: { value: _this.data.mobile }
        })
    },
    //点击下一步按钮触发事件
    navigateGo() {
        navigateGoUtil('navigateTo', 'code', {
            mobile: _this.data.mobile,
            isOld: old == _this.data.mobile ? false : true
        })
    }
})