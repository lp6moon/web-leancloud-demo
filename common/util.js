var _=require('underscore');
var Promise=require('leanengine').Promise;
var fs=require('fs');


var s=module.exports={};

/**将数字number保留precision位小数
 * number：需要转换的数字，Number类型
 * precision：小数精度，非负整数，默认为2
 * toNumber：是否返回number类型结果，默认为false。注意：如果以Number类型返回，末尾0将不保留*/
s.toFixedDecimal=function(number,precision,toNumber){
    if(!_.isNumber(number)) return number;

    var scale= _.isNumber(precision)&&precision>=0?parseInt(precision):2;
    var rs=Math.round(number*Math.pow(10,scale))/Math.pow(10,scale);
    return toNumber?rs:rs.toFixed(scale);
};

/*转换属性链为数组*/
var props=function(prop){
    var props=[];
    if(!prop||!_.isString(prop))return props;

    _.each(prop.split('.'),function(v){
        if(!v)return;
        _.each(v.split('['),function(p){
            if(!p)return;
            var i= p.indexOf(']');
            p=i==-1?p: p.substring(0,i);
            props.push(p);
        });
    });

    return props;
}

/*获取obj的prop属性值，prop支持属性链*/
s.getProp=function(obj,prop){
    return _.reduce(props(prop),function(memo,pn){
        if(!pn||!memo)return memo;
        return memo[pn];
    },obj);
}

/*设置obj的prop属性值，prop支持属性链*/
s.setProp=function(obj,prop,value){
    var pps=props(prop);
    if(_.isEmpty(pps))return;
    var last=pps.pop();
    var i=-1;

    var memo=_.reduce(pps,function(memo,pn){
        i++;
        if(!pn||!memo)return;
        if(memo[pn])return memo[pn];

        var next=pps[i+1];
        if(next&&_.isNumber(parseInt(next))){
            memo[pn]=[];
        }else{
            memo[pn]={};
        }
        return memo[pn];
    },obj);

    if(memo)memo[last]=value;
}

s.isAbsUrl=function(url){
    url=url||'';
    return _.some(['http:', 'https:', '/'],function(v){
        return  url.startsWith(v);
    });
}

s.File={
    exist:function(file){
        return new Promise(function(resolve){
            if(!_.isString(file))return resolve(false);
            fs.exists(file,resolve);
        });
    },
    /*是否为文件，如果不存在则直接返回false*/
    isFile:function(file){
        return new Promise(function(resolve){
            s.File.exist(file).then(function(exist){
                if(!exist)return resolve(false);

                fs.stat(file,function(err,stats){
                    if(err) resolve(false);

                    resolve(stats&&stats.isFile());
                });
            });
        });
    },
    /*是否为目录，如果不存在则直接返回false*/
    isDir:function(dir){
        return new Promise(function(resolve){
            s.File.exist(dir).then(function(exist){
                if(!exist)return resolve(false);

                fs.stat(dir,function(err,stats){
                    if(err) resolve(false);

                    resolve(stats&&stats.isDirectory());
                });
            });
        });
    },
    /*列出目录下所有的文件，返回结果包含文件名称的数组
     * 回调函数filter(dir,fileName)返回true（或者返回promise解析为true）,
     * 如果promise返回true，则把fileName添加到返回结果里*/
    list:function(dir,filter){
        return new Promise(function(resolve){
            var rs=[];
            filter=filter?filter:function(){return Promise.as(true);};

            s.File.isDir(dir).then(function(exist){
                if(!exist)return resolve(rs);

                fs.readdir(dir,function(err,nameList){
                    if(err) return reject(err);

                    Promise.all(_.map(nameList,function(name){
                        return filter(dir,name).then(function(ok){
                            if(ok)rs.push(name);
                        });
                    })).then(function(){resolve(rs);});
                });
            });
        });
    }
}