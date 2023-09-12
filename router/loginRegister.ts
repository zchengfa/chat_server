
module.exports = (app:any,router:any,redis:any)=>{

  router.post('/loginRegister',(req:any,res:any)=>{
    const paramsObj = JSON.parse(JSON.stringify(req.body))

    // redis.lpush('user',JSON.stringify({
    //   username:paramsObj.data.username,
    //   password:paramsObj.data.password
    // }))
    //
    // redis.llen('user').then((len:any)=>{
    //
    //   redis.lrange('user',0,len).then((result:any)=>{
    //     console.log(result)
    //   })
    // })

    paramsObj.status ? res.send('login') : res.send('register')
  })

  app.use('/',router)
}