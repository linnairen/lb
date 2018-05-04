// pages/hitea/hitea.js
import { getInviteInfo } from '../..//api/api.js'
var app = getApp()
Page({
    data: {
        screen: true,
        couponMoney: '',
        invitedNumber: 0,
        havedCouponMoney: 0,
        shadePanel: false
    },
    onShow() {
        this.getInviteInfo()
    },
    getInviteInfo() {
        getInviteInfo().then(res => {
            if (res.code == 200) {
                this.setData({
                    couponMoney: res.rs.couponMoney,
                    invitedNumber: res.rs.invitedNumber || 0,
                    havedCouponMoney: res.rs.havedCouponMoney || 0
                })
                if (this.data.screen) {
                    this.setData({
                        screen: false
                    })
                }
            }
        })
    },
    onShareAppMessage(res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        return {
            title: '快来领取停车券!',
            path: '/pages/home/home?inviteCode=' + app.globalData.sysUserInfo.inviteCode,
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
    shadePanelShow() {
        this.setData({
            shadePanel: !this.data.shadePanel
        })
    }
})