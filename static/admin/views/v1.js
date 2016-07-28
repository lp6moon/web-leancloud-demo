define([],function(){

    return {
        $ui:{template:'<div id="btn"></div>'},
        $oninit:function(view,$scope){
            _.delay(function(){
                webix.ui({
                    container:'btn',
                    view:'button',
                    value:'btn',
                    inputWidth:80,
                    click:function(){console.log(arguments)}
                })
            })
        }
    };

});
