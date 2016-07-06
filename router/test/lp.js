"use strict";
var router=module.exports=require('express').Router();
var AV=require('leanengine');
var Promise=AV.Promise;
var co=require('co');

router.get('/',function(req,res,next){
    res.send("test")
})