import { des, hexToString, base64encode } from '../../utils/des.js'
import { navigateGoUtil, getUrlParamUtil } from '../../utils/util.js'
import { getMessgCode } from '../../api/api.js'
let app = getApp();
Page({
    data: {
        phone: '',
        mobile: null
    },
    onShow() {
        this.setData({
            phone: app.globalData.sysUserInfo.mobile.substr(0, 3) + '****' + app.globalData.sysUserInfo.mobile.substr(7, 4),
            mobile: app.globalData.sysUserInfo.mobile
        })
    },
    //点击下一步按钮触发事件
    navigateGo() {
        navigateGoUtil('navigateTo', 'changePhone', {
            mobile: this.data.mobile
        })
    }
})