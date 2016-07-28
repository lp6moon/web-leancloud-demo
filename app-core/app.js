global.AppCtx={
    Logger:function(tag){
        var l=require('log4js').getLogger(tag);
        if(AppCtx.Logger.level) l.setLevel(AppCtx.Logger.level);
        return l;
    }
};

var express = require('express');
var AV = require('leanengine');
var _=require('lodash');
var path=require('path');
var co=require('co');
var logger=false;

var Promise=AV.Promise;
var app = express();

/**options的配置参数
 * appRootDir：app的跟目录
 * appConfigPath：app的配置文件绝对路径
 * */
module.exports=function(options){
    var initCtx=function(){
        AppCtx.APP_ROOT_DIR=options.appRootDir;
        AppCtx.AppConfig=require(options.appConfigPath);
        AppCtx.app=app;
        AppCtx.server=false;
        AppCtx.Logger.level=AppCtx.AppConfig.AV.appEnv=='development'?'debug':'error';  //根据环境设置日志显示级别

        logger=AppCtx.Logger('app.js')
        logger.info('初始化App上下文环境');

        AppCtx.Util=require('./common/util.js');
        AppCtx.SchemaManage=require('./common/schema-manage.js');
        AppCtx.BaseModel=require('./common/base-model.js');
        AppCtx.BaseRouter=require('./common/base-router.js');
        AppCtx.BusiError=require('./common/busi-error.js');
        AppCtx.RedisManage=require('./common/redis-manage.js');

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

    var initDB=function(){
        logger.info('初始化数据模型');

        var DBCFG=AppCtx.AppConfig.DB;
        AppCtx.SchemaManage.setSchemaFields(require(DBCFG.schemaPath),true);
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
        var BMCFG=AppCtx.AppConfig.BUSINESS_MODULE;

        var registerRouter=function*(){
            var S=CFG.SERVICE;
            var homeFile=path.join(S.dir,S.home);
            var acl=require('./filter/acl.js');
            var result=[];

            //查找公共的router
            yield AppCtx.Util.File.find(S.dir, function(dir,fileName){
                return Promise.as(_.endsWith(fileName,'.js'));
            }).then(function(files){
                _.each(files,function(file){
                    var url=S.url+file.replace(S.dir,'').replace(/\\|\//g,'/').replace('.js','');
                    var router=require(file);
                    result.push({
                        url:url,
                        router:router,
                        acl:router.acl,
                        isHome:file==homeFile,
                        file:path.relative(AppCtx.APP_ROOT_DIR,file)
                    });
                });

            });

            //查找业务模块的router
            yield Promise.all(_.map(BMCFG.modules,function(m){
                var dir=path.join(path.join(BMCFG.rootDir,m.dir),m.router);

                return AppCtx.Util.File.find(dir, function(dir,fileName){
                    return Promise.as(_.endsWith(fileName,'.js'));
                }).then(function(files){
                    _.each(files,function(file){
                        var url=S.url+'/'+m.name+file.replace(dir,'').replace(/\\|\//g,'/').replace('.js','');
                        var router=require(file);
                        result.push({
                            url:url,
                            router:router,
                            acl:router.acl,
                            file:path.relative(AppCtx.APP_ROOT_DIR,file)
                        });
                    });

                });
            }));


            //注册首页router
            _.each(_.filter(result,function(r){return r.isHome}),function(r){
                app.use('/',r.router);
                logger.debug('注册路由服务(Home)[url：%s] [file：%s]','/',r.file);
            });

            //注册未权限控制的router
            _.each(_.filter(result,function(r){return !r.isHome&&!r.acl}),function(r){
                app.use(r.url,r.router);
                logger.debug('注册路由服务(Unsafe)[url：%s] [file：%s]',r.url,r.file);
            });

            //注册权限控制函数
            app.use(acl);

            //注册被权限控制的router
            _.each(_.filter(result,function(r){return !r.isHome&&r.acl}),function(r){
                app.use(r.url,r.router);
                logger.debug('注册路由服务(Safe)[url：%s] [file：%s]',r.url,r.file);
            });

        };

        //app.use(AV.Cloud.HttpsRedirect());    //强制使用https访问

        app.use(require('connect-timeout')(CFG.CONNECT_TIMEOUT));
        app.use(require('serve-favicon')(CFG.FAVICON));
        app.use(AV.express());

        app.use(AV.Cloud.CookieSession(CFG.COOKIE_SESSION));

        //自定义session 与AV兼容 详情见https://github.com/expressjs/cookie-session
        //app.use(require('cookie-session')({secret:'my secret'}));

        //i18n中间件
        var i18n=require('i18n');
        i18n.configure(CFG.I18N);
        app.use(i18n.init);

        app.use(CFG.STATIC.url,express.static(CFG.STATIC.dir,CFG.STATIC.options));

        //注册业务模块的静态目录
        _.each(BMCFG.modules,function(m){
            var url=CFG.STATIC.url+'/'+m.name;
            var dir=path.join(path.join(BMCFG.rootDir,m.dir),m.static);
            app.use(url,express.static(dir,CFG.STATIC.options));
        });

        var BP=CFG.BODY_PARSER;
        var bodyParser=require('body-parser');
        app.use(require('method-override')());
        app.use(bodyParser.json(BP.json));
        app.use(bodyParser.urlencoded(BP.urlencoded));
        app.use(require('multer')(BP.multer).array());  //接受多个文件上传，req.files

        //注册业务服务router
        yield* registerRouter();

        /*注册错误处理函数*/
        var errorHandler=require('./filter/error-handler.js');
        app.use(errorHandler.notFoundErrorHandler);
        app.use(errorHandler.avErrorHandler);   //处理云请求的错误
        app.use(errorHandler.serverErrorHandler);
    };

    var initAVCloud=function*(){
        logger.info("初始化云函数");

        var dirs=[AppCtx.AppConfig.AV.cloudDir];
        var CFG=AppCtx.AppConfig.BUSINESS_MODULE;
        _.each(CFG.modules,function(m){
            dirs.push(path.join(path.join(CFG.rootDir,m.dir),m.cloud));
        });
        yield Promise.all(_.map(dirs,function(dir){
            return AppCtx.Util.File.find(dir,function(dir,name){
                return Promise.as(path.extname(name)=='.js');
            }).then(function(fileList){
                _.each(fileList,function(file){
                    logger.debug('加载云函数文件：'+path.relative(AppCtx.APP_ROOT_DIR,file));
                    require(file);
                })
            });
        }));

    };

    var startServer=function(){
        logger.info('启动服务器');

        AppCtx.server=app.listen(AppCtx.AppConfig.AV.appPort, function () {
            var addr=AppCtx.server.address();
            logger.info('服务器正在监听请求"%s:%d"',addr.address,addr.port);
        });
    };

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
        logger.error('应用程序发生意外异常,即将停止',err);
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
        initDB();
        initApp();
        yield *initMiddleware();
        yield *initAVCloud();
        startServer();
    }).catch(function(err){
        logger.error(err,'启动服务器时发生错误');
        stopServer();
    });

}
