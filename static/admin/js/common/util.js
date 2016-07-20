define(['lodash'],function(){
    var s={};

    s.isAbsUrl=function(url){
        return _.some(['http:', 'https:', '/'],function(v){
            return  _.startsWith(url, v);
        });
    };

    s.toServiceUrl=function(url){
        return s.isAbsUrl(url)?url:'/api/'+url;
    };

    s.toResourceUrl=function(url){
        return s.isAbsUrl(url)?url:'/static/'+url;
    };

    return s;
});