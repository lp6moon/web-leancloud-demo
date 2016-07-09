var _=require('lodash');
var PK='objectId';
var SCHEMA_FIELDS={

};

module.exports={
    /*获取数据模型字段数组*/
    fields:function(name){
        var f=SCHEMA_FIELDS[name]||[];
        if(!_.includes(f,PK)) f.push(PK);
        return f;
    },
    setSchemaFields:function(schema,isExtend){
        if(_.isEmpty(schema)) return;
        if(_.isUndefined(isExtend)) isExtend=true;

        if(isExtend) _.extend(SCHEMA_FIELDS,schema);
        else SCHEMA_FIELDS=schema;
    }
};