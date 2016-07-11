var _=require('lodash');
var router=module.exports=require('express').Router();
router.acl=true;//true:此路由会被注册acl中间件之后，false：此路由会被注册在acl中间件之前

router.get('/',function(req,res,next){
    res.json({data:_.omit(req.currentUser.toJSON(),['objectId','createdAt','updatedAt'])})
});

router.get('/token',function(req,res,next){
    res.json({data:req.sessionToken});
});