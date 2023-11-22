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

const { mysql_query,connect } = require('./mysql/pool')
const pool = connect((err:any,success:any)=>{
    if(err) console.log(err)
    if(success) console.log(success)
})
pool.self_query = mysql_query

server.listen(4000,()=>{
    console.log('服务器运行中')
})


redis.on('connect',()=>{
    console.log('redis连接中')
})

redis.on('error',(err:any)=>{
    console.log('redis出现错误',err)
})

require('./socket/socket')(server,pool)

require('./router/verifyToken')(app)

require('./router/index')(app,router,pool,redis)

require('./router/loginRegister')(app,router,redis,pool)

