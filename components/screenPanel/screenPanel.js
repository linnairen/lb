let _compData = {
    '_screenPanel_.isLoading': true // 控制组件显示隐藏
}
let screenPanel = {
    screenShow() {
        this.setData({
            '_screenPanel_.isLoading': true
        })
    },
    screenHide() {
        setTimeout(() => {
            this.setData({
                '_screenPanel_.isLoading': false
            })
        }, 900)
    }
}


function ScreenPanel() {
    let pages = getCurrentPages(),
        curPage = pages[pages.length - 1];
    this.__page = curPage;
    Object.assign(curPage, screenPanel)
    curPage.screenPanel = this;
    curPage.setData(_compData)
    return this;
}
module.exports = { ScreenPanel }