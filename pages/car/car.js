import { api, getUserCarList, setUploadLicense, setIsChecked, setDeleteCar, getQiniuToken } from '../../api/api.js'
import { setUpload } from '../../api/upload.js'
import { navigateGoUtil } from '../../utils/util.js'
let _this, app;
Page({
    data: {
        screen: true,
        drivingLicense: false,
        carList: []
    },
    onLoad() {
        _this = this, app = getApp();
        _this.getQiniuToken()
    },
    onShow() {
        _this.getUserCarList()
    },
    //获取车辆信息列表
    getUserCarList() {
        getUserCarList().then(data => {
            if (data.code == 200) {
                _this.setData({
                    drivingLicense: data.rs.drivingLicense || false,
                    carList: data.rs.list || []
                })
                if (_this.data.screen) {
                    _this.setData({
                        screen: false
                    })
                }
            }
        })
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
    //删除车辆信息
    setDeleteCar(e) {
        wx.showModal({
            title: '',
            content: '你确定要删除该车辆信息吗',
            confirmColor: '#ff9938',
            success: function(res) {
                if (res.confirm) {
                    setDeleteCar({ tid: e.currentTarget.dataset.item.tid }).then(data => {
                        if (data.code == 200) {
                            _this.getUserCarList()
                        } else {
                            wx.showToast({
                                title: '网络出错',
                                image: '../../images/02.png',
                                mask: true
                            })
                        }
                    })
                }
            }
        })
    },
    //编辑车辆信息
    navigateGo(e) {
        let ni = {};
        let i = e.target.dataset.item || {};
        ['tid', 'plateNo', 'carColor', 'carModel', 'carType'].forEach(k => {
            ni[k] = i[k] || '';
        })
        navigateGoUtil('navigateTo', 'plate', ni)
    },
    //设置默认车牌号
    setIsChecked(e) {
        setIsChecked({ tid: e.currentTarget.dataset.tid }).then(data => {
            if (data.code == 200) {
                _this.getUserCarList()
            } else {
                wx.showToast({
                    title: '网络出错',
                    image: '../../images/02.png',
                    mask: true
                })
            }
        })
    },
    //选择照片 //预览照片
    choosePreviewImage(e) {
        if (e.currentTarget.dataset.url) {
            wx.previewImage({
                urls: [_this.data.drivingLicense]
            })
        } else {
            wx.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                success: (res) => {
                    _this.setUpload(res.tempFilePaths[0], res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('/') + 1),
                        e.currentTarget.dataset.i)
                }
            })
        }
    },
    //上传图片
    setUpload(filePath, fileName, i) {
        setUpload({
            qiniuToken: _this.data.token,
            filePath: filePath,
            fileName: fileName
        }).then(data => {
            _this.setUploadLicense(api.img + JSON.parse(data).key)
        })
    },
    //上传驾驶证
    setUploadLicense(url) {
        setUploadLicense({ drivingLicense: url }).then(data => {
            if (data.code == 200) {
                _this.getUserCarList()
            } else {
                wx.showToast({
                    title: '网络出错',
                    image: '../../images/02.png',
                    mask: true
                })
            }
        })
    }
})