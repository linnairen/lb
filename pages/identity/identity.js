import { setAddCertif, getCertification } from '../../api/api.js'
let _this, app;
Page({
    data: {
        screen: true,
        realName: '',
        idCardNo: null,
        idityInfo: null
    },
    onLoad() {
        _this = this, app = getApp();
    },
    onShow() {
        _this.getCertification()
    },
    //获取实名认证
    getCertification() {
        getCertification().then(data => {
            if (data.code == 200) {
                _this.setData({
                    idityInfo: data.rs
                })
                if (_this.data.screen) {
                    _this.setData({
                        screen: false
                    })
                }
            }
        })
    },
    //姓名输入
    realNameInput(e) {
        _this.setData({
            realName: e.detail.value.skyString()
        })
    },
    //身份证号输入
    idCardNoInput(e) {
        _this.setData({
            idCardNo: e.detail.value.skyString()
        })
    },
    //添加实名认证
    setAddCertif() {
        wx.showLoading({
            title: '认证中',
            mask: true
        })
        if (!/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(_this.data.idCardNo)) {
            wx.showToast({
                title: '证件号有误',
                image: '../../images/02.png',
                mask: true
            })
        } else {
            setAddCertif({ realName: _this.data.realName, idCardNo: _this.data.idCardNo }).then(data => {
                if (data.code == 200) {
                    app.globalData.sysUserInfo.realName = _this.data.realName;
                    app.globalData.sysUserInfo.idCardNo = _this.data.idCardNo;
                    app.globalData.sysUserInfo.verifyRealName = 1;
                    wx.showToast({
                        title: '已认证',
                        image: '../../images/01.png',
                        mask: true
                    })
                    _this.getCertification()
                }
            })
        }
    }
})