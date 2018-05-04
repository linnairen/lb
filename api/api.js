import { http } from './http.js'

//域名地址
export const api = {
    //开发环境
    // qn: 'http://up.qiniu.com',
    // ws: 'ws://192.168.11.170:15151',
    // auth: 'http://192.168.11.170:8001',
    // map: 'http://192.168.11.170:8009',
    // mine: 'http://192.168.11.170:8018',
    // img: 'http://ovr04x0lk.bkt.clouddn.com/',

    //生产环境
    qn: 'https://up.qbox.me',
    ws: 'wss://lb-link.cheweiditu.com',
    auth: 'https://lb-auth.cheweiditu.com',
    map: 'https://lb-map.cheweiditu.com',
    mine: 'https://lb-mine.cheweiditu.com',
    img: 'https://img.cheweiditu.com/'
}


//用户出场生成支付停车费订单接口
export const createOrder = params => {
  return http.post(api.map + '/skymap/parkOrderUser/settlement/createOrder', params).then(res => res.data)
}
//获取订单详情接口
export const getOrderInfo = params => {
  return http.get(api.map + '/skymap/parkOrderUser/getOrderInfo', params).then(res => res.data)
}
//获取订单列表接口
export const getOrderListNew = params => {
  return http.get(api.map + '/skymap/parkOrderUser/list', params).then(res => res.data)
}
//搜索停车场接口
export const searchParking = params => {
  return http.get(api.map + '/skymap/parkOrganization/searchParking', params ).then(res => res.data)
}
//首页获取停车场详情
export const getParkingDetail = params => {
  return http.get(api.map + '/skymap/parkOrderUser/getParkingDetail', params).then(res => res.data)
}
//用户支付停车费页面获取停车场信息、车牌号接口
export const getParkingAndCar = params => {
  return http.get(api.map + '/skymap/parkOrderUser/getParkingAndCar', params).then(res => res.data)
}
//获取可以使用的优惠券列表-新
export const getCanUseList = params => {
  return http.get(api.mine + '/skymine/coupon/getCanUseList.shtml', params).then(res => res.data)
}


//获取公司电话
export const getCustomerTel = params => {
    return http.get(api.mine + '/skymine/res/getCustomerTel', params).then(res => res.data)
}

//上传formId
export const UploadFormId = params => {
    return http.get(api.auth + '/skyauth/platform/saveWeixinFormIds', params).then(res => res.data)
}

//获取七牛token
export const getQiniuToken = params => {
    return http.post(api.auth + '/skyauth/qiniu/token/get', params).then(res => res.data)
}

//获取服务器时间戳
export const getServerTime = params => {
    return http.get(api.auth + '/skyauth/server/getTime.shtml', params).then(res => res.data)
}

//微信小程序登录获取sessionKey
export const getSessionKey = params => {
    return http.post(api.auth + '/skyauth/platform/wxSessionKey.shtml', params).then(res => res.data)
}

//微信小程序登录保存用户信息
export const getUserInfo = params => {
    return http.post(api.auth + '/skyauth/platform/wxSessionKeyCheck.shtml', params).then(res => res.data)
}

//短信验证码发送
export const getMessgCode = (params, header) => {
    return http.post(api.auth + '/skyauth/sms/send.shtml', params, header).then(res => res.data)
}

//登录短信验证码校验
export const setMessgCode = params => {
    return http.post(api.auth + '/skyauth/oauth/login.shtml', params).then(res => res.data)
}

//其他短信验证码校验
export const setMessgRestsCode = params => {
    return http.post(api.auth + '/skyauth/sms/check.shtml', params).then(res => res.data)
}

//退出登录
export const getLogOut = params => {
    return http.get(api.auth + '/skyauth/oauth/logout.shtml', params).then(res => res.data)
}

//停车场列表接口
export const getParkingList = params => {
    return http.get(api.map + '/skymap/parkClassify/list', params).then(res => res.data)
}

//停车场详情(获取经纬度)
export const getParkingDetails = params => {
    return http.get(api.map + '/skymap/parkClassify/detail', params).then(res => res.data)
}

//推荐停车场
export const getRecomParking = params => {
    return http.get(api.map + '/skymap/parkOrganization/recommendPark', params).then(res => res.data)
}

//搜索目的地
export const getSeekParking = params => {
    return http.get(api.map + '/skymap/parkOrganization/getSearchParkOrg', params).then(res => res.data)
}

//保存订单
export const setSaveOrder = params => {
    return http.get(api.map + '/skymap/parkOrder/send', params).then(res => res.data)
}

//查询保存订单是否成功
export const setOrderSuccess = params => {
    return http.get(api.map + '/skymap/parkOrder/getSendState.shtml', params).then(res => res.data)
}

//获取预约费以及感谢费
export const getAccessFee = params => {
    return http.get(api.map + '/skymap/parkOrder/findAppointmentMoney', params).then(res => res.data)
}

//查询正在进行中的订单
export const getRackOrder = params => {
    return http.get(api.map + '/skymap/parkOrder/getGoingOderNo', params).then(res => {
        if (res.data.code == 200) {
            getApp().globalData.billOrder = res.data.rs ? false : true;
        } else {
            getApp().globalData.billOrder = null;
        }
        return res.data
    })
}

//获取订单详情
export const getLineItem = params => {
    return http.get(api.map + '/skymap/parkOrder/getOrderInfo', params).then(res => res.data)
}

//继续占位
export const setContinueTake = params => {
    return http.post(api.map + '/skymap/parkOrder/continueToOccupy.shtml', params).then(res => res.data)
}

//添加感谢费
export const setAccessFee = params => {
    return http.post(api.map + '/skymap/parkOrder/addThankFee', params).then(res => res.data)
}

//取消订单  返回code=200表示请求成功，code=1701表示取消时停车场已经接单。是否取消成功要调用查询状态接口， 其他打印失败信息
export const setCanceOrder = params => {
    return http.post(api.map + '/skymap/parkOrder/cancelOrder', params).then(res => res.data)
}

//小程序获取取消原因标签
export const setCanceText = params => {
    return http.get(api.mine + '/skymine/suggestion/getCancelReasonTag', params).then(res => res.data)
}

//取消订单确认 code=200表示提交成功，是否取消成功要调用查询接口
export const setCanceConfirm = params => {
    return http.post(api.map + '/skymap/parkOrder/cancelConfirm', params).then(res => res.data)
}

//获取取消状态
export const getCancelState = params => {
    return http.get(api.map + '/skymap/parkOrder/getCancelState', params).then(res => res.data)
}

//申报异常订单
export const getCompAbnormal = params => {
    return http.post(api.map + '/skymap/parkOrder/appeal.shtml', params).then(res => res.data)
}

//申诉详情
export const getCompDet = params => {
    return http.get(api.map + '/skymap/parkOrder/appealDetail.shtml', params).then(res => res.data)
}

//小程序获取取消原因标签
export const getAbnOrderText = params => {
    return http.get(api.mine + '/skymine/suggestion/getAppealTagForC', params).then(res => res.data)
}


//确认到达
export const setSaapunut = params => {
    return http.post(api.map + '/skymap/parkOrder/confirmArrive.shtml', params).then(res => res.data)
}

//生成预约费、停车费合并支付订单
export const setCostPay = params => {
    return http.post(api.map + '/skymap/parkOrder/settlement/createOrder.shtml', params).then(res => res.data)
}

//用户已线下支付
export const setEndOrder = params => {
    return http.post(api.map + '/skymap/parkOrder/settlement/underLinePayment.shtml', params).then(res => res.data)
}

//用户订单列表
export const getOrderList = params => {
    return http.get(api.map + '/skymap/parkOrder/list.shtml', params).then(res => res.data)
}

//车位地图开放城市
export const getCityList = params => {
    return http.get(api.map + '/skymap/city/getStartParkMap', params).then(res => res.data)
}

//获取车牌号
export const getPlateNum = params => {
    return http.get(api.map + '/skymap/userCar/getUserCarInfo', params).then(res => res.data)
}

//修改车牌号
export const setPlateNum = params => {
    return http.get(api.map + '/skymap/userCar/insertUserCarInfo', params).then(res => res.data)
}

//新增车牌号
export const addPlateNum = params => {
    return http.post(api.map + '/skymap/userCar/insertPlateNo', params).then(res => res.data)
}

//获取支付明细
export const getPayDet = params => {
    return http.get(api.map + '/skymap/parkOrder/settlement/detail.shtml', params).then(res => res.data)
}

//车辆认证
export const setCertifCar = params => {
    return http.post(api.map + '/skymap/userCar/insertUserCarInfo', params).then(res => res.data)
}

//编辑车辆信息
export const setEditUserCar = params => {
    return http.post(api.map + '/skymap/userCar/update', params).then(res => res.data)
}

//上传驾驶证
export const setUploadLicense = params => {
    return http.post(api.map + '/skymap/userCar/saveDrivingLicense', params).then(res => res.data)
}

//设置默认车牌
export const setIsChecked = params => {
    return http.post(api.map + '/skymap/userCar/updateIsChecked', params).then(res => res.data)
}

//获取认车辆认证列表信息
export const getUserCarList = params => {
    return http.get(api.map + '/skymap/userCar/getUserAccountCarList', params).then(res => res.data)
}

//删除车辆信息
export const setDeleteCar = params => {
    return http.post(api.map + '/skymap/userCar/del', params).then(res => res.data)
}

//获取用户是否缴纳押金  0:未缴纳，1：已交
export const getIsDeposit = params => {
    return http.get(api.mine + '/skymine/user/deposit/hasDeposit.shtml', params).then(res => res.data)
}

//获取需要支付押金的金额
export const getDepositNumber = params => {
    return http.get(api.mine + '/skymine/user/deposit/getPayDepositAmount.shtml', params).then(res => res.data)
}

//创建缴纳押金订单 
export const getPayDepositOrder = params => {
    return http.post(api.mine + '/skymine/user/deposit/createOrder.shtml', params).then(res => res.data)
}

//微信支付  192.168.11.12:8009/skymap/pay/wxPay.shtml
export const setInitePay = params => {
    return http.post(api.mine + '/skymine/pay/wxPay.shtml', params).then(res => res.data)
}

//获取支付状态
export const getPayState = params => {
    return http.get(api.mine + '/skymine/pay/state/get.shtml', params).then(res => res.data)
}

//获取押金支付状态
export const getPayDepositState = params => {
    return http.post(api.mine + '/skymine/user/deposit/getPayState.shtml', params).then(res => res.data)
}

//退押金
export const setDepositRefund = params => {
    return http.post(api.mine + '/skymine/user/deposit/refund.shtml', params).then(res => res.data)
}

//获押金取退款状态
export const getDeosReState = params => {
    return http.get(api.mine + '/skymine/user/deposit/getRefundState.shtml', params).then(res => res.data)
}

//获取用户信息
export const getSysUserInfo = params => {
    return http.get(api.mine + '/skymine/userInfo/getUserInfo.shtml', params).then(res => res.data)
}

//修改用户基本信息
export const setSysUserInfo = params => {
    return http.post(api.mine + '/skymine/userInfo/modifyUserInfo', params).then(res => res.data)
}

//意见反馈
export const setSuggestion = params => {
    return http.post(api.mine + '/skymine/suggestion/save', params).then(res => res.data)
}

//添加实名认证信息
export const setAddCertif = params => {
    return http.post(api.mine + '/skymine/userInfo/authIdentity', params).then(res => res.data)
}

//获取实名认证信息
export const getCertification = params => {
    return http.get(api.mine + '/skymine/userInfo/authIdentityInfo', params).then(res => res.data)
}

//修改用户电话
export const setPhoneNumber = params => {
    return http.post(api.mine + '/skymine/userInfo/modifyMobile', params).then(res => res.data)
}

//获取用户优惠券列表
export const setCouponList = params => {
    return http.get(api.mine + '/skymine/coupon/list.shtml', params).then(res => res.data)
}

//获取可以使用的优惠券列表
export const setUsableCouponList = params => {
    return http.get(api.mine + '/skymine/coupon/canUseList.shtml', params).then(res => res.data)
}

//邀请页面数据
export const getInviteInfo = params => {
    return http.get(api.mine + '/skymine/invite/info', params).then(res => res.data)
}

//下单分享优惠券获取分享单号接口
export const getShareOrderNo = params => {
    return http.get(api.mine + '/skymine/coupon/share/getShareOrderNo.shtml', params).then(res => res.data)
}

//抢优惠券接口
export const grabAndGetList = params => {
    return http.post(api.mine + '/skymine/coupon/share/grabAndGetList.shtml', params).then(res => res.data)
}