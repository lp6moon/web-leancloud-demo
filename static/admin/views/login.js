define([],function(){
    var onLoginClick=function(e){
        var form = this.getParentView();
        if (!form.validate())
            webix.message({ type:"error", text:"用户名和密码不能为空" });

        var data=form.getValues();
        app.doLogin(data.username,data.password);
    };

    var ui={
        width:350,
        height:180,
        view:"form",
        elements:[
            {view:'text',label:'用户名：',name:'username'},
            {view:'text',type:'password',label:'密码：',name:'password'},
            {view:"button",value:"登录",click:onLoginClick}
        ],
        rules:{
            $all:webix.rules.isNotEmpty
        }
    };

    return {
        $ui:ui,
        $oninit:function(view,$scope){
            //调整表单居中
            var $v=$(view.$view);
            var $w=$(window);
            $v.css({'margin-top':($w.height()-view.$height)/2,'margin-left':($w.width()-view.$width)/2});

            view.setValues({
                username:'17093809518',
                password:'111111'
            })
        }
    };

});