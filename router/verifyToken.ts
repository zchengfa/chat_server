module.exports = (app:any) =>{
  const { verifyToken } = require('../util/util')
  const urlWhiteList:string[] = [
    '/loginRegister'
  ]
  app.use((req:any,res:any,next:Function)=>{
    //请求地址不在白名单内，需要验证token
    if(urlWhiteList.indexOf(req.url) === -1){
      const token = req.headers.authorization
      verifyToken(token,(err:any,decode:any)=>{
        if(err) throw err
        !decode ? res.send({code:401,errMsg:'token信息错误（不存在或token信息已过期）'}) : next()
      })

    }
    else{
      next()
    }
  })
}