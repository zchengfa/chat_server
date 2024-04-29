import {it} from "node:test";

const multer = require('multer')
const path = require('path')
const {encodeImgBase64} = require('../util/util')

const storage = multer.diskStorage({
  destination: process.cwd().replace('router','avatar'),
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

  router.post('/getChatMoments',(req:any,res:any)=>{
    let user_id = req.body.user_id,time = new Date().getTime(),thresholdTime = 3*24*60*60*1000
    /**
     * 获取用户和用户好友发过的朋友圈数据
     * 1.获取当前用户的user_id,username,avatar数据
     * 2.获取用户好友id存储到数组中
     * 3.根据id列表以及当前时间来获取距离当前时间多久之前的朋友圈数据（要获取用户和朋友信息，朋友圈文字、图片，点赞人以及评论数据）
     */
    //获取与当前用户相关的好友信息
    let userSelect = pool.self_query.selectFields('users_association','friend_id',`user_id = ${user_id}`)
    let userSelectPromise =  ()=>{
      return new Promise((resolve, reject)=>{
        pool.query(userSelect,(err:any,ids:any)=>{
          if(err){
            reject(err)
          }
          else{
            let data:any[] = []
            ids.map((item:any)=>{
              data.push(item['friend_id'])
            })
            data.unshift(user_id)
            resolve(data)
          }
        })
      })
    }

    //获取自己和好友发送过的朋友圈数据
    function getChatMomentsData(user_id:number | string){

      function queryPool(select:any,resolve:any, reject:any){
        pool.query(select,(err:any,u:any)=>{
          if(err){
            reject(err)
          }
          else{
            resolve(u)
          }
        })
      }
      //获取用户信息
      let selectUserInfoPromise = ()=>{
        return new Promise((resolve, reject)=>{
          let select = pool.self_query.selectFields('users','user_id,username,avatar',`user_id = ${user_id}`)
          queryPool(select,resolve,reject)
        })
      }

      //获取用户朋友圈text
      let selectUserMomentsPromise = ()=>{
        return new Promise((resolve, reject)=>{
          let select = pool.self_query.selectAll('chat_moments',`user_id = ${user_id}`)
          queryPool(select,resolve,reject)
        })
      }

      //获取朋友圈images
      let selectMomentsImagePromise = (moments_id:number)=>{
        return new Promise((resolve, reject)=>{
          let select = pool.self_query.selectFields('moments_images','image',`moments_id = ${moments_id}`)
          queryPool(select,resolve,reject)
        })
      }

      //获取朋友圈点赞者
      let selectMomentsLikedPromise = (moments_id:number)=>{
        return new Promise((resolve, reject)=>{
          let select = pool.self_query.selectFields('moments_liked','like_user_id',`moments_id = ${moments_id}`)
          queryPool(select,resolve,reject)
        })
      }

      //获取朋友圈评论
      let selectMomentsCommentsPromise = (moments_id:number)=>{
        return new Promise((resolve, reject)=>{
          let select = pool.self_query.selectFields('moments_comments','comments_user_id,comments_id,comments_text',`moments_id = ${moments_id}`)
          queryPool(select,resolve,reject)
        })
      }

      //获取点赞者或评论者的昵称
      let selectUserNamePromise = (user_id:number)=>{
        return new Promise((resolve, reject)=>{
          let select = pool.self_query.selectFields('users','username',`user_id = ${user_id}`)
          queryPool(select,resolve,reject)
        })
      }

      return new Promise((resolve, reject)=>{
        Promise.all([selectUserInfoPromise(),selectUserMomentsPromise()]).then((r:any)=>{
          //若有朋友圈数据
          if(r[1].length){
            let moments:any = {}
            moments['user'] = r[0][0]
            moments['location'] = r[1][0]['location']
            //删除不需要的数据
            delete r[1][0]['id']
            delete r[1][0]['user_id']
            delete r[1][0]['location']
            moments['content'] = r[1][0]
            moments['content']['images'] = []
            moments['liked'] = []
            moments['comments'] = []
            //通过moments_id获取朋友圈images、liked、comments数据
            Promise.all([selectMomentsImagePromise(moments['content']['moments_id']),selectMomentsLikedPromise(moments['content']['moments_id']),selectMomentsCommentsPromise(moments['content']['moments_id'])]).then((o:any)=>{

              o[0]?.map((item:any)=>{
                moments['content']['images'].push(item.image)
              })

              //根据点赞者id获取点赞者昵称、根据评论者id获取评论者昵称
              let promiseStatement:any[] = []
              o[1]?.map((item:any)=>{

                promiseStatement.push(selectUserNamePromise(item['like_user_id']))
              })
              o[2]?.map((item:any)=>{
                promiseStatement.push(selectUserNamePromise(item['comments_user_id']))
              })
              Promise.all(promiseStatement).then((usernameArr:any)=>{
                //将获取到的昵称放入对应位置
                usernameArr?.map((item:any,index:number)=>{
                  if(index < o[1].length){
                    moments['liked'].push(item[0].username)
                  }
                  else{
                    o[2][index - o[1].length]['username'] = item[0].username
                    moments['comments'].push(o[2][index - o[1].length])
                  }
                })
                //全部数据获取完成，resolve出去
                resolve(moments)
              })

            })
          }
          //没有朋友圈数据
          else{
            resolve(null)
          }
        })
      })
    }

    userSelectPromise().then((r:any)=>{
      let promiseStatement:any[] = []
      r.map((item:any)=>{
        //根据获取到的用户以及好友id获取朋友圈数据
        promiseStatement.push(getChatMomentsData(item))
      })
      Promise.all(promiseStatement).then((data:any)=>{
        let allMoments:any[] = []
        data.map((item:any)=>{
          //朋友圈数据不为null加入allMoments数组中
          if(item){
            allMoments.push(item)
          }
        })
        //所有数据获取完成，反馈给前端
        res.send({
          moments:allMoments
        })
      })
    }).catch(()=>{
      res.send({
        err:'出现错误了'
      })
    })
  })
  app.use('/',router)
}