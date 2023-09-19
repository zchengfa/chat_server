module.exports = (server:any,pool:any) => {
    const { Server } = require('socket.io')
    const io = new Server(server,{
        cors:{
            origin:"*"
        }
    })


    let users:any = {}
    io.on('connection', (socket:any) => {

        socket.on('online',(user:string) => {
            users[user] = socket.id
            socket.name = user

            //后期操作：上线时查看当前上线者是否有再离线期间有其他用户给他发过消息，若有给上线这发送过去
            socket.emit('reciever','hello')
            console.log(user,users)
        })

        socket.on('sendMsg',(data:any) => {
            //后续操作：先查看接收者是否在线，若不在线可以将消息保存至数据库，等他上线时再给他发送消息
            console.log(data)
            if (users[data.receiver]){
                socket.to(users[data.receiver]).emit('receiveMessage',{
                    sender:data.sender,
                    msg:data.msg,
                    sendTime:data.sendTime
                })
            }
            //对方不在线，将消息存储到mongoDB中
            else {
                // let messageObj = {
                //     'message':message,
                //     'sender':sender,
                //     'sendTime':sendTime,
                //     'avatar':avatar,
                //     'receiver':receiver
                // }
                // messageModel.insertMany(messageObj,{rawResult:true}).then(res =>{
                //     console.log(res)
                // })
            }

        })
        socket.on('disconnecting',() => {
            if (users.hasOwnProperty(socket.name)) {
                delete users[socket.name]

            }

        })
    })
}