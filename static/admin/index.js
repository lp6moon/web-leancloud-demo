require(CONFIG.REQUIRE);
require(['app','domReady!'],function(app){
    window.app=app;

    var initAV=function(cb){
        $.get('auth/app').done(function(res){
            var data=res.data;
            app.AV_ENV=data;

            AV.init(_.pick(data,['appId','appKey']));
            AV.setProduction(data.appEnv=='development'?false:true);
            if(cb) cb();
        })
    };

    app.status={};

    app.checkLogin=function(){
        $.get('common/user/token').then(function(res){
            if(res.data&&!AV.User.current()) AV.User.become(res.data);
        })
    };

    app.toLoginPage=function(){
        app.status.lastPage="/"+_.map(app.path,'page').join('/');
        app.show(app.config.login);
    };
    app.toLastPage=function(){
        var lastPage=app.status.lastPage||app.config.start;
        app.show(lastPage);
    };

    app.doLogin=function(username,password){
        $.get('auth/login',{username:username,password:password}).done(function(res){
            if(res.error) return webix.message('登录失败','error');

            AV.User.become(res.data);
            app.toLastPage();
        });
    };
    app.doLogout=function(){
        $.get('auth/logout').done(function(res){
            AV.User.logOut().then(function(){
                app.status.lastPage='';
                app.show(app.config.login);
            });
        })
    };

    var start=_.after(2,app.start);
    app.init(start);
    initAV(start)
})