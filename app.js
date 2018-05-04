import { header } from './api/http.js'
import { WS } from './api/ws.js'
import { getToken, getSessionKey, getUserInfo, getSysUserInfo } from './api/api.js'
import { navigateGoUtil } from './utils/util.js'
let _this;
App({
    globalData: {
        header: header, //请求头
        watchHome: false, //token是否请求到了
        billOrder: null, //监听是否可以订单
        userInfo: null, //用户基本信息
        sysUserInfo: null, //用户详细信息
        wxLoginKey: null, //weixinkey
        count: 0, //获取验证码定时器时间
        isClick: true, //防止按钮重复点击
        parkNum: '', //推送的停车场个数
        oderNo: false, //当前进行中订单编号
        fromInvite: null //邀请人的邀请码
    },
    onLaunch() {
        _this = this;
        try {
            _this.globalData.parkNum = wx.getStorageSync('parkNum') || '';
            _this.globalData.header.skytkn = wx.getStorageSync('skytkn') || '';
            _this.login()
        } catch (e) {}
    },
    //查询是否已绑定手机号 某些操作需要查询登录
    isBindState() {
        if (!_this.globalData.userInfo.bindState) {
            navigateGoUtil('navigateTo', 'login')
        }
        return _this.globalData.userInfo.bindState;
    },
    //控制按钮是否可点击
    isClick() {
        if (_this.globalData.isClick) {
            _this.globalData.isClick = false;
            setTimeout(() => {
                _this.globalData.isClick = true;
            }, 1500)
            return true
        }
        return false
    },
    // 微信登录 获取sessionKey    appid: 'wx4b10e0179389e80e'
    login() {
        wx.login({
            success: res => {
                try {
                    _this.globalData.header.skytkn = wx.getStorageSync('skytkn') || ''
                    _this.globalData.wxLoginKey = wx.getStorageSync('wxLoginKey') || null
                } catch (e) {}
                getSessionKey({
                    code: res.code,
                    wxLoginKey: _this.globalData.wxLoginKey,
                    token: _this.globalData.header.skytkn
                }).then(data => {
                    if (data.code == 200) {
                        _this.globalData.watchHome = true, _this.globalData.header.skytkn = data.rs.token;
                        if (data.rs.authState == '0' || data.rs.authState == 0) {
                            _this.getUserInfo(data.rs.wxLoginKey)
                        } else {
                            _this.globalData.userInfo = data.rs.userInfo;
                            _this.getSysUserInfo()
                            // WS(_this.globalData.header.skytkn)
                        }
                        try {
                            wx.setStorageSync('skytkn', data.rs.token)
                            wx.setStorageSync('wxLoginKey', data.rs.wxLoginKey)
                        } catch (e) {}
                    }
                })
            }
        })
    },
    //微信小程序获取用户信息授权
    getUserInfo(key) {
        wx.getUserInfo({
            success: res => {
                getUserInfo({
                    encryptedData: res.encryptedData,
                    wxLoginKey: key,
                    iv: res.iv
                }).then(data => {
                    let pages = getCurrentPages();
                    _this.globalData.userInfo = data.rs;
                    _this.getSysUserInfo()
                    // WS(_this.globalData.header.skytkn)
                })
                if (_this.userInfoReadyCallback) {
                    _this.userInfoReadyCallback(res)
                }
            },
            fail() {
                try {
                    wx.removeStorageSync('skytkn')
                    wx.removeStorageSync('wxLoginKey')
                } catch (e) {}
                wx.showModal({
                    title: '警告',
                    content: '您点击了拒绝授权，将无法正常使用萝泊停车的功能。请10分钟后再次点击授权，或者删除小程序重新进入。',
                    showCancel: false,
                    confirmColor: '#ff9938',
                    success: res => {
                        wx.authorize({
                            scope: 'scope.userInfo',
                            success: res => {
                                _this.login()
                            }
                        })
                    }
                })
            }
        })
    },
    //用户详细信息
    getSysUserInfo() {
        getSysUserInfo().then(data => {
            if (data.code == 200) {
                _this.globalData.sysUserInfo = data.rs;
            }
        })
    }
})