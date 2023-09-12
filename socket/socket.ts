module.exports = (server:any,pool:any) => {
    const { Server } = require('socket.io')
    const io = new Server(server,{
        cors:{
            origin:"*"
        }
    })


    let users = []
    io.on('connection', (socket:any) => {

        socket.on('online',(user:string) => {
            //users[user] = socket.id
            users.push({
                userSocketId:socket.id,
                user
            })
            socket.name = user
            console.log(user)
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