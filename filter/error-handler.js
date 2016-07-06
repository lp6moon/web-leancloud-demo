var logger=AppCtx.Logger('error-handler.js');
var _=require('underscore');

var content500={'errorCode':500,'message':'服务器内部错误!',errorStack:''};
var content404={'errorCode':404,'message':'不能找到请求的URL!',errorStack:''};

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

s.serverErrorHandler=function(err,req,res,next){
    logger.error(info("500 "+content500.message,req),err);

    if(AppCtx.AppConfig.AV.appEnv=='development')
        content500.errorStack=err.stack;

    sendToClient(500,content500,req,res);
};

s.notFoundErrorHandler=function(req,res,next){
    logger.warn(info("404 "+content404.message,req));
    sendToClient(404,content404,req,res);
};