var logger=AppCtx.Logger('error-handler.js');
var _=require('lodash');
var AV=require('leanengine');

var content500={'code':500,'message':'服务器内部错误!',stack:''};
var content404={'code':404,'message':'不能找到请求的URL!',stack:''};

var s=module.exports={};

var sendToClient=function(statu,content,req,res){
    res.status(statu);

    if(req.xhr||req.path.startsWith(AppCtx.AppConfig.SERVER.SERVICE.url)){
        res.json({error:content});
    }else{
        res.render('error',content);
    }
};

var info=function(prefix,req){
    var r=prefix;
    r+='[URL:'+req.originalUrl+']';
    r+='[IP:'+req.ip+']';
    r+='[Method:'+req.method+']';

    return r;
};

//处理云引擎通讯的错误
s.avErrorHandler=function(err,req,res,next){
    if(!(err instanceof AV.Error)) return next(err);

    var content={
        code:parseInt(500+ _.padStart(err.code,3,'0')),
        message:'云引擎通讯错误',
        stack:JSON.stringify(err)
    };

    logger.warn(content.message,err);

    sendToClient(200,content,req,res);
};

s.serverErrorHandler=function(err,req,res,next){
    logger.error(info("500 "+content500.message,req),err);

    if(AppCtx.AppConfig.AV.appEnv=='development')
        content500.stack=err.stack;

    sendToClient(500,content500,req,res);
};

s.notFoundErrorHandler=function(req,res,next){
    logger.warn(info("404 "+content404.message,req));
    sendToClient(404,content404,req,res);
};