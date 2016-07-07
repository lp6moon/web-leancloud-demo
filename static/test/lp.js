$(function(){
    var APP_ID = 'DWALeyppA7C3Dip7g74QzJw9-gzGzoHsz';
    var APP_KEY = 'PHLzghIABGLwPmX5T0tPqctK';
    AV.init({
        appId: APP_ID,
        appKey: APP_KEY
    });

    $('#register').click(function(e){
        var uName=$('#uName').val();
        var uPass=$('#uPass').val();

        if(!uName||!uPass) return alert('用户名或密码不能为空')

        var user = new AV.User();
        user.setUsername(uName);
        user.setPassword(uPass);
        user.setEmail('l.peng18@qq.com');
        user.signUp().then(function (loginedUser) {
            alert("注册成功")
        }, (function (error) {
            console.log(error);
            alert("注册失败")
        }));
    });

    $('#login').click(function(e){
        var uName=$('#uName').val();
        var uPass=$('#uPass').val();

        if(!uName||!uPass) return alert('用户名或密码不能为空')

        AV.User.logIn(uName,uPass).then(function (loginedUser) {
            alert("登录成功")
        }, function (error) {
            console.log(error);
            alert("登录失败")
        });
    });

    $('#logout').click(function(e){
        AV.User.logOut().then(function() {
            alert("登出成功")
        });
    });

    $('#login2').click(function(e){
        var uName=$('#uName').val();
        var uPass=$('#uPass').val();

        if(!uName||!uPass) return alert('用户名或密码不能为空')

        $.get('/api/test/lp/login',{username:uName,password:uPass}).done(function(res){
            $('#show_content').html(res)
        })
    });

    $('#logout2').click(function(e){
        $.get('/api/test/lp/logout').done(function(res){
            $('#show_content').html(res)
        })
    });

    $('#show').click(function(){
        $.get('/api/test/lp').done(function(res){
            $('#show_content').html(res)
        })
    })
})