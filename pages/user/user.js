Page({
    data: {
        sysUserInfo: null
    },
    onShow: function() {
        this.setData({
            sysUserInfo: getApp().globalData.sysUserInfo
        })
    }
})