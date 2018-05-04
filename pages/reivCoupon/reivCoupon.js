// pages/reivCoupon/reivCoupon.js
import { grabAndGetList } from '../../api/api.js'
import { navigateGoUtil, getDateTextUtil } from '../../utils/util.js'
let time, app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        leave: 1, //剩余优惠券
        isRec: true, //是否已领取
        oderNo: '',
        mainData: {
            grabUser: [],
            grabFlag: 0,
            grabList: []
        },
        timeString: '',
        screen: true
    },
    onLoad: function(options) {
        this.setData({
            oderNo: options.oderNo || null
        })

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.watch()
    },

    watch() {
        if (app.globalData.userInfo) {
            this.grabAndGetList()
        } else {
            if (time == 10) {
                return
            }
            setTimeout(() => {
                time++
                this.watch()
            }, 500)
        }
    },
    btnTap() {
        if (this.data.mainData.grabFlag == 0) {
            navigateGoUtil('navigateTo', 'phone')
        } else {
            wx.switchTab({
                url: '/pages/home/home',
            })
        }
    },
    grabAndGetList(oderNo) {
        grabAndGetList({ oderNo: this.data.oderNo }).then(res => {
            console.log(res)
            if (res.code == 200) {
                console.log(res.rs)
                for (let i = 0; i < res.rs.grabList.length; i++) {
                    res.rs.grabList[i].timeString = new Date(res.rs.grabList[i].createTime * 1000).toLocaleString()
                }
                this.setData({
                    mainData: res.rs
                })
                if (this.data.mainData.grabUser) {
                    this.changeTime()
                }
                if (this.data.screen) {
                    this.setData({
                        screen: false
                    })
                }
                // if (res.rs.grabFlag == 2) {
                //     setTimeout(() => {
                //         wx.showToast({
                //             title: '已经领取过了~',
                //             image: '../../images/02.png',
                //             mask: true
                //         })
                //     }, 1000)
                // }
            }
        })
    },
    //格式化时间
    changeTime() {
        let startTime = new Date(this.data.mainData.grabUser[0].couponStartDate * 1000).toLocaleDateString()
        let endTime = new Date(this.data.mainData.grabUser[0].couponEndDate * 1000).toLocaleDateString()
        this.setData({
            timeString: startTime + '至' + endTime
        })
    },
    onShareAppMessage(res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        return {
            title: '快来领取优惠券!',
            path: '/pages/reivCoupon/reivCoupon?oderNo=' + this.data.oderNo,
            imageUrl: '../../images/122.png',
            success: res => {
                // 转发成功
            },
            fail: res => {
                // wx.showToast({
                //     title: '分享失败',
                //     image: '../../images/02.png',
                //     mask: true
                // })
            }
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})