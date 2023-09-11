const ioredis = require('ioredis')

interface redisConfig {
    port?:number,
    host?:string,
    password?:string | number,
    db?:number
}
const redis = (config?:redisConfig)=>{
    return new ioredis({
        port:config?.port,
        host:config?.host,
        password:config?.password,
        db:config?.db
    }).connector.connecting
}

module.exports = {
    redis
}