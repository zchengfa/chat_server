require('dotenv').config({path:'.env'})
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Redis } = require('./redis/redis')

const redis = Redis()

const app = express()
const router = express.Router()
const server = http.createServer(app)

//用于解析post请求体中传递过来的参数
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//允许跨域
app.use(cors())

const { connect } = require('./mysql/pool')
const pool = connect((err:any,success:any)=>{
    if(err) console.log(err)
    if(success) console.log(success)
})

server.listen(4000,()=>{
    console.log('服务器运行中')
})

redis.on('connect',()=>{
    console.log('redis连接中')
})

redis.on('error',(err:any)=>{
    console.log('redis出现错误',err)
})

require('./socket/socket')(server,pool,redis)

require('./router/verifyToken')(app)

require('./router/index')(app,router,pool,redis)

require('./router/loginRegister')(app,router,redis,pool)



//MySQL写入朋友圈数据测试
// app.post('/saveMoments',(req:any,res:any)=>{
//     const {generateID} = require('./util/util')
//     let params = req.body,moments_id = generateID()
//
//     //chat_moments
//     let promiseOne = new Promise((resolve, reject)=>{
//         let insertChatMoments = pool.self_query.insert('chat_moments','user_id,moments_id,moments_text,send_time',`${params.user_id},${moments_id},'${params.text}',${new Date().getTime()}`)
//         pool.query(insertChatMoments,(err:any)=>{
//             if(err){
//                reject(err)
//             }
//             else{
//                 resolve(true)
//             }
//         })
//     })
//
//     //moments_images
//     let promiseTwo = new Promise((resolve, reject)=>{
//         let insertValues:any[] = []
//         params.images.forEach((item:any)=>{
//             insertValues.push({
//                 moments_id:moments_id,
//                 image:item
//             })
//         })
//         let insertMomentsImages = pool.self_query.insert('moments_images','moments_id,image',insertValues,true)
//         pool.query(insertMomentsImages,(err:any)=>{
//             if(err){
//                 reject(err)
//             }
//             else{
//                 resolve(true)
//             }
//         })
//     })
//
//     Promise.all([promiseOne, promiseTwo]).then((r:any)=>{
//         res.send('success')
//     }).catch((e:any)=>{
//         res.send('failed')
//     })
// })

