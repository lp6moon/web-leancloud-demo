"use strict";
var router=module.exports=require('express').Router();
router.acl=true;//判断此路由是否被权限控制
var AV=require('leanengine');
var Promise=AV.Promise;
var co=require('co');
var request=require('request');
var _=require('lodash')


router.get('/',function(req,res,next){
    var u=req.currentUser;
    res.send("当前登录用户的sessionToken："+ (u?u.getSessionToken():"没有"));
});

router.get('/1',function(req,res,next){
    var model=new AppCtx.BaseModel('TestClass');
    model.findAll([['createdAt','>',"2016-06-21T07:01:40.773Z"]]).then(function(data){
        res.send(data)
    }).catch(next)
});

router.get('/2',function(req,res,next){
    res.send(AppCtx.SchemaManage.fields('TestClass'))
});

AppCtx.RedisManage.getClient();