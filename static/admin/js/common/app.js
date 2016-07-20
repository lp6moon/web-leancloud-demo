var __initUtil=function(app){
    app._util={
        proxy:function(m){
            return function(){app[m].apply(app,arguments);}
        }
    }
    /*nano模板引擎*/
    app.nano=function(template, data) {
        return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
            var keys = key.split("."), v = data[keys.shift()];
            for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
            return (typeof v !== "undefined" && v !== null) ? v : "";
        });
    }

    /*cb会在urls指定css全部加载完成后回调*/
    app.loadCSS=function(urls,cb){
        var $head=$('head');
        urls= _.isArray(urls)?urls:[urls];
        var exec= _.after(urls.length,function(){if(cb)cb();});

        _.each(urls,function(url){
            url= app.util.toResourceUrl(url+".css");
            $("<link/>").attr({type:'text/css','rel':'stylesheet','href':url}).appendTo($head)
                .on('load',exec);
        });
    }

}

var __initEvents=function(app){

    /*此方法监听document触发的ajaxError事件，仅处理通讯错误*/
    app.onajaxerror=function(e,xhr,ops,estr){
        if(e&&e.isDefaultPrevented())return;
        if(ops&&!ops.global)return;

        var st=xhr.status;
        if(st==401){
            if(app.toLoginPage) app.toLoginPage();
            else alert('请登录！');
        }

        if(st==403){
            var error=JSON.parse(xhr.responseText).error;
            return alert(error||'你无权访问此链接');
        }

        if(st==404){
            return alert('不能找到请求的URL! '+
                ops.type+":"+ops.url);
        }

        if(st>=500)
            return alert('服务器错误，请重试！');

        if(xhr.statusText=='timeout')
            return alert('请求超时，请重试！');
    }


    app.onerror=function(e){console.log("前端错误:\n"+JSON.stringify(e));};
    app.onbusierror=function(e){
        webix.message({type:'error',text:'业务错误，请重试： \n'+ JSON.stringify(e.error)});
    };

    _.each(['error','busierror'],function(v){
        app.on(v,app._util.proxy('on'+v));
    });
    $(document).on('ajaxError', app._util.proxy('onajaxerror'));
}

var __initAjax=function(app){
    app.ajaxPrefilter=function(ops,oriOps,xhr){
        ops.url=app.util.toServiceUrl(ops.url);
    }

    $.ajaxPrefilter(app._util.proxy('ajaxPrefilter'));
}

define(['webix.mvc.core','util','av'],
    function(core,util,av){
        window.AV=av;
        var app=core.create(CONFIG.APP.MVC);
        app.util=util;

        __initUtil(app);
        __initEvents(app);
        __initAjax(app);

        app.init=function(cb){
            if(cb)app.on('init',cb);

            app.loadCSS(CONFIG.APP.CSS,function(){
                app.trigger('init');
            });
        };
        return app;
    });
