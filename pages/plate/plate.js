import { addPlateNum } from '../../api/api.js'
import { navigateGoUtil } from '../../utils/util.js'
let _this, app = getApp();
Page({
    data: {
        disabled: true, //按钮禁用
        short: '浙', //省份简称默认显示
        serial: '', //车牌号码
        left: 45, //小光标位置
        serialLng: 6, //长度限制 6和7
        bottom: [-1500, -1500], //键盘定位
        carInfo: null,
        shortList: [
            '京', '沪', '津', '渝', '黑', '吉', '辽', '蒙', '冀', '新',
            '甘', '青', '陕', '宁', '豫', '鲁', '晋', '皖', '鄂', '湘',
            '苏', '川', '黔', '滇', '桂', '藏', '浙', '赣', '粤', '闽',
            '台', '琼'
        ], //省份简称键盘文本
        serialList: [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
            'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z',
            'X', 'C', 'V', 'B', 'N', 'M', '港', '澳'
        ], //车牌号码键盘文本
    },
    onLoad(options) {
        _this = this;
        _this.setData({
            carInfo: options,
            short: options.plateNo ? options.plateNo.slice(0, 1) : '浙',
            serial: options.plateNo ? options.plateNo.slice(1) : ''
        })
    },
    onReady() {
        _this.keyboardChange(0)
    },
    //改变选择器弹窗
    keyboardChange(i) {
        let b = [-1500, -1500];
        if (i || i === 0) {
            b[i] = 0;
        }
        _this.setData({
            bottom: b
        })
    },
    //选中单选框
    radioClick() {
        let nl = _this.data.serialLng == 6 ? 7 : 6;
        let s = _this.data.serial;
        _this.setData({
            serial: s.substring(0, 6),
            left: (s.length - (s.length < nl ? 0 : s.length == nl ? 1 : 2)) * 54 + 172,
            serialLng: nl
        })
        if (nl == 7) {
            _this.keyboardChange(1)
        }
    },
    //点击input弹出键盘
    inputClickTop(e) {
        let i = e.currentTarget.dataset.index || false;
        let b = _this.data.bottom;
        if (b[i] == i) {
            return
        }
        if (i == 1) {
            _this.inputClick()
        } else {
            _this.setData({ left: 45 })
        }
        _this.keyboardChange(i)
    },
    //点击省份简称键盘按钮
    shortClick(e) {
        _this.setData({
            short: e.currentTarget.dataset.value
        })
        _this.inputClick()
        _this.keyboardChange(1)
    },
    //input被点击处理闪动图标的位置
    inputClick() {
        let sl = _this.data.serialLng;
        let s = _this.data.serial.length;
        _this.setData({
            left: (s == sl ? sl - 1 : s) * 54 + 172
        })
    },
    //点击数字键盘按钮
    serialClick(e) {
        let sl = _this.data.serialLng;
        let s = _this.data.serial;
        let v = e ? e.currentTarget.dataset.value : false;
        let ns;
        if (v === 'I') {
            return
        }
        if (!v || v == 'del') {
            ns = !v ? s : s.substring(0, s.length - 1);
        } else {
            ns = (s.length < sl ? s : s.substring(0, s.length - 1)) + v;
        }
        if (!/[A-Z]/.test(ns[0]) && v != 'del' && v != '') {
            wx.showToast({
                title: '必须字母开头',
                image: '../../images/02.png',
                mask: true
            })
            return
        }
        if ((_this.data.short != '粤' || ns.length != sl) && (v == '港' || v == '澳')) {
            wx.showToast({
                title: '广东省末位可填',
                image: '../../images/02.png',
                mask: true
            })
            return
        }
        _this.setData({
            serial: ns,
            left: ns.length * 54 + 172
        })
        if (ns.length == sl) {
            _this.keyboardChange()
        }
    },
    //点击下一步提交
    nextStep() {
        let pages = getCurrentPages();
        let page = pages[pages.length - 2].route == 'pages/car/car';
        if (page) {
            _this.data.carInfo.plateNo = _this.data.short + _this.data.serial;
            _this.data.carInfo.type = _this.data.carInfo.plateNo == 6 ? 1 : 2;
            navigateGoUtil('navigateTo', 'editCar', _this.data.carInfo)
        } else {
            _this.addPlateNum()
        }
    },
    //单独添加车牌号
    addPlateNum() {
        addPlateNum({
            plateNo: _this.data.short + _this.data.serial,
            type: _this.data.serialLng == 6 ? 1 : 2
        }).then(data => {
            if (data.code == 200) {
                wx.navigateBack()
            }
        })
    }
})