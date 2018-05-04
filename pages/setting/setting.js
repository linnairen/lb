import { getLogOut } from '../../api/api.js'
Page({
    data: {
        userInfo: null //全局用户信息
    },
    onShow() {
        this.setData({
            userInfo: getApp().globalData.userInfo
        })
    }
})