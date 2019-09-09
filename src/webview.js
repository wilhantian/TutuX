const { ipcRenderer } = require('electron');
var url = require('url');

// 获取当前页面所有图片信息
ipcRenderer.on('getUrlData', function () {
    var group = getGroup();
    var title = getTitle();

    var cnt = 0;

    var imgs = document.querySelectorAll('img');
    var srcs = [];
    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        var alt = img.getAttribute('alt');

        var src = img.getAttribute('data-ks-lazyload') ||
            img.getAttribute('data-src') ||
            img.getAttribute('data-lazy-img') ||
            img.getAttribute('data-url') || 
            img.getAttribute('data-origin') || 
            img.getAttribute('jqimg') || 
            img.getAttribute('data-lazyload') || 
            img.src;

        if (src) {
            var info = url.parse(src);
            if (!info.protocol) {
                src = url.resolve(window.location.href, src);
            }
            var name = (cnt++) + (alt ? ('_' + alt) : '');
            name = name.substr(0, 20);
            srcs.push({
                name: name,
                src: src
            });
        }
    }

    var imgs = document.querySelectorAll('[view-name="HImageView"] div');
    for(var i=0; i<imgs.length; i++){
        var sty = imgs[i].style.backgroundImage;
        if(sty){
            sty = sty.replace(`url("`, '');
            sty = sty.replace(`")`, '');
            sty = sty.replace(`url('`, '');
            sty = sty.replace(`')`, '');

            var info = url.parse(sty);
            if (!info.protocol) {
                sty = url.resolve(window.location.href, sty);
            }
            var name = (cnt++) + '';
            srcs.push({
                name: name,
                src: sty
            });
        }
    }

    ipcRenderer.sendToHost('urlData', {
        href: window.location.href,
        group: group,
        title: title,
        list: srcs
    });
});

// 所属机构
function getGroup() {
    return VAL('#js_name') || //公众号名
        VAL('.tb-shop-name') || //淘宝详情
        VAL('.shop-name span') || //淘宝店铺-客服内
        VAL('.shop-name a') || //淘宝店铺-页面上方描述
        VAL('.slogo-shopname') || //天猫详情-页面上方描述
        VAL('.shop-intro .name .shopLink') || //天猫详情-商品紧靠的下部
        ATT('meta[property="og:title"]', 'content') || //天猫店铺meta
        VAL('.J-hove-wrap.EDropdown.fr .name') || //JD
        ATT('.J-hove-wrap.EDropdown.fr .name', 'title') ||//JD
        ATT('#popbox .im.customer-service', 'data-seller')||//JD
        '默认分组'
}

// 标题
function getTitle() {
    return VAL('#J_DetailMeta .tb-detail-hd h1') || //tm
        ATT('#J_FrmBid input[name="title"]', 'value') || //tm
        ATT('#J_Title .tb-main-title', 'data-title') || //tb
        VAL('#J_Title .tb-main-title') || //tb
        VAL('.sku-name') || //JD
        VAL('title') || //html标题
        VAL('html').substr(0,10) || //首页
        window.location.href;
}

function VAL(selector) {
    return document.querySelector(selector) && document.querySelector(selector).innerText.trim();
}
function ATT(selector, att) {
    return document.querySelector(selector) && document.querySelector(selector).getAttribute(att);
}

// 用来在chrome中执行，获取img有那些属性
function __getImgAttrs() {
    var imgs = document.querySelectorAll('img');
    var atts = [];
    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        for (var j = 0; j < img.attributes.length; j++) {
            atts.push(img.attributes[j].name);
        }
    }
    atts = atts.sort();
    for (var i = atts.length - 1; i >= 0; i--) {
        if (atts[i] == atts[i - 1]) {
            atts[i] = null;
        }
    }
    atts = atts.filter((v) => {
        return v;
    });
    return atts;
}

setInterval(()=>{
    if(window && window.scrollBy && document && document.documentElement){
        window.scrollBy(0, document.documentElement.clientHeight*1.5);
    }
}, 1999);