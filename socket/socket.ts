module.exports = (server:any,pool:any) => {
    const { Server } = require('socket.io')
    const io = new Server(server,{
        cors:{
            origin:"*"
        }
    })


    let users = {}
    io.on('connection', (socket:any) => {

        socket.on('online',(user:any) => {
            // users[user] = socket.id
            // socket.name = user
            console.log(user + '上线了',socket.id,13)
        })

        socket.on('sendMsg',() => {
            //console.log(message,sender,receiver,sendTime,avatar)

        })
        socket.on('disconnecting',() => {
            // if (users.hasOwnProperty(socket.name)) {
            //     delete users[socket.name]
            //
            // }

        })
    })
}