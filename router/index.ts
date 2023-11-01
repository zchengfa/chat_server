const multer = require('multer')
const path = require('path')
const {encodeImgBase64} = require('../util/util')

const storage = multer.diskStorage({
    destination: __dirname.replace('router','avatar'),
    filename:function (req:any,file:any,callback:Function) {
        let ext = path.extname(file.originalname)
        callback(null, 'uploaded_' + file.fieldname + '_' + Date.now() + ext)
    },
    limits:{
        files:2,
        fileSize:102400
    }
})

const upload = multer({storage})
module.exports = (app:any,router:any,pool:any,redis:any)=>{

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
            if(err) console.log('数据库出现错误，请检查是否开启数据库')
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

    app.post('/uploadAvatar',upload.single('avatar'),(req:any,res:any)=>{
        let tempAvatar = req.file.path,{user_id,username} = req.query
        let base64 = encodeImgBase64(tempAvatar,true)

        if(base64){
            redis.hgetall(username,(err:any,info:any)=>{
                let originInfo = info
                originInfo.avatar = base64
                redis.hashSetObject(username,originInfo).then(()=>{
                    let updateAvatar = pool.self_query.update('users',`avatar = '${base64}'`,`user_id = ${Number(user_id)}`)
                    pool.query(updateAvatar,(e:any,result:any)=>{
                        if(e){
                            if(e.code === 'ER_DATA_TOO_LONG'){
                                res.send({
                                    err:'图片尺寸过大，请重新选择图片'
                                })
                            }
                        }
                        if(result){
                            res.send({avatar:base64})
                        }
                    })
                })
            })

        }
    })

    app.use('/',router)
}