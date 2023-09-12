const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { redis } = require('./redis/redis')

const result = redis({password:19961212})

result ? console.log('连接redis成功') : console.log('连接redis失败')

const app = express()
const router = express.Router()
const server = http.createServer(app)

//用于解析post请求体中传递过来的参数
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

//允许跨域
app.use(cors())

const pool = require('./mysql/pool')()

app.use('/test',(req:any,res:any)=>{

    res.send('666')
})


server.listen(3000,()=>{
    console.log('服务器运行中')
})

require('./socket/socket')(server,pool)

require('./router/loginRegister')(app,router,result)