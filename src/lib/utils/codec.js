//only returns codec compatable with mediasource

import {MediaInfo} from 'mediainfo.js'

const MP4Box = require('mp4box');
let fileData= new Uint8Array(0)

export async function feed(fileu8){
    fileData=fileu8
}

export async function getMime(){
    if(fileData.length<200){
        if(fileData.length==0){
            throw new Error("No file to determine. use feed() before requesting")
        }else{
            throw new Error("Data too small")
        }
    }else{
        var mi = await MediaInfo()
        await mi.analyzeData(()=>fileData.byteLength, ()=>fileData)
    }
}
