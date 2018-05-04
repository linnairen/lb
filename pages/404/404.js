import { navigateGoUtil } from '../../utils/util.js'
Page({
    data: {
        length: null
    },
    onLoad(options) {
        this.setData({
            length: options.length
        })
    },
    navigateGo() {
        if (this.data.length >= 2) {
            wx.navigateBack()
        } else {
            navigateGoUtil('switchTab', 'home')
        }
    }
})