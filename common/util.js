var _=require('lodash');
var Promise=require('leanengine').Promise;
var fs=require('fs');
var path=require('path');


var s=module.exports={};

s.Pattern={
    Email: RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/),
    Mobile: RegExp(/^1[3,4,5,7,8]{1}[0-9]{1}[0-9]{8}$/),
    Phone: RegExp(/^((0\d{2,3})-?)?(\d{7,8})(-(\d{3,}))?$/),
    QQ: RegExp(/^[1-9][0-9]{4,9}$/),
    ZH: RegExp(/[\u4e00-\u9fa5]+/)
};

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
    },
    /*递归查找此目录下所有符合条件的文件/文件夹，返回结果包含完整的文件路径的数组。
     * 回调函数filter(dir,fileName)返回true（或者返回promise解析为true），则把对应的
     * 完整文件路径添加到返回结果里*/
    find:function(dir,filter){
        var allFiles=[];
        filter=filter?filter:function(){return Promise.as(true);};

        var find=function(dir,files){
            return new Promise(function(resolve){
                fs.readdir(dir,function(err,nameList){
                    if(err) return reject(err);

                    Promise.all(_.map(nameList,function(fileName){
                        var fullPath=path.join(dir,fileName);
                        var filterFile=filter(dir,fileName).then(function(isOK){
                            if(isOK)files.push(fullPath);
                        });
                        var findInSub= s.File.isDir(fullPath).then(function(isDir){
                            if(isDir)return find(fullPath,files);
                        });
                        return Promise.all([filterFile,findInSub]);
                    })).then(function(){resolve(files)})

                });
            });
        };

        return find(dir,allFiles);
    }
}