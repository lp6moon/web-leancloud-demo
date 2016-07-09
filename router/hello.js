var router=module.exports=require('express').Router();
router.acl=true;//此路由被权限控制，会通过acl控制

router.get('/',function(req,res){
   console.log(AppCtx.SchemaManage.fields("TestClass"))
   res.send('hello world！');
});