var CONFIG={
    /**require.js加载后默认会自动加载名称为“require”全局变量指向的配置
     * 但是这样会导致data-main的路径必须相对于baseUrl，因此这里舍去不用*/
    REQUIRE:{
        'urlArgs': "bust=" +  (new Date()).getTime(),//正式环境应去掉，添加静态文件url后缀以避免缓存
        'waitSeconds':0,
        'baseUrl':'/static',
        'paths':{
            'jquery':'lib/jQuery/dist/jquery.min',
            'lodash':'lib/lodash/lodash',
            'av':'lib/leancloud-storage/dist/av-min',
            'webix':'lib/webix/codebase/webix',
            'webix.mvc.core':'lib/webix-mvc-core/core',
            'webix.mvc.core.menu':'lib/webix-mvc-core/plugins/menu',
            /*'webix.mvc.core.user':'lib/webix-mvc-core/plugins/user',
            'webix.mvc.core.locale':'lib/webix-mvc-core/plugins/locale',*/

            /**配置require插件*/
            'text': 'lib/text/text',
            'css': 'lib/require-css/css',
            'domReady': 'lib/domready/domReady',

            /*自定义模块*/
            'app':'admin/js/common/app',
            'util':'admin/js/common/util'
        },
        /**shim仅适用定义不支持AMD规范的js库，exports导出的变量将设置为全局对象变量
         * 注意：exports仅支持对非AMD模块导出的全局变量，如果本身是AMD模块，则设置无效*/
        'shim':{
            'lodash': {'exports': '_'},
            'jquery':{'exports':'$'},
            'webix':['jquery'],
            'webix.mvc.core':['webix']
        }
    },
    /*app配置*/
    APP:{
        /*require-css加载css文件是乱序，以下配置使用自定义加载以保证css加载顺序*/
        CSS:[
            'lib/webix/codebase/webix',
            'admin/css/normalize'
        ],
        MVC:{
            id:			"admin",
            name:		"管理系统",
            version:	"1.0.0",
            debug:		true,
            start:		"/home/start",
            viewPath:   "admin/views/",
            login:      "/login"
        }
    }
}
