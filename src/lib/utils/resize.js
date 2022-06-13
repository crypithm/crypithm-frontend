export function resize(imgFile, sizex, sizey){
    var fr = new FileReader()
    var canvas = document.createElement('canvas')
    let img = new Image()
    fr.readAsArrayBuffer(imgFile)
    fr.onloadend = e =>{
        var blobUri = URL.createObjectURL(e.target.result)
        img.src=blobUri
        img.onload = ()=>{
            canvas.width=sizex
            canvas.height=sizey
            var ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0,0)
            canvas.toBlob((blob)=>{
                return blob
            })
        }
    }
}