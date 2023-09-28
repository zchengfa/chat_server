

module.exports = (server:any,pool:any) => {
    const { Server } = require('socket.io')
    const io = new Server(server,{
        cors:{
            origin:"*"
        }
    })


    let users:any = {}
    io.on('connection', (socket:any) => {

        socket.on('online',(user:any) => {
            const {name,user_id} = user
            users[name] = socket.id
            socket.name = name

            /**
             * 后期操作：
             * 1.上线时查看当前上线者是否有在离线期间有其他用户给他发过消息，若有给上线者发送过去
             * 2.上线时给上线者发送好友信息
             */
            let userData:any = {}

            /**
             * 获取好友列表
             */
            let friendListPromise = ()=>{
                const selectFriendList = pool.self_query.selectFields('users_association','friend_id',`user_id = ${user_id}`)
                return new Promise((resolve, reject)=>{
                    pool.query(selectFriendList,(err:any,result:any)=>{
                        if(err){
                            reject(err)
                        }
                        if(result){
                            resolve(result)
                        }
                    })
                })
            }

            friendListPromise().then((res:any)=>{
                let data:any[] = []
                return new Promise((resolve, reject)=>{
                    if(res.length){
                        res.map((item:any,index:number)=>{

                            const friendInfo = pool.self_query.selectWithInnerJoin('users','users_association','*','u','us',`u.user_id = us.friend_id and us.user_id = ${user_id}`)
                            pool.query(friendInfo,(err:any,result:any)=>{
                                if(err){
                                    reject(err)
                                }
                                if(result){
                                    result[index].user_id = result[index].friend_id
                                    data.push(deleteValue(result[index]))

                                    if(data.length === res.length){
                                        resolve(data)
                                    }
                                }
                            })
                        })
                    }
                    else{
                        resolve([])
                    }
                })
            }).then((res:any)=>{
                userData['friendList'] = res
                socket.emit('reciever',userData)
            })

            /**
             * 获取未收到的消息(待完善)
             */

            console.log(users)
        })

        socket.on('sendMsg',(data:any) => {
            //后续操作：先查看接收者是否在线，若不在线可以将消息保存至数据库，等他上线时再给他发送消息
            const receiver = data.receiver
            console.log(data)
            if (users[receiver]){
                socket.to(users[receiver]).emit('receiveMessage',{
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
        //接收前端发出的好友申请
        // {
        //     senderMsg:data.formData.sender,
        //     senderUsername:data.sender.SUA,
        //     sender_id:data.sender.SUN,
        //     senderAccount:data.sender.SA
        // }
        socket.on('sendFriendRequest',(data:any)=>{
            socket.emit('sendRequestSuccess')
            const receiver = data.receiver.RUA
            if(users[receiver]){
                //console.log(data)
                socket.to(users[receiver]).emit('receiveFriendRequest',data)
            }
            else{
                //用户不在线
            }
            //console.log(data,'用户发送了好友申请')
        })
        socket.on('acceptApply',(data:any)=>{


            const receiver = data.receiver.info.username
            const senderNotes = data.sender.formData.notes
            const senderChatOnly = data.sender.formData.friendCircleSport
            const senderAllow = data.sender.formData.allow
            const senderLook = data.sender.formData.look
            const senderTags = data.sender.formData.tags

            const rNotes = data.receiver.formData.notes
            const rChatOnly = data.receiver.formData.friendCircleSport
            const rAllow = data.receiver.formData.allow
            const rLook = data.receiver.formData.look
            const rTags = data.receiver.formData.tags

            //同意添加好友，为双方建立好友关系
            let selfPromise = ()=>{
                const insertFriendForSelf = pool.self_query.insert('users_association','user_id,friend_id,notes,source,tags,chatOnly,look,allow',
                    `${data.sender.info.RUN},${data.receiver.info.user_id},'${senderNotes ? senderNotes:null}','${'对方'+data.source}',
                 '${senderTags ? senderTags : null}',${!senderChatOnly},${!senderLook},${!senderAllow}
                `
                )
                return new Promise((resolve, reject)=>{
                    pool.query(insertFriendForSelf,(err:any,result:any)=>{
                        if(err){
                            reject(err)
                        }
                        if(result){
                            resolve(true)
                        }
                    })
                })
            }

            let selfInfoPromise = ()=>{
                const selectSelfInfo = pool.self_query.selectWithInnerJoin('users','users_association','*','u','us',`u.user_id = us.friend_id and us.user_id = ${data.sender.info.RUN}`)
                return promiseQuery(pool,selectSelfInfo,data.receiver.info.user_id)
            }

            let receiverInfoPromise = ()=>{
                const selectReceiverInfo = pool.self_query.selectWithInnerJoin('users','users_association','*','u','us',`u.user_id = us.friend_id and us.user_id = ${data.receiver.info.user_id}`)
                return promiseQuery(pool,selectReceiverInfo,data.sender.info.RUN)
            }

            let receiverPromise = ()=>{
                const insertFriendForReceiver = pool.self_query.insert('users_association','user_id,friend_id,notes,source,tags,chatOnly,look,allow',
                    `${data.receiver.info.user_id},${data.sender.info.RUN},'${rNotes ? rNotes:null}','${data.source}',
                 '${rTags ? rTags : null}',${!rChatOnly},${!rLook},${!rAllow}
                `
                )

                return new Promise((resolve, reject)=>{
                    pool.query(insertFriendForReceiver,(err:any,result:any)=>{
                        if(err){
                            reject(err)
                        }
                        if(result){
                            resolve(true)
                        }
                    })
                })
            }



            let promiseAll = Promise.all([selfPromise(),receiverPromise()])

            promiseAll.then(()=>{
                selfInfoPromise().then((selfInfo:any)=>{

                    socket.emit('hadAcceptApply',selfInfo)

                })

                receiverInfoPromise().then((receiverInfo:any)=>{

                    socket.to(users[receiver]).emit('friendHadAcceptApply',receiverInfo)

                })


            }).catch((err:any)=>{
                console.log(err)
            })

        })
        socket.on('disconnecting',() => {
            if (users.hasOwnProperty(socket.name)) {
                delete users[socket.name]

            }
        })
    })
}

function promiseQuery(pool:any,statement:string,id:number | string){
    return new Promise((resolve, reject)=>{
        pool.query(statement,(err:any,res:any)=>{
            if(err){
                reject(err)
            }
            if(res){
                let data = {}
                res.map((item:any)=>{

                    if(Number(id) === item.friend_id){
                        item.user_id = item.friend_id
                        data = deleteValue(item)
                    }

                })
                resolve(data)
            }
        })
    })
}

function deleteValue(obj:any,propertyArr:string[] = ['password','last_login_time','register_time','friend_id']){
    propertyArr.map((item:string)=>{
        delete obj[item]
    })

    return obj
}