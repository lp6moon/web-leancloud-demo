"use strict";
var router=module.exports=require('express').Router();
var AV=require('leanengine');
var Promise=AV.Promise;
var co=require('co');
var request=require('request');

router.get('/',function(req,res,next){
    var u=req.currentUser;
    res.send("当前登录用户的sessionToken："+ (u?u.getSessionToken():"没有"));
});

router.get('/login',function(req,res,next){
    var uName=req.query.username;
    var uPass=req.query.password;

    AV.User.logIn(uName,uPass).then(function(user) {
        res.saveCurrentUser(user);
        res.send('登录成功')
    },function(error) {
        console.log(error);
        res.send('登录失败')
    });
});

router.get('/logout',function(req,res,next){
    if(!req.currentUser) return res.send('登出成功');

    res.clearCurrentUser();
    AV.User.logOut().then(function(){
        res.send('登出成功')
    },function(error) {
        console.log(error);
        res.send('登出成功')
    });
});