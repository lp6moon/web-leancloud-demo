var redis=require('redis');
var logger=AppCtx.Logger('redis-manage.js');

//将redisClient的方法全部Promise化
var bluebird=require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var s=module.exports={
    __holder:false
};

s.createClient=function(){
    /*格式: [redis:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]*/
    var redisUrl=process.env[AppCtx.AppConfig.AV.redisEnvKey];

    if(AppCtx.AppConfig.AV.appEnv=='development'||!redisUrl)
        redisUrl='redis://localhost:6379';

    /*redis客户端配置 详情看网址https://github.com/NodeRedis/node_redis*/
    var options={
        retry_strategy: function (op) {
            if (op.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with a individual error
                return new Error('The server refused the connection');
            }

            if (op.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands with a individual error
                return new Error('Retry time exhausted');
            }
            if (op.times_connected > 10) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.max(op.attempt * 100, 3000);
        }
    }

    var client = redis.createClient(redisUrl,options);
    client.on('connect',function(){
        logger.info('redis连接成功:'+redisUrl);
    });
    client.on('error', function(err) {
        logger.error('redis发生错误', err);
    });

    return client;
};

s.getClient=function(){
    if(s.__holder) return s.__holder;

    var client=s.__holder=s.createClient();
    client.on('end',function(){s.__holder=false;});
    return client;
};