// pages/msgList/msgList.js
Page({
    data: {
        listType: 0,
        mainList: [{
                noRead: 0,
                list: [
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: ''
                    // }
                ]
            },
            {
                noRead: 0,
                list: [
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: '../../images/recommend.png'
                    // },
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: ''
                    // },
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: '../../images/recommend.png'
                    // }
                ]
            },
            {
                noRead: 0,
                list: [
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: ''
                    // }
                ]
            },
            {
                noRead: 0,
                list: [
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: ''
                    // },
                    // {
                    //   title: '今日福利来袭，快来领取！',
                    //   createTime: '今天 11:20',
                    //   msg: '您在某某地点发布订单已经被某某的风格发静静地看赶快去查看吧！',
                    //   img: '../../images/recommend.png'
                    // }
                ]
            }
        ]
    },
    changeType(e) {
        this.data.mainList[e.currentTarget.dataset.type].noRead = 0
        this.setData({
            listType: e.currentTarget.dataset.type,
            mainList: this.data.mainList
        })
    }
})