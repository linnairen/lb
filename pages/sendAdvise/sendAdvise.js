import { api, getCompDet, getPayDet, getQiniuToken, setSuggestion } from '../../api/api.js'
import { setUpload } from '../../api/upload.js'
import { getDateTextUtil } from '../../utils/util.js'
let _this, app;
Page({
    data: {
        token: '',
        imgList: [],
        content: null,
        email: ''
    },
    onLoad() {
        _this = this, app = getApp();
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
    contentChange(e) {
        _this.setData({
            content: e.detail.value.skyString()
        })
    },
    contactChange(e) {
        _this.setData({
            email: e.detail.value.skyString()
        })
    },
    imageClick(e) {
        wx.showActionSheet({
            itemList: ['查看', '重传', '删除'],
            itemColor: '#FF9938',
            success: res => {
                if (res.tapIndex == 0) {
                    _this.previewImage(e.currentTarget.dataset.i)
                } else if (res.tapIndex == 1) {
                    _this.chooseImage(e)
                } else if (res.tapIndex == 2) {
                    _this.data.imgList.splice(e.currentTarget.dataset.i, 1)
                    _this.setData({
                        imgList: _this.data.imgList
                    })
                }
            }
        })
    },
    //选择照片
    chooseImage(e) {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            success: (res) => {
                _this.setUpload(res.tempFilePaths[0], res.tempFilePaths[0].substring(res.tempFilePaths[0].lastIndexOf('/') + 1),
                    e.currentTarget.dataset.i)
            }
        })
    },
    //预览照片
    previewImage(i) {
        wx.previewImage({
            current: _this.data.imgList[i.currentTarget ? i.currentTarget.dataset.i : i],
            urls: _this.data.imgList
        })
    },
    //上传图片
    setUpload(filePath, fileName, i) {
        setUpload({ qiniuToken: _this.data.token, filePath: filePath, fileName: fileName }).then(data => {
            if (i || i == 0) {
                _this.data.imgList.splice(i, 1, api.img + JSON.parse(data).key)
            } else {
                _this.data.imgList.push(api.img + JSON.parse(data).key)
            }
            _this.setData({
                imgList: _this.data.imgList
            })
        })
    },
    preCommit() {
        if (_this.data.email) {
            if (/^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/.test(_this.data.email)) {
                _this.setSuggestion()
            } else {
                wx.showToast({
                    title: '邮箱格式有误',
                    image: '../../images/02.png',
                    mask: true
                })
            }
        } else {
            _this.setSuggestion()
        }

    },
    setSuggestion() {
        wx.showLoading({
            title: '提交中',
            mask: true
        })
        setSuggestion({
            systemType: 2,
            content: _this.data.content,
            email: _this.data.email || null,
            imgUrl: _this.data.imgList.join()
        }).then(res => {
            if (res.code == 200) {
                wx.showToast({
                    title: '感谢反馈',
                    image: '../../images/01.png',
                    mask: true
                })
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
            }
        })
    }
})