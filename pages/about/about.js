import { getCustomerTel } from '../..//api/api.js'

Page({
    data: {
        phoneNumber: ''
    },
    onLoad() {
        getCustomerTel().then(data => {
            if (data.code == 200) {
                this.setData({
                    phoneNumber: data.rs.customerTel
                })
            }
        })
    },
    call() {
        wx.makePhoneCall({
            phoneNumber: this.data.phoneNumber
        })
    }
})