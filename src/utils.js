const fs = require('fs');
import {machineIdSync} from 'node-machine-id';
const download = require('download');
const fileType = require('file-type');
const filendir = require('filendir');
const path = require('path');
const filenamify = require('filenamify');
var webp = require('webp-converter');

const md5 = require('md5');

module.exports = {
    download(src, dir, name){
        return new Promise((next)=>{
            download(src).then(function(data){
                var ftype = fileType(data);
                var pathname = `${dir}/${filenamify(name)}.${ftype.ext}`;
                filendir.writeFileSync(pathname, data);
                next({
                    pathname: pathname,
                    ext: ftype.ext
                });
            }).catch(function(err){
                console.log(err);
                next(false);
            });
        });
    },
    webp2png(input){
        return new Promise((next)=>{
            var output = path.parse(input);
            if(output){
                output.base = undefined;
                output.ext = '.png';
                output = path.format(output);

                webp.dwebp(input, output, '-o', (status)=>{
                    console.log('to png', output, status);
                    fs.unlinkSync(input);
                    next(true);
                });
            }else{
                console.log('error to png', output);
                next(true);
            }
        });
    },
    setVal(key, val){
        localStorage.setItem('wxmpdownload_'+key, val);
    },

    getVal(key){
        return localStorage.getItem('wxmpdownload_'+key);
    },

    getTestCnt(){
        var cnt = this.getVal('testCnt');
        if(!cnt){
            cnt = 5;
        }
        if(typeof cnt == 'string'){
            cnt = parseInt(cnt);
            if(cnt < 0){
                cnt = 0;
            }
        }
        return  cnt || 0;
    },

    useTestCnt(){
        var curCnt = this.getTestCnt('testCnt') - 1;
        if(curCnt < 0){
            curCnt = 0
        }
        this.setVal('testCnt', curCnt);
    },

    getMacId(){
        return machineIdSync(true);
    },

    checkCode(code){
        var result = md5(md5('wxmpdownload_az8525722_' + this.getMacId()));
        console.log(this.getMacId(), result);
        if(code == result){
            this.setVal('isBuy', 'true');
            return true;
        }
        return false;
    },

    isBuy(){
        return this.getVal('isBuy') == 'true';
    }
};