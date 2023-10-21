const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const gm = require('gm').subClass({ imageMagick: true })


let secretOrPrivateKey = 'mallSecretOrPrivateKey'
function createToken (params:any,expiresTime:any) {

  //生成token,当过期时间number类型时以秒计算
  return jwt.sign(params,secretOrPrivateKey, {expiresIn: expiresTime})
}

function verifyToken (token:any,callback:Function){
  jwt.verify(token,secretOrPrivateKey,callback)
}

function generateID (digit:number = 5,timeStamp:boolean = true,radix:number = 10){
  let id = ''
  let timestamp = new Date().getTime().toString().substring(0,5)

  for (let i=0;i<digit;i++){
    id+=Math.floor(Math.random()*9).toString(radix)
  }

  if( Number(id.substring(0,1)) === 0){
    generateID()
  }
  return timeStamp ? timestamp + id : id
}

function encodeImgBase64(imagePath:string){

  let index = imagePath.indexOf('.')

  let filePath = path.resolve(imagePath)

  let image = fs.readFileSync(filePath)

  return 'data:image/' + imagePath.substring(index + 1,imagePath.length) + ';base64,' + Buffer.from(image).toString('base64')

}

function timeFormatting (fm:string,time:any){
  //拓展Date的时间格式化函数
  // @ts-ignore
  Date.prototype.format = function (fmt){
    let formatObject = {
      "M+": this.getMonth() + 1,                   //月份
      "d+": this.getDate(),                        //日
      "h+": this.getHours(),                       //小时
      "m+": this.getMinutes(),                     //分
      "s+": this.getSeconds(),                     //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds()                  //毫秒
    };

    //  获取年份
    // ①
    if (/(y+)/i.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (let k in formatObject) {
      // ②
      if (new RegExp("(" + k + ")", "i").test(fmt)) {
        fmt = fmt.replace(
            //@ts-ignore
            RegExp.$1, (RegExp.$1.length === 1) ? (formatObject[k]) : (("00" + formatObject[k]).substr(("" + formatObject[k]).length)));
      }
    }
    return fmt;
  }
  if (time){
    return time.format(fm)
  }
  else {
    // @ts-ignore
    return new Date().format(fm)
  }

}




function appendAvatar(avatarArr:string[]){
  let allImagePath:any[] = []
  avatarArr.map((item:any)=>{
    let filename = item.id +  '.png'
    let base64 = item.avatar.replace(/^data:image\/\w+;base64,/,'')
    let buffer = Buffer.from(base64,'base64')
    let pt = path.join(__dirname,filename)
    fs.writeFileSync(pt,buffer)
    gm(pt).resize(48,48).write(pt,(err:any)=>{
      if(err) console.log(err)
      allImagePath.push(pt)
      if(allImagePath.length === avatarArr.length){
        let direction = true,ip= path.join(__dirname, 'append.png')
        allImagePath.map((img:string,index:number)=>{
          direction = true
          direction = !(index === 3 || index === 5);
          console.log(direction)
          gm(ip).append(img,direction).write(ip,()=>{})
          
        })
      }
    })
  })




}


module.exports = {
  createToken,
  verifyToken,
  generateID,
  encodeImgBase64,
  timeFormatting,
  appendAvatar
}