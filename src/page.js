var $ = require('jquery');
var utils = require('./utils');
var userHome = require('user-home');
const filenamify = require('filenamify');
const path = require('path');
const URL = require("url");
const { shell, ipcRenderer, clipboard } = require('electron');
const Crawler = require('./Crawler');

function logSuccess(text, callback) {
    $('.log').html(`<color style="color:#4aad4a;" class="callback">${text}</color>`);
    $('.log').off('click');
    $('.log').on('click', callback);
}
function logError(text, callback) {
    $('.log').html(`<color style="color:#ff4747;">${text}</color>`);
    $('.log').off('click');
    $('.log').on('click', callback);
}
function log(text) {
    $('.log').html(text);
    $('.log').off('click');
}

function getUserHome() {
    return utils.getVal('downloadpath') || path.join(userHome, 'wxmpdownload');
}

function setProgress(cur) {
    $('.progress').css('width', (cur * 100) + '%');
}

function closeDownload() {
    $('#download-btn').attr('disabled', 'disabled');//禁用按钮
    $('#download-btn').val('请稍候');
}

function openDownload() {
    $('#download-btn').removeAttr('disabled');//启用按钮
    $('#download-btn').val('下载');
}

async function download() {
    if (!utils.isBuy() && utils.getTestCnt() <= 0) {
        logError('试用次数已用完', () => {
            $('.buy').show();
        });
        $('.buy').show();
        return;
    }

    var url = $('#url').val().trim();
    var urlInfo = URL.parse(url);
    if (!urlInfo || !urlInfo.protocol) {
        logError('文章地址需以http或https开头');
        return;
    }

    closeDownload();
    log('抓取并分析目标页面');

    var infos = await crawler.getUrlData(url, isSpeedMode());

    if (infos) {
        if (!utils.isBuy()) {
            // 累计试用次数
            utils.useTestCnt();
            updateTestCnt();
        }

        var date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
        var dir = path.join(getUserHome(), filenamify(date), filenamify(infos.group) || date, filenamify(infos.title) || '未知标题');
        console.log(dir);
        var errorCnt = 0;
        for (var i = 0; i < infos.list.length; i++) {
            var img = infos.list[i];
            var result = await utils.download(img.src, dir, img.name);
            if (!result) {
                errorCnt++;
            }
            else{
                if(result.ext.indexOf('webp') >= 0){
                    await utils.webp2png(result.pathname);
                }
            }
            setProgress((i + 1) / infos.list.length);
            log(`正在下载 ${i + 1}/${infos.list.length}`);
        }
        // 成功${infos.list.length-errorCnt} 失败${errorCnt}
        if(infos.list.length > 0){
            logSuccess(`下载完成`, () => {
                shell.openItem((getUserHome()));//打开文件夹
            });
        }
        else{
            logError('目标页面未找到图片');
        }
        openDownload();
    }
    else {
        logError('请检查您的网络或公众号地址是否正确');
        openDownload();
    }
}

function setDownloadPath() {
    ipcRenderer.send('open-directory-dialog', 'openDirectory');
    ipcRenderer.on('selectedItem', (e, path) => {
        if (path) {
            utils.setVal('downloadpath', path);
        }
    });
}

function checkcode() {
    var code = $('#code').val().trim();
    if (utils.checkCode(code)) {
        $('#buy-btn').hide();
        $('#kefu-btn').show();
        $('.buy').hide();
        logSuccess('激活成功，感谢您购买');
    }
}

function updateTestCnt() {
    $('#testCnt').text(utils.getTestCnt());
    console.log(utils.getTestCnt())
}

//-------------------
$('#setdir').click(() => {
    setDownloadPath();
});

$('#copy-mac').click((e) => {
    var evt = e ? e : window.event;
    if (evt.stopPropagation) {
        evt.stopPropagation();
    }
    clipboard.writeText(utils.getMacId());
});

$('.buy').click(() => {
    $('.buy').hide();
});

// 买了就不显示购买了
if (utils.isBuy()) {
    $('#buy-btn').hide();
    $('#kefu-btn').show();
}
else {
    $('#buy-btn').show();
    $('#kefu-btn').hide();

    $('#buy-btn').click(() => {
        $('.buy').show();
    });
}

$('.code-form').click((e) => {
    var evt = e ? e : window.event;
    if (evt.stopPropagation) {
        evt.stopPropagation();
    }
})

$('#macid').text(utils.getMacId());


$('.stopProp').on('click', (e) => {
    var evt = e ? e : window.event;
    if (evt.stopPropagation) {
        evt.stopPropagation();
    }
});

$('.close-group').click(() => {
    console.log('x');
    // 关闭
    ipcRenderer.send('window-close');
});

$('#speedMode').on('change', (x)=>{
    if($('#speedMode')[0].checked){
        $('#shopMode')[0].checked = false;
    }
    else{
        $('#shopMode')[0].checked = true;
    }
    updateModeTip();
});
$('#shopMode').on('change', (x)=>{
    if($('#shopMode')[0].checked){
        $('#speedMode')[0].checked = false;
    }
    else{
        $('#speedMode')[0].checked = true;
    }
    updateModeTip();
});

function isSpeedMode(){
    return $('#speedMode')[0].checked;
}

function updateModeTip(){
    if(isSpeedMode()){
        log('极速模式适合: 公众号|新闻|文章|官网')
    }
    else{
        log('电商模式适合: 电商|相册|论坛')
    }
}

updateTestCnt();//更新剩余次数

//--------------------------
const webview = document.querySelector('webview');
window.webview = webview;

closeDownload();
var crawler = new Crawler(webview, async ()=>{
    openDownload();
    // console.log('crawler inited');
    // var data = await crawler.getUrlData('https://m.baidu.com');
    // console.log('1', data);

    // var xxx = await crawler.getUrlData('https://m.qq.com');
    // console.log('2', xxx);
});