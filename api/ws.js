import { api, getRackOrder } from './api.js'
import { navigateGoUtil } from '../utils/util.js'
let timer, app, pages, page, data, COUPNUM, time = 0;

//长连接
export const WS = skytkn => {
    COUPNUM = 0, app = getApp();

    //调用时先默认停止心跳,长连接创建成功再发心跳包
    clearInterval(timer)

    //创建长连接
    wx.connectSocket({ url: api.ws })

    //监听WebSocket连接已打开！
    wx.onSocketOpen(res => {
        time = 0;
        wx.sendSocketMessage({
            data: JSON.stringify({
                data: skytkn,
                cmid: 1100
            })
        })

        //每5秒发一次心跳包
        timer = setInterval(() => {
            wx.sendSocketMessage({
                data: JSON.stringify({ cmid: 101 })
            })
        }, 5000)
    })

    //监听WebSocket连接打开失败，请检查！ 失败自动重连
    wx.onSocketError(res => {
        console.log('WebSocket连接打开失败，请检查！')
        if (time == 20) {
            return
        }
        setTimeout(() => {
            WS(app.globalData.header.skytkn)
            time++
        }, 500)
    })

    //监听WebSocket推送
    wx.onSocketMessage(res => {
        pages = getCurrentPages(); //所有页面栈
        page = pages[pages.length - 1] || { route: '/home/' }; //当前页面栈所有信息
        data = JSON.parse(res.data); //解析推送的JSON数据
        if (data.code == 200) {
            // if (data.cmid == 102) {
            //     console.log('跳一跳')
            // } else {
            //     console.log('接收到的推送', data)
            // }

            //停车场数量推送
            if (data.cmid == 2100) {
                try {
                    wx.setStorageSync('parkNum', data.data)
                    app.globalData.parkNum = data.data;
                    if (page.route.beString('/state/') && page.data.oderNo == app.globalData.oderNo) {
                        page.setData({
                            'orderInfo.parkNum': data.data
                        })
                    }
                } catch (e) {}
            }

            // (8101 商家取消订单的推送)  (8102 商家接单订单的推送)  (8103 b端确认c端到达)  (8104 b端确认c端离场) (2101 没有接单的推送) (2103 超时默认进场的推送) (8105 已到达预约时间无人接单平台取消订单 )
            if (data.cmid == 8101 || data.cmid == 8102 || data.cmid == 8103 || data.cmid == 8104 || data.cmid == 2105 || data.cmid == 2103 || data.cmid == 2101) {
                // console.log(data)
                app.globalData.billOrder = data.cmid == 8101 || data.cmid == 8104 || data.cmid == 2105 || data.cmid == 8105;
                setTimeout(() => {
                    if (page.route.beString('/state/') && page.data.oderNo == app.globalData.oderNo) {
                        page.getLineItem(page.data.oderNo)
                    } else if (page.route.beString('/home/')) {
                        page.getRackOrder()
                    }
                }, 2000)
                if (!page.route.beString('/state/') || (page.route.beString('/state/') && page.data.oderNo != app.globalData.oderNo)) {
                    if (data.cmid == 8101) {
                        showModalWS('对不起，您的订单已被商家取消，您未产生任何费用', '知道了', 'switchTab', 'indent')
                    } else if (data.cmid == 8102) {
                        showModalWS('您的订单已被停车场接单', '知道了', 'navigateTo', 'state', {
                            oderNo: app.globalData.oderNo
                        })
                    } else if (data.cmid == 2105) {
                        wx.showModal({
                            title: '提示',
                            content: '对不起，已到达预约时间无人接单，平台取消订单',
                            confirmText: '确定',
                            confirmColor: '#ff9938'
                        })
                    } else if (data.cmid == 2103) {
                        showModalWS('押金不足支付占位费，且无任何操作系统默认为您已进场', '知道了', 'navigateTo', 'state', {
                            oderNo: app.globalData.oderNo
                        })
                    }
                }
            }
        }
    })

    //监听WebSocket 已关闭！关闭自动重连
    wx.onSocketClose(res => {
        console.log('监听WebSocket 已关闭！')
        if (time == 20) {
            return
        }
        setTimeout(() => {
            WS(app.globalData.header.skytkn)
            time++
        }, 500)
    })
}

//需要跳转路由的提醒弹窗
const showModalWS = (content, cancelText, navigate, url, par) => {
    wx.showModal({
        title: '提示',
        content: content,
        cancelText: cancelText,
        cancelColor: '#999999',
        confirmText: '去查看',
        confirmColor: '#ff9938',
        success: res => {
            if (res.confirm) {
                navigateGoUtil(navigate, url, par || '')
            }
        }
    })
}