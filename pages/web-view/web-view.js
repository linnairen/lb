let urls = ['https://lb-view.cheweiditu.com/law.html']

Page({
    data: {
        url: ''
    },
    onLoad(options) {
        wx.setNavigationBarTitle({
            title: ''
        })
        this.setData({
            url: urls[parseInt(options.index)] + '?_id=' + Date.parse(new Date())
        })
    }
})