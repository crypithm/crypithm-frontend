/**
 * 
 * @param {string} id - id which the function will generate image for
 */

const pallete = ["3B3638"]
export function generatePfp(id){
    var canvas = document.createElement("canvas")
    canvas.width  = 100;
    canvas.height = 100;    
    var ctx = canvas.getContext("2d")
    ctx.fillStyle=`#${pallete[Math.floor(Math.random()*pallete.length)]}`
    ctx.fillRect(0,0,100,100)
    ctx.fillStyle='#9e9e9e'
    ctx.font='60px ubuntu'
    ctx.textAlign = 'center';
    ctx.fillText(id.slice(0,1),50,75,100)

    return canvas.toDataURL('image/png')
}