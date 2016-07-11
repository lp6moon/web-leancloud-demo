var logger=AppCtx.Logger('acl.js');

/*权限控制中间件*/
module.exports=function(req,res,next){
    logger.debug('访问被权限控制的API >> '+req.method+":"+req.path);
    if(!req.currentUser)
        return res.status(401).json({error:"未登录！"});

    next();
}