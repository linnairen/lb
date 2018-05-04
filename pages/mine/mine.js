import { getCustomerTel } from '../..//api/api.js'
let once, app = getApp();
Page({
    data: {
        userInfo: null,
        sysUserInfo: null,
        phoneNumber: '0571-86418992'
    },
    onLoad() {
        once = 0;
        app.getSysUserInfo()
        getCustomerTel().then(data => {
            if (data.code == 200) {
                this.setData({
                    phoneNumber: data.rs.customerTel
                })
            }
        })
    },
    onShow() {
        this.watch()
    },
    call() {
        wx.makePhoneCall({
            phoneNumber: this.data.phoneNumber
        })
    },
    watch() {
        if (once == 5) {
            return
        }
        if (app.globalData.userInfo && app.globalData.sysUserInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                sysUserInfo: app.globalData.sysUserInfo
            })
        } else {
            setTimeout(() => {
                once++
                this.watch()
            }, 500)
        }
    }
})