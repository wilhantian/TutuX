# 兔兔虾
by wilhan.tian

![](https://github.com/wilhantian/TutuX/blob/master/imgs/screen.png?raw=true)

## 项目说明
项目使用基于node.js + electron，可打包成mac/windows应用程序
下载功能使用Electron的WebView实现，动态解析网站html标签，对图片地址提取后批量下载

此项目不但支持对普通静态网页抓取图片，也支持对淘宝、京东等网站

## 环境搭建
```
git clone https://github.com/wilhantian/TutuX
cd TutuX
npm install
npm run start
```

## 打包
```
npm run publish
```

## 杂项
本项目最初作为商业软件，在淘宝售卖激活码
激活码的原理较为简单:

``` javascript
微信批量下载
（一定要用node做md5哦，node的md5和别的语言不一致）
npm install —save md5
const md5 = require('md5’);

var result = md5(md5('wxmpdownload_az8525722_' + this.getMacId())); //2次md5
console.log(this.getMacId(), result);
return code == result;
```
