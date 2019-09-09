# 图片下载神器

微信批量下载
（一定要用node做md5哦，node的md5和别的语言不一致）
npm install —save md5
const md5 = require('md5’);

var result = md5(md5('wxmpdownload_az8525722_' + this.getMacId()));//2次md5
console.log(this.getMacId(), result);
return code == result;
