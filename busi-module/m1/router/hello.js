var router=module.exports=require('express').Router();

router.get('/',function(req,res){
    res.send('hello m1');
});