
//thumbnailSize:80x80
//#5e5e5e

import {resize} from "./resize"
export function FileThumbnail(file, fileMime){
    let fileType = fileMime.split("/")[1]
    if(fileType=="video"){
        var htmlVidTag = document.createElement('video')
        htmlVidTag.src=""
    }else if(fileType=="image"){

    }
    var thumb = resize(file, 80,80)
    return URL.createObjectURL(thumb)
}