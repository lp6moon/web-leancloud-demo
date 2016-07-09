var logger=AppCtx.Logger('acl.js');

/*权限控制中间件*/
module.exports=function(req,res,next){
    logger.debug('权限控制 '+req.method+":"+req.path);

    next();
}