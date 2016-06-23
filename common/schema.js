var _=require('underscore');
var PK='objectId';
var SCHEMA_FIELDS={

};

module.exports={
    /*获取数据模型字段数组*/
    fields:function(name){
        var f=SCHEMA_FIELDS[name]||[];
        if(!_.contains(f,PK)) f.push(PK);
        return f;
    }
};