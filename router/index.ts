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
      if(err) console.log(err)
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

  app.post('/groupStranger',(req:any,res:any)=>{
    const {groupId,user_id} = req.body

    //查询群聊中所有成员的id
    let groupIdPromise = new Promise((resolve, reject)=>{
      const selectGroup = pool.self_query.selectFields('user_group','user_id,note,nickname_Group',`group_id = '${groupId}'`)
      pool.query(selectGroup,(e:any,group:any)=>{
        if(e) reject(e)
        if(group){
          let groupArr:number[] = []
          group.forEach((item:any)=>{
            groupArr.push(item.user_id)
          })
          resolve(groupArr)
        }
      })
    })

    //查询用户所有好友id
    let associationPromise = new Promise((resolve, reject)=>{
      const selectAssociation = pool.self_query.selectFields('users_association','friend_id',`user_id = ${user_id}`)
      pool.query(selectAssociation,(e:any,association:any)=>{
        if(e) reject(e)
        if(association){
          let associationArr:number[] = []
          association.forEach((item:any)=>{
            associationArr.push(item.friend_id)
          })
          resolve(associationArr)
        }
      })
    })

    //都查询完成后，再判断是否有与当前用户不是好友关系的id，若有则查询这些用户信息并与群聊中好友id一起返回给前端
    Promise.all([groupIdPromise,associationPromise]).then((all:any)=>{
      let groupIds = all[0],associationIds = all[1],strangerIds:number[] = [],strangerUsers:any[] = [],groupFriendIds:number[] = []
      groupIds.forEach((item:any)=>{
        //获取群聊中陌生人id
        if(associationIds.indexOf(item) === -1 && item !== user_id){
          strangerIds.push(item)
        }
        //获取群聊中跟自己是好友的id
        else if(associationIds.indexOf(item) !== -1 && item !== user_id){
          groupFriendIds.push(item)
        }
      })

      if(strangerIds.length){
        strangerIds.forEach((item:any)=>{
          const selectUser = pool.self_query.selectFields('users','user_id,username,avatar',`user_id = ${item}`)
          pool.query(selectUser,(e:any,user:any)=>{
            strangerUsers.push(user[0])
            if(strangerUsers.length === strangerIds.length){
              //全部获取完，返回给前端
              res.send({strangerUsers,friendIds:groupFriendIds})
            }
          })
        })
      }
      else{
        //没有非好友，直接返回空数组给前端
        res.send({strangerUsers:[],friendIds:groupFriendIds})
      }
    })

  })

  app.use('/',router)
}