
module.exports = (app:any,router:any,redis:any,pool:any)=>{
  const { generateID,encodeImgBase64,createToken } = require('../util/util')

  router.post('/loginRegister',(req:any,res:any)=>{
    const paramsObj = JSON.parse(JSON.stringify(req.body))
    const listName =  paramsObj.data.username

    if(paramsObj.status){
      /**
       * 登录
       *  1.查看账户是否存在，不存在时，响应前端账户不存在，先注册
       *  2.存在账户
       *    2.1密码错误，响应前端密码错误
       *    2.2密码正确，生成token，将用户信息、token以及成功信息响应给用户
       */
      redis.hlen(listName).then((len:number)=>{
        if(!!len){
          redis.hget(listName,'password').then((pwd:string)=>{
            if(pwd === paramsObj.data.password){
              redis.hgetall(listName).then((info:any)=>{
                const token = createToken({
                  user_id:info.user_id,
                  username:info.username
                },'1d')
                res.send({
                  token,
                  userInfo:info,
                  success:'登录成功'
                })
              })
            }
            else{
              res.send({
                errMsg:'密码错误！'
              })
            }
          })
        }
        else{
          res.send({
            errMsg:'账户不存在，请先注册！'
          })
        }
      })

    }
    else{
      /**
       * 注册
       *  1.先查看用户是否已存在
       *    1.1存在，给出存在响应
       *    1.2不存在，进行注册并给出响应
       */
      let ID = generateID(),avatar = encodeImgBase64('static/avatar.jpg')

      redis.hlen(listName).then((len:number)=>{
        if (!!len){
          res.send({
            errMsg:'该账号已存在，请使用其他账号注册！'
          })
        }
        else{


          redis.hashSetObject(listName,{
            user_id:ID,
            username:paramsObj.data.username,
            password:paramsObj.data.password,
            avatar
          }).then(()=>{
            res.send({
              success:'注册成功'
            })
          })
        }
      })
    }
  })

  app.use('/',router)
}