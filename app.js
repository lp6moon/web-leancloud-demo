require('./app-ctx.js');

var express = require('express');
var AV = require('leanengine');
var _=require('underscore');
_.str=require('underscore.string');
var path=require('path');
var co=require('co');
var logger=AppCtx.Logger('app.js');

var Promise=AV.Promise;
var app = express();


var initCtx=function(){
    logger.info('初始化App上下文环境');
    AppCtx.app=app;
    AppCtx.server=false;
};

var initAV=function(){
    logger.info('初始化云引擎');
    var AVConfig=AppCtx.AppConfig.AV;
    AV.init({
        appId: AVConfig.appId,
        appKey: AVConfig.appKey,
        masterKey: AVConfig.appmasterKey
    });
    if(AVConfig.isUserMasterKey) AV.Cloud.useMasterKey();
};

var initApp=function(){
    logger.info('初始化App');

    var CFG=AppCtx.AppConfig.SERVER;
    _.each(CFG.EXPRESS_SETTINGS,function(v,k){app.set(k,v)});

    //配置模板引擎
    app.engine(app.get('view engine'),require('ejs').__express);

    //node运行环境与云环境一致
    app.set('env',AppCtx.AppConfig.AV.appEnv=='development'?"development":"production");
};


var initMiddleware=function*(){
    logger.info("初始化中间件");

    var CFG=AppCtx.AppConfig.SERVER;

    var addServices=function(files){
        var S=CFG.SERVICE;
        var homeFile=path.join(S.dir,S.home);
        _.each(files,function(file){
            var url=S.url+file.replace(S.dir,'').replace(/\\|\//g,'/').replace('.js','');
            app.use(file==homeFile?'/':url,require(file));
            logger.debug('注册服务（%s）：%s',file==homeFile?"Home":"Router",url);
        });
    };

    app.use(require('connect-timeout')(CFG.CONNECT_TIMEOUT));
    app.use(require('serve-favicon')(CFG.FAVICON));
    app.use(AV.express());

    //todo：加载session和cookie中间件
    //app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
    //https://github.com/expressjs/cookie-session


    app.use(CFG.STATIC.url,express.static(CFG.STATIC.dir,CFG.STATIC.options));

    var BP=CFG.BODY_PARSER;
    var bodyParser=require('body-parser');
    app.use(require('method-override')());
    app.use(bodyParser.json(BP.json));
    app.use(bodyParser.urlencoded(BP.urlencoded));
    app.use(require('multer')(BP.multer).array());  //接受多个文件上传，req.files

    //注册业务服务router
    yield AppCtx.Util.File.find(CFG.SERVICE.dir, function(dir,fileName){
        return Promise.as(_.str.endsWith(fileName,'.js'));
    }).then(function(fileList){
        addServices(fileList);
    });



    /*注册错误处理函数*/
    var errorHandler=require(path.join(AppCtx.APP_ROOT_DIR,'filter/error-handler.js'));
    app.use(errorHandler.notFoundErrorHandler);
    app.use(errorHandler.serverErrorHandler);
};

var initAVCloud=function(){
    logger.info("初始化云函数");

    return Promise.all(_.map(AppCtx.AppConfig.AV.cloudDirs,function(dir){
        return AppCtx.Util.File.find(dir,function(dir,name){
            return Promise.as(path.extname(name)=='.js');
        }).then(function(fileList){
            _.each(fileList,function(file){
                logger.info('加载云函数文件：'+file);
                require(file);
            })
        })
    }))

}

var startServer=function(){
    logger.info('启动服务器');

    AppCtx.server=app.listen(AppCtx.AppConfig.AV.appPort, function () {
        var addr=AppCtx.server.address();
        logger.info('服务器正在监听请求"%s:%d"',addr.address,addr.port);
    });
}

var stopServer=function(){
    if(AppCtx.server){
        logger.info('开始停止服务器');

        //如果是worker进程，那么process.disconnect存在并且为函数，调用此方法可以断开与cluster进程的连接
        //从而避免此进程继续接收客户端请求，并且会导致cluster立刻创建新的进程接收请求
        if(_.isFunction(process.disconnect))
            process.disconnect();

        //在所有连接到server的连接断开后才会关闭server，所以后面设置了超时时间以保证强制退出
        //调用以下方法后，子进程与主进程会断开连接，因此后续日志信息不会显示
        server.close(exitProcess);
    }

    setTimeout(exitProcess,AppCtx.AppConfig.SERVER.STOP_TIMEOUT);
    function exitProcess(){
        logger.info('服务器进程退出，进程号"%d"',process.pid);
        process.exit(1);
    }
};


process.on("uncaughtException",function(err){
    logger.error(err,'应用程序发生意外异常,即将停止');
    stopServer();
});

process.on('unhandledRejection', function(reason, p) {
    logger.error("Promise没有拒绝处理函数: ", p, " 原因: ", reason.stack);
});

//执行来自cluster进程的命令
process.on('message',function(cmd){
    logger.info('接收到集群服务器命令"%s"',cmd);
    switch(cmd){
        case 'stop':return stopServer();break;
        default: return;
    }
});

co(function*(){
    initCtx();
    initAV();
    initApp();
    yield *initMiddleware();
    yield initAVCloud();
    startServer();
}).catch(function(err){
    logger.error(err,'启动服务器时发生错误');
    stopServer();
});
