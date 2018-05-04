let _compData = {
    '_toastPanel_.isHide': false, // 控制组件显示隐藏
    '_toastPanel_.toastIcon': '', //类型
    '_toastPanel_.toastText': '' // 显示的内容
}
let toastPanel = {
    toast: function(toastIcon, toastText, toastTime) {
        this.setData({
            '_toastPanel_.isHide': toastText ? true : false,
            '_toastPanel_.toastIcon': toastIcon,
            '_toastPanel_.toastText': toastText
        })
        if (toastText && toastTime)
            setTimeout(() => {
                this.setData({ '_toastPanel_.isHide': false })
            }, parseInt(toastTime))
    },
    loading: function(toastText, toastTime) {
        this.toast('loading', toastText === false ? false : toastText || '加载中...', toastTime || false)
    }
}

['success', 'success_no_circle', 'info', 'warn', 'waiting', 'cancel', 'download', 'search', 'clear'].forEach(key => {
    toastPanel[key] = function(toastText, toastTime) {
        this.toast(key, toastText || false, toastTime || 1500)
    }
})

function ToastPanel() {
    let pages = getCurrentPages(),
        curPage = pages[pages.length - 1];
    this.__page = curPage;
    Object.assign(curPage, toastPanel)
    curPage.toastPanel = this;
    curPage.setData(_compData)
    return this;
}
module.exports = { ToastPanel }