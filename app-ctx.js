var s=module.exports=global.AppCtx={
    APP_ROOT_DIR:__dirname
};

s.AppConfig=require("./config/app-config.js");
s.BaseModel=require('./common/base-model.js');
s.Schema=require('./common/schema.js');
s.Util=require('./common/util.js');

s.Logger=function(tag){
    return require('log4js').getLogger(tag);
};