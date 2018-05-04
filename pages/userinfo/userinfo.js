import { api, getQiniuToken, setSysUserInfo } from '../../api/api.js'
import { setUpload } from '../../api/upload.js'
let _this, app;
Page({
    data: {
        token: null,
        sexList: ['男', '女'],
        ageList: ['00后', '90后', '80后', '70后', '60后'],
        sysUserInfo: null
    },
    onLoad() {
        _this = this, app = getApp();
        _this.setData({
            sysUserInfo: app.globalData.sysUserInfo
        })
        _this.getQiniuToken()
    },
    //获取七牛token
    getQiniuToken() {
        getQiniuToken({ type: 1 }).then(data => {
            if (data.code == 200) {
                _this.setData({
                    token: data.rs
                })
            }
        })
    },
    //输入姓名
    nameInput(e) {
        _this.setData({
            'sysUserInfo.nickName': e.detail.value.skyString()
        })
    },
    //选择性别
    sexListTap() {
        wx.showActionSheet({
            itemList: _this.data.sexList,
            itemColor: '#FF9938',
            success: res => {
                _this.setData({
                    'sysUserInfo.sex': _this.data.sexList[res.tapIndex]
                })
            }
        })
    },
    //选择年龄
    ageListTap() {
        wx.showActionSheet({
            itemList: _this.data.ageList,
            itemColor: '#FF9938',
            success: res => {
                _this.setData({
                    'sysUserInfo.age': _this.data.ageList[res.tapIndex]
                })
            }
        })
    },
    //选择照片 
    chooseImage(e) {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: (res) => {
                _this.setUpload(res.tempFilePaths[0], res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('/') + 1), e.currentTarget.dataset.i)
            }
        })
    },
    //预览照片
    previewImage() {
        if (_this.data.sysUserInfo.headUrl) {
            wx.previewImage({ urls: [_this.data.sysUserInfo.headUrl] })
        }
    },
    //上传图片
    setUpload(filePath, fileName, i) {
        setUpload({ qiniuToken: _this.data.token, filePath: filePath, fileName: fileName }).then(data => {
            _this.setData({
                'sysUserInfo.headUrl': api.img + JSON.parse(data).key
            })
        })
    },
    //保存用户信息
    setSysUserInfo() {
        wx.showLoading({
            title: '保存中',
            mask: true
        })
        setSysUserInfo({
            headUrl: _this.data.sysUserInfo.headUrl || null,
            nickName: _this.data.sysUserInfo.nickName,
            sex: _this.data.sysUserInfo.sex || null,
            age: _this.data.sysUserInfo.age || null,
        }).then(data => {
            if (data.code == 200) {
                app.globalData.sysUserInfo = _this.data.sysUserInfo;
                wx.showToast({
                    title: '已保存',
                    image: '../../images/01.png',
                    mask: true
                })
                setTimeout(() => {
                    wx.navigateBack()
                }, 1000)
            }
        })
    },

})