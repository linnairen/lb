//自定义方法合集
export const Custom = {
    isNumber(o) { //判断数据类型
        return Object.prototype.toString.call(o) === '[object Number]'
    },
    isString(o) { //判断数据类型
        return Object.prototype.toString.call(o) === '[object String]'
    },
    isArray(o) { //判断数据类型
        return Object.prototype.toString.call(o) === '[object Array]'
    },
    isObject(o) { //判断数据类型
        return Object.prototype.toString.call(o) === '[object Object]'
    },
    isBoolean(o) { //判断数据类型
        return Object.prototype.toString.call(o) === '[object Boolean]'
    }
}

//删除数组指定下标元素
Array.prototype.remove = function(a) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == a) {
            this.splice(i, 1)
        }
    }
}

//清除字符串所有空格
String.prototype.skyString = function() {
    return this.replace(/ /g, '')
}

//判断字符串中是否含有指定字符
String.prototype.beString = function(s) {
    return this.indexOf(s) != -1
}

//将时间转为时间格式文本
// export const formatTimeUtil = t => {
//     const y = t.getFullYear()
//     const m = t.getMonth() + 1
//     const d = t.getDate()
//     const h = t.getHours()
//     const mi = t.getMinutes()
//     const s = t.getSeconds()
//     return [y, m, d].map(formatNumUtil).join('-') + ' ' + [h, mi, s].map(formatNumUtil).join(':')
// }

//将时间转为时间格式文本
export const formatTimeDate = t => {
    const y = t.getFullYear()
    const m = t.getMonth() + 1
    const d = t.getDate()
    return [y, m, d].map(formatNumUtil).join('-')
}

//时间1位数前面加个0
export const formatNumUtil = n => {
    return n.toString()[1] ? n : '0' + n
}

//遍历出时间数据
export const getTimeDataUtil = t => {
    let od = 0,
        oh = t.getHours(),
        om = (Math.ceil(t.getMinutes() / 5) * 5) + ((!t.getMinutes() % 5 || (t.getMinutes() % 5 == 4 && t.getSeconds() >= 50)) ? 5 : 0),
        tl = [],
        ta = [];
    if (om > 55) om = 0, oh += 1;
    if (oh == 24) oh = 0, od = 1;
    for (let i = 0; i < 5; i++) tl.push([])
    for (let i = 0 + od; i < 7 + od; i++) {
        let nt = new Date(Date.parse(t) + 86400000 * i);
        tl[0].push({
            v: nt.getFullYear() + '-' + formatNumUtil(nt.getMonth() + 1) + '-' + formatNumUtil(nt.getDate()),
            t: nt.getMonth() + 1 + '月' + nt.getDate() + '日' + (i < 3 ? ['  今天', '  明天', '  后天'][i] : '')
        })
    }
    for (let i = 0; i < 2; i++) {
        for (let j = oh; j < 24; j++) tl[i * 2 + 1].push({ v: 'T' + formatNumUtil(j) + ':', t: j + '点' })
        for (let j = om; j < 59; j += 5) tl[i * 2 + 2].push({ v: formatNumUtil(j) + ':00+08:00', t: formatNumUtil(j) + '分' })
        oh = om = 0;
    }
    for (let i = 0; i < 3; i++) ta.push(tl[i])
    return [tl, ta]
}

//传入时间戳返回时间文字
export const getDateTextUtil = tm => {
    let f = Date.parse(new Date()) - Date.parse(new Date()) % 86400000 - 28800000,
        t = new Date(parseInt(tm)),
        d = t.getMonth() + 1 + '月' + t.getDate() + '日  ';
    for (let i = 0; i < 4; i++) {
        if ((i - 1) * 86400000 + f <= tm && i * 86400000 + f > tm) {
            d = ['昨天  ', '今天  ', '明天  ', '后天  '][i]
        }
    }
    return d + t.getHours() + ':' + formatNumUtil(t.getMinutes())
}


//获取URL跳转路由
export const navigateGoUtil = (s, u, p) => {
    if (s == 'navigateTo') {
        wx.navigateTo(getUrlParamUtil(u, p))
    }
    if (s == 'redirectTo') {
        wx.redirectTo(getUrlParamUtil(u, p))
    }
    if (s == 'switchTab') {
        wx.switchTab(getUrlParamUtil(u, p))
    }
    if (s == 'reLaunch') {
        wx.reLaunch(getUrlParamUtil(u, p))
    }
}

//获取URL处理函数 传字符串为url 传键值对为参数 传值没有顺序要求
export const getUrlParamUtil = (u, p) => {
    return { url: gnu(Custom.isString(u) ? u : (Custom.isString(p) ? p : false)) + gnp(Custom.isObject(u) ? u : (Custom.isObject(p) ? p : false)) }
}

//拼接链接url
const gnu = u => {
    return u && Boolean(u.skyString()) ? '/pages/' + u.skyString() + '/' + u.skyString() : ''
}

//拼接链接参数
const gnp = p => {
    let np = '';
    for (let k in p) {
        np += '&' + k + '=' + p[k]
    }
    return np.replace('&', '?')
}