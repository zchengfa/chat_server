const http = require('http')
const express = require('express')

const { redis } = require('./redis/redis')

const result = redis({password:19961212})

result ? console.log('连接redis成功') : console.log('连接redis失败')

const app = express()
const server = http.createServer(app)

const pool = require('./mysql/pool')()

app.use('/test',(req:any,res:any)=>{

    res.send('666')
})

server.listen(6666,()=>{
    console.log('服务器运行中')
})

require('./socket/socket')(server,pool)

