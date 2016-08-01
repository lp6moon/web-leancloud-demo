var _=require('lodash');
var AV=require('leanengine');
var router=module.exports=require('express').Router();
router.acl=false;//true:此路由会被注册acl中间件之后，false：此路由会被注册在acl中间件之前

router.get('/login',function(req,res,next){
    var uName=req.query.username;
    var uPass=req.query.password;

    if(!uName||!uPass) return res.json({error:AppCtx.BusiError.ILLEGAL_PARAMS});

    AV.User.logIn(uName,uPass).then(function(user) {
        res.saveCurrentUser(user);
        res.json({data:user.getSessionToken()});
    }).catch(next);
});

router.get('/logout',function(req,res,next){
    if(!req.currentUser) return res.json({data:true});

    res.clearCurrentUser();
    AV.User.logOut().then(function(){
        res.json({data:true});
    }).catch(next);
});

router.get('/app',function(req,res,next){
    res.json({data:_.pick(AppCtx.AppConfig.AV,['appId','appKey','appEnv'])});
});