define([],function(){


    return {
        $ui:{
            view:"form",
            height:600,
            elements:[
                { view:"text", placeholder:"Title"},
                { view:"text", placeholder:"Year"}
            ]
        },
        $oninit:function(view, $scope){
            //console.log(view);
            //console.log($scope)
        },
        $onurlchange:function(config, url, $scope){
            console.log(config)
        },
        $ondestroy:function(){
            /*before destroy*/
            return true;
        }
    }
})