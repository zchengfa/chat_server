import {dirname} from "path";

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

function encodeImgBase64(imagePath:string,removeOrigin:boolean = false ){

  let index = imagePath.indexOf('.')

  let filePath = path.resolve(imagePath)

  let image = fs.readFileSync(filePath)

  if (removeOrigin){
    fs.rmSync(filePath)
  }

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


/**
 * 头像拼接
 * @param avatarArr { Array } 头像数组
 * @param size { Number } 图片尺寸
 * @param callback  { Function } 回调函数
 */
function appendAvatar(avatarArr:string[],size:number = 48,callback:Function = ()=>{}){
  //设置头像存放的文件夹路径
  let temp = __dirname.replace('util','temp')

  //判断是否存在该文件夹，不存在就创建一个文件夹
  if(!fs.existsSync(temp)){
    fs.mkdirSync(temp)
  }

  let  allPath = [],pathOne:any[] = [],pathTwo:any[] = [],pathThree:any[] = [],ip= path.join(temp, 'append.png')
  let row:number = Math.ceil(avatarArr.length/3)

  //将头像放入对应的数组中
  for (let i = 0; i < row; i++) {
    let arr = pathOne,start = i === 0 ? 0 : i*3,end = i === 0 ? 3 : (i+1)*3

    i === 1 ? arr = pathTwo : null
    i === 2 ? arr = pathThree : null

    arr.push(...avatarArr.slice(start,end))
    allPath.push(arr)
  }

  //遍历总数组，根据数组中的数据将图片写入到定好的文件夹中
  allPath.map((p:any,index:number)=>{
    if(p.length){
      let iPath:any[] = [],imgP = path.join(temp, 'append'+index+'.png')
      p.map((item:any)=>{
          let filename = item.user_id +  '.png',base64 = item.avatar.replace(/^data:image\/\w+;base64,/,''),buffer = Buffer.from(base64,'base64'),pt = path.join(temp,filename)
          fs.writeFileSync(pt,buffer)
          iPath.push(pt)
      })
      //将小数组中的头像从左往右拼接，呈行排列
      gm(imgP).append(iPath[0],true).append(iPath[1],true).append(iPath[2],true).write(imgP,()=>{
        if(index === (row -1)){
          //设置处理完的头像存放地
          let fip = path.join(temp, 'finally.png')

          //再将呈行排列的头像从上至下拼接，呈列排列
          gm(fip).append(path.join(temp,'append0.png')).append(path.join(temp,'append1.png')).append(path.join(temp,'append2.png')).write(fip,()=>{
            gm(fip).resize(size,size).write(fip,()=>{
              callback(encodeImgBase64(fip))
              let files = fs.readdirSync(temp)

              files.map((file:any)=>{
                fs.rmSync(path.join(temp , file))
              })
            })
          })
        }
      })
    }
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