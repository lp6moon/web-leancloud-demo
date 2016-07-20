var APP_ROOT_DIR=AppCtx.APP_ROOT_DIR;
var path=require('path');
var _=require('lodash');


module.exports={
    /*leancloud 配置信息*/
    AV:{
        isUserMasterKey:true,   //是否使用 masterKey 权限
        appId:process.env.LEANCLOUD_APP_ID,
        appKey:process.env.LEANCLOUD_APP_KEY,
        appmasterKey:process.env.LEANCLOUD_APP_MASTER_KEY,
        appEnv:process.env.LEANCLOUD_APP_ENV||'development',    //development:开发环境,stage:预备环境,production:生产环境
        appPort:parseInt(process.env.LEANCLOUD_APP_PORT || 3000),
        appInstanceName:process.env.LEANCLOUD_APP_INSTANCE,
        region:process.env.LEANCLOUD_REGION,  //值为 CN 或 US，分别表示国内节点和美国节点

        //云函数文件目录
        cloudDir:path.join(APP_ROOT_DIR,'./cloud'),   //云函数目录,层级查找

        redisEnvKey:''  //leanCache的redis环境变量KEY值 例如：REDIS_URL_<实例名称>

    },

    BUSINESS_MODULE:{
        rootDir:path.join(APP_ROOT_DIR,'busi-module'),  //所有模块的根目录
        modules:[
            {
                name:'m1',          //模块名，是静态资源和动态资源的{module_name}变量
                dir:'m1',           //模块的目录
                static:'static',    //模块的静态资源目录  注册后的url：/static/{module_name}/XXX
                router:'router',    //模块的静态资源目录  注册后的url：/api/{module_name}/XXX
                cloud:'cloud'       //云函数目录
            }
        ]
    },

    DB:{
        schemaPath:path.join(APP_ROOT_DIR,'common/schema-fields.js')  //所有模块的根目录
    },

    SERVER:{
        CONNECT_TIMEOUT:'90s',  //请求连接请求超时
        STOP_TIMEOUT:5*1000,//在停止服务器开始后等待多少毫秒，强制终止服务器进程
        FAVICON:path.join(APP_ROOT_DIR,'static/assets/favicon.png'),

        /*AVd的cookie_session中间件*/
        COOKIE_SESSION:{
            secret: 'my secret',
            maxAge: 24*60*60*1000,
            fetchUser: true
        },

        //api接口服务配置
        SERVICE:{
            url:'/api',
            home:'home.js',//注册处理'/'路径的服务，不添加访问路径前缀，注意：此服务类内部不要添加除"/"以为的访问路径
            dir:path.join(APP_ROOT_DIR,'router')
        },

        //serve-static中间件，配置公共资源访问目录。maxAge：公共资源在浏览器端的缓存毫秒数，超时后会重新向服务器请求获取新资源
        STATIC:{
            url:'/static',//访问静态资源的URL路径前缀
            dir:path.join(APP_ROOT_DIR,'static'),//公共资源目录
            options:{maxAge:24*60*60*1000,redirect:false}
        },

        //Express选项配置，可配置项参考http://expressjs.com/api.html#app-settings
        EXPRESS_SETTINGS:{
            'trust proxy':true,//如果使用Web服务器做反向代理，此参数值应设置为true
            'strict routing':false,//是否严格区分访问路径，如果为false则/foo  , /foo/ 相同
            'x-powered-by':false,
            'view cache':true,
            'view engine':'html',//模板文件名称后缀
            views:path.join(APP_ROOT_DIR,'views')//模板文件目录
        },

        //body-parser中间件
        BODY_PARSER:{
            urlencoded:{
                extended:true,limit:10*1024*1024,
                parameterLimit:100000
            },
            json:{limit:10*1024*1024},
            multer:{
                dest:path.join(APP_ROOT_DIR,'static/uploads'),
                limits:{fileSize:100*1024*1024}
            }
        }
    }
}
