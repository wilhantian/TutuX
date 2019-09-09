var EventEmitter = require('events').EventEmitter;     // 引入事件模块
var E = new EventEmitter();

class Crawler{
    constructor(webview, readyCallback){
        this.canLoadUrl = false;
        this.webview = webview;
        this.readyCallback = readyCallback;
        this.isSpeedMode = true;

        this.onDomReady = ()=>{
            // this.webview.openDevTools();
            this.webview.setAudioMuted(true);
            this.webview.removeEventListener('dom-ready', this.onDomReady);

            // this.webview.addEventListener('did-stop-loading', ()=>{
            this.webview.addEventListener('dom-ready', ()=>{
                // 等待SPA页面渲染完成
                setTimeout(() => {
                    E.emit('ready');
                }, this.isSpeedMode ? 200 : 12000);
            });

            this.canLoadUrl = true;
            this.readyCallback();
        };
        this.webview.addEventListener('dom-ready', this.onDomReady);

        this.webview.addEventListener('ipc-message', (event)=>{
            var channel = event.channel;
            E.emit(channel, ...event.args);
        });
    }

    getUrlData(url, isSpeedMode){
        return new Promise((next)=>{
            this.isSpeedMode = isSpeedMode;
            if(!this.canLoadUrl){
                console.log('未初始化完成前不能调用getUrlData');
                return next(false);
            }

            this.webview.stop();

            E.once('ready', ()=>{
                E.once('urlData', (data)=>{
                    next(data);
                });
                this.webview.send('getUrlData');
            });
            try {
                this.webview.loadURL(url);     
            } catch (error) {
                next(false);
            }
        });
    }
}

module.exports = Crawler;