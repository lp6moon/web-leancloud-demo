/*实现对单表的CURD路由操作*/

var _=require('lodash');
var express=require('express');
var Promise=require('leanengine').Promise;
var qs=require('qs');
var validator=require('validator');


/*请求路径与中间件映射关系，格式为[method,url,verb] 因为映射关系的顺序会影响请求处理顺序，所以以下使用数组*/
var FILTER=[
    ['validate','/','use'],
    ['preprocess','/','use']
];

var MAPPING=[
    ['count','/count','get'],
    ['findOne','/one','get'],
    ['findAll','/','get'],
    ['save','/','post'],
    ['delete','/','delete']
];

module.exports=function(model,logger){
    var s={
        model:model,
        router:express.Router(),
        logger:logger||AppCtx.Logger('base-router.js'),
        acl:function(acl){
            if(!acl) return this.router.acl?true:false;
            this.router.acl=acl;
        },
        filter:_.map(FILTER, _.clone),
        mapping: _.map(MAPPING, _.clone)
    };

    s.initRouter=function(){
        var s=this;

        _.each([].concat(s.filter).concat(s.mapping),function(v){
            if(_.has(s,v[0])) s.router[v[2]](v[1],s[v[0]]);
        });
        return s.router;
    };

    s.validate=function(req,res,next){
        next();
    };
    s.preprocess=function(req,res,next){
        var exps=req.query.exps;
        if(exps&&_.isArray(exps)){
            _.each(exps,function(exp){
                //如果表达式的value值是日期类型则转为Date类型
                if(exp[2]&&validator.isDate(exp[2])) exp[2]=new Date(exp[2]);
            });
            req.query.exps=exps;
        }
        next();
    };


    s.render=function(req,res,next,promise){
        promise.then(function(data){
            res.json({'data':_.isUndefined(data)?'':data});
        }).catch(next);
    };

    s.count=function(req,res,next){
        s.render(req,res,next,s.model.count(req.query.exps));
    };

    s.findAll=function(req,res,next){
        var exps=req.query.exps;
        var fields=req.query.fields;
        var orderBy=req.query.orderBy;
        var limit=req.query.limit;
        var offset=req.query.offset;

        if(limit==-1){
            s.model.findAll(exps,fields,orderBy,limit,offset).then(function(result){
                result=result||[];
                res.json({
                    total:result.length,
                    data:result
                });
            }).catch(next);
        }


        Promise.all([
            s.model.count(exps),
            s.model.findAll(exps,fields,orderBy,limit,offset)
        ]).then(function(result){
            res.json({
                total:result[0],
                data:result[1]
            });
        }).catch(next);

    };

    s.findOne=function(req,res,next){
        s.render(req,res,next,s.model.findOne(req.query.id,req.query.fields));
    };

    s.save=function(req,res,next){
        s.render(req,res,next,s.model.save(req.body.data));
    };

    s.delete=function(req,res,next){
        s.render(req,res,next,s.model.delete(req.body.data));
    };

    s.acl(true);//默认acl为true
    return s;
};