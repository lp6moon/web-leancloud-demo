var BError=function(code,msg,data){
    this.code=code;
    this.message=msg;
    this.data=data;
};

module.exports={
    //新建一个业务错误
    createError:function(code,message,data){
        return new BError(code,message,data);
    },
    //创建一个自定义业务错误自定义业务错误编码都为 400999
    createCustomError:function(message,data){
        return new BError(400999,message,data);
    },

    /**以下是通用的业务错误*/
    ILLEGAL_PARAMS:new BError(400001,'非法参数')    //请求参数不符合规范
}