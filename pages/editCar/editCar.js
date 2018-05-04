import { setCertifCar, setEditUserCar } from '../../api/api.js'
let _this;
Page({
    data: {
        carInfo: null
    },
    onLoad(options) {
        _this = this;
        _this.setData({
            carInfo: options
        })
    },
    //车辆品牌输入
    carModel(e) {
        _this.setData({
            'carInfo.carModel': e.detail.value.skyString()
        })
    },
    //车辆型号输入
    carType(e) {
        _this.setData({
            'carInfo.carType': e.detail.value.skyString()
        })
    },
    //车辆颜色输入
    carColor(e) {
        _this.setData({
            'carInfo.carColor': e.detail.value.skyString()
        })
    },
    //完成
    nextStep() {
        if (_this.data.carInfo.tid) {
            _this.setEditUserCar()
        } else {
            _this.setCertifCar()
        }
    },
    //车辆认证
    setCertifCar() {
        setCertifCar(_this.data.carInfo).then(data => {
            if (data.code == 200) {
                wx.navigateBack({ delta: 2 })
            }
        })
    },
    //编辑车辆
    setEditUserCar() {
        setEditUserCar(_this.data.carInfo).then(data => {
            if (data.code == 200) {
                wx.navigateBack({ delta: 2 })
            }
        })
    }
})