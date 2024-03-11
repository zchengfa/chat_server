const ioredis = require('ioredis')

interface redisConfig {
    port?:number,
    host?:string,
    password?:string | number,
    db?:number
}
export const Redis = (config?:redisConfig)=>{
    return new ioredis({
        port:config?.port,
        host:config?.host,
        password:config?.password,
        db:config?.db
    })
}


//给ioredis添加方法
ioredis.prototype.hashSetObject = (key:any,obj:any)=>{
    let arg = []
    for (const keyKey in obj) {
        arg.push(keyKey,obj[keyKey])
    }

    return Redis().hmset(key,...arg)
}

