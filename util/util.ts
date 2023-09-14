const jwt = require('jsonwebtoken')
let secretOrPrivateKey = 'mallSecretOrPrivateKey'
function createToken (params:any,expiresTime:any) {

  //生成token,当过期时间number类型时以秒计算
  return jwt.sign(params,secretOrPrivateKey, {expiresIn: expiresTime})
}

function verifyToken (token:any,callback:Function){
  jwt.verify(token,secretOrPrivateKey,callback)
}

function generateID (digit:number = 5,radix:number = 10){
  let id = ''
  let timestamp = new Date().getTime()

  for (let i=0;i<digit;i++){
    id+=Math.floor(Math.random()*9).toString(radix)
  }
  return timestamp + id
}

function encodeImgBase64(imagePath:string){
  const path = require('path')
  const fs = require('fs')

  let index = imagePath.indexOf('.')

  let filePath = path.resolve(imagePath)

  let image = fs.readFileSync(filePath)
  let base64Img = 'data:image/' + imagePath.substring(index + 1,imagePath.length) + ';base64,' + Buffer.from(image).toString('base64')

  return base64Img
}

module.exports = {
  createToken,
  verifyToken,
  generateID,
  encodeImgBase64
}