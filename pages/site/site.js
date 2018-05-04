import QQMapWX from '../../libs/qqmap-wx-jssdk.min.js'
import { getCityList, getSeekParking, getParkingList } from '../../api/api.js'
import { navigateGoUtil } from '../../utils/util.js'
let MapApi, wxMap, _this, timer, timerGet, app, pages;
Page({
    data: {
        state: null, //控制地图 搜索来回切换
        isActive: 0,
        options: {
            cityName: null,
            detailName: null,
            address: null,
            latitude: 30.29193,
            longitude: 120.076
        }, //目标地点信息
        cityName: null,
        cityText: null, //搜索使用城市名
        cityList: [], //已开通城市列表
        seekList: [],
        keyword: '', //表单显示的内容
        classList: [],
        detailList: [],
        detailArray: [],
        seekList: [], //搜索匹配列表
        histList: [], //搜索历史记录列表
        points: [], //控制视野范围的坐标点
        X: 0, //记录删除历史记录滑动起点
        Y: true, //控制列表是否可竖向滚动
        oderNo: false, //从这里发单需要注销此页面
        isData: true,
        isFocus: true,
    },
    onLoad(op) {
        _this = this, app = getApp(), pages = getCurrentPages(), wxMap = wx.createMapContext('wxMap'), MapApi = new QQMapWX({ key: 'DCRBZ-DSZKS-ADGOO-6S3U2-IW4OT-IDBWZ' });
        _this.setData({
            state: op.state,
            cityText: op.city != 'null' ? op.city : false,
            isFocus: op.state == '1',
        })
        _this.getLocation()
        if (op.state == '2') {
            _this.getCityList()
        }
    },
    onShow() {
        _this.getParkingList()
    },
    //获取当前所在定位  地图视野会主动移动到当前定位处
    getLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: res => {
                MapApi.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: res => {
                        console.log(res)
                        _this.setData({
                            cityName: res.result.ad_info.city,
                            cityText: _this.data.cityText ? _this.data.cityText : res.result.ad_info.city
                        })
                        _this.getHistList()
                    }
                })
            }
        })
    },
    getParkingList() {
        if (_this.data.cityText) {
            _this.isHist()
            getParkingList({ cityName: _this.data.cityText }).then(data => {
                if (data.code == 200) {
                    data.rs.classList.splice(0, 0, { name: '常用' });
                    _this.setData({
                        classList: data.rs.classList,
                        detailList: data.rs.detailList
                    })
                }
            })
        } else {
            setTimeout(() => {
                _this.getParkingList()
            }, 100)
        }
    },
    //获取城市列表的请求
    getCityList() {
        _this.setData({
            state: 2,
            keyword: '',
            isData: true
        })
        if (!_this.data.cityList.length) {
            getCityList().then(data => {
                if (data.code == 200) {
                    _this.setData({
                        cityList: data.rs
                    })
                }
            })
        }
    },
    //选中的类型
    setActive(e) {
        let i = e.currentTarget.dataset.index;
        _this.setData({
            isActive: i,
            detailArray: i > 0 ? _this.data.detailList[i - 1] : []
        })
    },
    //表单聚焦处理函数
    isHist(e) {
        if (_this.data.keyword == '') {
            _this.setData({
                seekList: [],
                isData: true
            })
            _this.getHistList()
        }
        if (_this.data.state == 2) {
            _this.setData({
                state: e ? 1 : _this.data.state,
                isData: true
            })
        }
    },
    //表单改变时触发
    inputChang(e) {
        _this.setData({
            keyword: e.detail.value
        })
        if (e.detail.value == '') {
            _this.setData({
                seekList: [],
                isData: true
            })
            _this.getHistList()
        } else {
            _this.getSuggestion()
        }
    },
    //点击搜索结果列表item触发事件
    seekCilck(e) {
        _this.setHistList(e)
        _this.navigateToMap(e)
    },
    //点击城市item处理函数
    cityItemCilck(e) {
        _this.setData({
            state: 1,
            cityText: e.currentTarget.dataset.name
        })
        _this.getHistList()
    },
    //并前往发单页面
    navigateToMap(e) {
      navigateGoUtil('reLaunch', 'home', e.currentTarget.dataset.options)
    },
    //用于获取输入关键字的补完与提示，帮助用户快速输入
    getSuggestion() {
        _this.setData({
            seekList: [],
            isData: true
        })
        MapApi.getSuggestion({
            keyword: _this.data.keyword,
            region: _this.data.cityText,
            region_fix: 1,
            success: res => {
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].address.replace(res.data[i].province + res.data[i].city, '') != '') {
                        _this.data.seekList.push({
                            cityName: res.data[i].city,
                            detailName: res.data[i].title,
                            address: res.data[i].address.replace(res.data[i].province + res.data[i].city, ''),
                            latitude: res.data[i].location.lat,
                            longitude: res.data[i].location.lng
                        })
                    }
                }
                _this.setData({
                    seekList: _this.data.seekList,
                    isData: _this.data.seekList.length != 0
                })

            }
        })
    },
    //搜索历史记录显示
    getHistList() {
        try {
            let hl = wx.getStorageSync('histList') || [];
            if (hl.length) {
                let c = _this.data.cityText;
                let k = _this.data.keyword;
                for (let i = 0; i < hl.length; i++) {
                    hl[i].wh = 0;
                    if ((hl[i].cityName.substring(0, hl[i].cityName[hl[i].cityName.length - 1] == '市' ? hl[i].cityName.length - 1 : hl[i].cityName.length)) == (c.substring(0, c[c.length - 1] == '市' ? c.length - 1 : c.length))) {
                        if (hl[i].detailName.beString(k) || k == '') {
                            hl[i].isHide = false;
                        } else {
                            hl[i].isHide = true;
                        }
                    } else {
                        hl[i].isHide = true;
                    }
                }
            }
            _this.setData({
                histList: hl
            })
        } catch (e) {}
    },
    //存储搜索历史记录
    setHistList(e) {
        try {
            let hl = wx.getStorageSync('histList') || [];
            let push = true;
            for (let i = 0; i < hl.length; i++) {
                if (e.currentTarget.dataset.options.detailName == hl[i].detailName) {
                    push = false;
                    hl.splice(i, 1)
                }
            }
            if (hl.length >= 10 && push) {
                hl.pop()
            }
            hl.unshift(e.currentTarget.dataset.options)
            wx.setStorageSync('histList', hl)
        } catch (e) {}
    },
    touchS(e) {
        if (e.touches.length == 1) {
            _this.setData({ X: e.touches[0].clientX })
        }
        if (_this.data.histList[e.currentTarget.dataset.index].wh > 0) {
            _this.setData({
                Y: false
            })
        }
    },
    touchM(e) {
        if (e.touches.length == 1) {
            let disX = _this.data.X - e.touches[0].clientX;
            let w = disX - 20;
            if (disX > 20) {
                _this.data.histList[e.currentTarget.dataset.index].wh = w * 3;
                _this.setData({
                    Y: false,
                    histList: _this.data.histList
                })
            }
        }
    },
    touchE(e) {
        if (e.changedTouches.length == 1) {
            let disX = _this.data.X - e.changedTouches[0].clientX;
            let hl = _this.data.histList;
            hl[e.currentTarget.dataset.index].wh = disX < 56 ? 0 : 180;
            _this.setData({
                Y: true,
                histList: hl
            })
        }
    },
    //点击删除按钮事件
    delItem(e) {
        try {
            let hl = wx.getStorageSync('histList') || [];
            hl.splice(e.currentTarget.dataset.index, 1)
            _this.setData({
                histList: hl
            })
            _this.getHistList()
            _this.getSuggestion()
            wx.setStorageSync('histList', hl)
        } catch (e) {}
    },
    //禁止滑动事件
    stopTouchmove(e) { return e = null }
})