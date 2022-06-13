
//thumbnailSize:80x80
//#5e5e5e

import {resize} from "./resize"
export function FileThumbnail(file){
    var thumb = resize(file, 80,80)
    return URL.createObjectURL(thumb)
}