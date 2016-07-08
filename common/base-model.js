var _=require('lodash');
var AV=require('leanengine');
var Promise=AV.Promise;
var Schema=require('./schema.js');

/*缓存AV.Object*/
var CACHE={};

var OP=['=','<','>','!=','>=','<=','in','not in','matches',
    'startsWith','contains','endsWith',
    'exists','doesNotExist','containsAll'];
var OPMethod={
    '=':'equalTo',
    '!=':'notEqualTo',
    '<':'lessThan',
    '<=':'lessThanOrEqualTo',
    '>':'greaterThan',
    '>=':'greaterThanOrEqualTo',
    'in':'containedIn',
    'not in':'notContainedIn',
    'asc':'addAscending',
    'desc':'addDescending'
};

var FN=module.exports=function(name){
    if(!name) throw new Error('base-model传入参数错误');

    var AVModel=CACHE[name]||AV.Object.extend(name);
    var AVQuery=function(){return new AV.Query(name)};

    var s={
        name:name,
        AVModel:AVModel,
        AVQuery:AVQuery
    };

    /* 查询多条记录，参数说明：
     * exps:查询条件表达式 例如:[[field,'=',value1],[field,'>=',value2]]
     * fields：array或string，如[field1,field2]或者'field1,field2'
     * orderBy：string类型，如'field asc,field desc'
     * limit: 最多返回的记录条数，默认为100,  -1表示返回全部查询到的记录
     * offset:从第几条开始返回，默认为0*/
    s.findAll=function(exps,fields,orderBy,limit,offset){
        var buildQuery=function(){
            var q=AVQuery();

            var error=FN.appendExps(q,exps);
            if(error) return Promise.error(error);

            fields=fields||[];
            fields= _.isString(fields)?fields.split(','):fields;
            if(!_.isEmpty(fields)) q.select(fields);

            _.each((orderBy||'createdAt desc').split(','),function(value){
                var arr=value.split(' ');
                var m=OPMethod[arr[1]];
                if(arr[0]&&m) q[m](arr[0]);
            });
            return q;
        }

        if(limit!=-1){
            var q=buildQuery();
            q.limit(parseInt(limit) || 100);
            q.skip(parseInt(offset) || 0);
            //console.log(q.toJSON())
            return q.find();
        }

        var _skip=parseInt(offset) || 0;
        var _result=[];
        var exec=function(){
            var MAX_LIMIT=1000;
            var q=buildQuery().limit(MAX_LIMIT).skip(_skip);
            //console.log(q.toJSON());
            return q.find().then(function(list){
                list=list||[];

                _skip+=list.length;
                _result=_result.concat(list);
                if(list.length<MAX_LIMIT) return _result;

                return exec(_skip);
            })
        }

        return exec();
    };

    s.findOne=function(id){
        if(!id) return Promise.as();
        return AVQuery().equalTo('objectId',id).first();
    };

    /**保存数据，可单个也可批量
     * data：保存数据，可为数组也可为单个数据对象
     * isisFilterFields：是否过滤冗余字段，默认值为true*/
    s.save=function(data,isFilterFields){
        if(_.isEmpty(data)) return Promise.as();

        isFilterFields=_.isUndefined(isFilterFields)?true:isFilterFields;
        var saveArray=_.compact(_.isArray(data)?data:[data]);
        return AV.Object.saveAll(_.map(saveArray,function(item){
            if(isFilterFields) item=_.pick(item,Schema.fields(name));
            return new AVModel(item);
        })).then(function(result){
            return _.isArray(data)?result:result[0];
        });
    }

    /**保存数据，可单个也可批量
     * data：保存数据，可为数组也可为单个数据对象
     * isisFilterFields：是否过滤冗余字段，默认值为true*/
    s.delete=function(ids){
        if(_.isEmpty(ids)) return Promise.as(true);

        var idArray=_.compact(_.isArray(ids)?ids:[ids]);
        return AV.Object.destroyAll(_.map(idArray,function(id){
            return  AV.Object.createWithoutData(name,id);
        })).then(function(data){
            return true;
        });
    }

    return s;
};

/*校验exps格式是否正确*/
FN.isValidExps=function(exps){
    if(!_.isArray(exps))return false;
    if(_.isEmpty(exps))return true;

    return !_.some(exps,function(exp){
        return !_.isArray(exp)||!exp[0]||! _.contains(OP,exp[1]);
    });
}

/**将查询表达式添加到查询对象上query*/
FN.appendExps=function(query,exps){
    var exps=exps||[];

    if(!FN.isValidExps(exps))
        return new Error('表达式格式错误：'+JSON.stringify(exps));


    _.each(exps,function(exp){
        if(!_.isArray(exp))return;

        var f=exp[0],op=exp[1],v=exp[2];
        op= _.contains(OP,op)?op:'';
        if(!f||!op)return;

        var m=OPMethod[op]||op;
        query[m](f,v)
    });
}