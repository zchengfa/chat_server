module.exports = (app:any,router:any,pool:any)=>{

    app.post('/searchUserInfo',(req:any,res:any)=>{
        const { value,user_id } = JSON.parse(JSON.stringify(req.body))
        /**
         * 查询搜索者信息
         */
        let confident = Number(value) ? `account = ${value}` : `username = '${value}'`
        const selectUser = pool.self_query.selectAll('users',confident)

        /**
         * 优先查询该用户下是否跟搜索的用户是好友，若是，响应好友信息，若不是则响应搜索者信息
         */
        pool.query(selectUser,(err:any,result:any)=>{
            if(err) throw err
            if(result.length){
                const userInfo = result[0]
                delete userInfo.register_time
                delete userInfo.last_login_time
                delete userInfo.password

                const selectAssociation = pool.self_query.selectAll('users_association',`user_id = ${user_id} AND friend_id = ${userInfo.user_id}`)
                pool.query(selectAssociation,(err:any,association:any)=>{

                    if(association.length){
                        const data = association[0]
                        userInfo.source = data.source
                        userInfo.notes = data.notes
                        userInfo.isFriend = true

                        res.send(userInfo)
                    }
                    else{
                        res.send(userInfo)
                    }
                })


            }
            else{
                res.send({
                    errMsg:'无法找到该用户，请检查您填写的账号是否正确。'
                })
            }

        })


    })

    app.use('/',router)
}