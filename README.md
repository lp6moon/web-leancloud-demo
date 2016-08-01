### 概要
    一个简单leancloud云引擎的nodejs工程框架。

### 目录结构及说明

    ROOT
    |---app-core            #app核心重要目录
        |---common              #app常用模块目录
            |---base-model.js       #数据基础model类，提供简单的CRUD操作
            |---base-router.js      #对单个model进行CRUD的API提供
            |---busi-error.js       #业务错误管理类
            |---redis-manage.js     #redis客户端管理类
            |---schema-manage.js    #对数据各个表的模式字段定义管理类
            |---util.js             #应用的工具类
        |---filter              #app个过滤中间件目录
            |---acl.js              #权限控制的中间件(router.acl=true则加载此中间件之后,反之则在前)
            |---error-handler.js    #处理错误的中间件，包括404、500和leancloud的云引擎的错误
        |---locales             #多国语言转换json数据目录
        |---app.js              #app配置核心文件，包括app的各部分初始化
    |---busi-module         #业务模块目录(每个模块都包括router，static，cloud的目录，在配置文件定义)
    |---cloud               #app云函数目录
    |---common              #app常用文件目录
        |---schema-fields.js    #app的数据模式的定义
    |---config              #app配置文件目录
        |---app-config.js       #app的配置文件
    |---router              #app的router目录
        |---common              #常用路由
            |---user.js             #用户相关API
        |---auth.js             #登录、登出等授权路由
        |---home.js             #首页路由
    |---static              #app静态文件目录
        |---lib                 #前端第三方库目录，有bower管理
        |---admin               #前端管理应用 由webix搭建mvc框架(待定中...)
        |---assets              #前端静态资源
        |---uploads             #前端上传文件临时存放目录
    |---view                #app模板目录
    |---bower.json          #bower前端资源描述文件
    |---package.json        #项目json描述文件
    |---server.js           #应用APP服务启动文件

###    接口规范

#### 请求格式
调用REST接口需要设置以下HTTP头：
```
content-type:'.....',
content-length:XXX
```

请求数据格式：
- BODY请求数据格式：`{data:"业务数据,可为数组也可为对象"}`
- content-type推荐使用`application/json;charset=utf8`
- URL请求参数格式支持`application/x-www-form-urlencoded`，具体可参考jQuery.param()
- BODY请求数据格式支持`text/plain`,`application/json`,`application/x-www-form-urlencoded`

请求URL规范：
- 静态资源URL: /static/xxx.html
- api接口URL:  /api[版本号]/xxx
- 业务模块的静态资源URL:    /static/{module_name}/xxx.html
- 业务模块的api接口URL：    /api[版本号]/{module_name}/xxx.html

注意：模块名(module_name)不能重复和公共目录名重复，否则会覆盖

#### 响应格式
    响应数据格式为`application/json;charset=utf8`,如下：
```
{
    data:"业务数据,可为数组也可为对象",
    error:{ /*如果包含此属性，则说明发生了错误*/
        code:"业务错误码",
        message:"错误信息",
        stack:"错误对象栈，此属性仅在开发环境拥有值",
        data:"额外需要的错误数据"
    }
    /*其他属性，一般为业务数据，如total:"查询记录总数"*/
}
```

常用HTTP状态码：
状态码 | 说明
---|---
200 | 成功处理请求并返回结果
401 | 请求未通过身份验证
403 | 没有访问权限
404 | 找不到请求的URL
500 | 服务端错误，服务端在处理请求时发生了未知错误

常用业务错误码：
状态码 | 说明
---|---
400xxx | 业务处理时产生的错误，xxx业务中自定义
400001 | 非法参数错误码，可能是参数类型错误或必填参数为空
400999 | 通用错误码，对一些不常见错误使用
500xxx | 云引擎产生的错误，其中xxx是云引擎的定义的套错误码

#### 常用标准的单表的CRUD的API说明
    例如对user表的进行操作，注册路由的baseUrl为: /api/user
```
GET: /api/user 批量查询
    request:
      query:
        - exps 查询表达式 例如：[["field_a","=","value_a"]
          type 数组
        - fields 查询字段,给个字段用","分割 例如："field_a,field_b"
          type 字符串
        - orderBy 排序字段 例如："field_a asc,field_b desc"
          type 字符串
        - limit 查询数量限制，与分页的pageSize意义相同
          type 数值字符串
        - offset 查询时数量偏移量，与分页的skip意义相同
          type 数值字符串
    respone:
      body:
        - data 查询数据
          type 数组
        - total 数据总数
          type 数字
        - error 错误对象
          type 对象
GET: /api/user/one 单个查询
    request:
      query:
        - id 用户ID
          type 字符串
        - fields 查询字段
          type 字符串
    response:
      body:
        - data 查询数据
          type 对象
        - error 错误对象
          type 对象
GET: /api/user/count 计数查询
    request:
      query:
        - exps 查询表达式 例如：[["field_a","=","value_a"]
          type 数组
    response:
      body:
        - data 查询数据
          type 数值
        - error 错误对象
          type 对象
POST: /api/user 新增或更新。对象的ID存在则更新，反则新增
    request:
      body:
        - data 保存的数据
          type 对象或数组
    respones:
      body:
        - data 已保存的数据，数据与request的data数据一一对应
          type 对象或数组
        - error 错误对象
          type 对象
DELETE: /api/user 批量删除
    request:
      body
        - data 删除的ID
          type 字符串数组或字符串
    respones:
      body:
        - data 删除状态
          type 布尔值
        - error 错误对象
          type 对象
```

查询表达式exps说明：


    表达式exp的形式：[field,op,value]
        field：查询的字段名
        op：查询的操作符，可能值：
                '=','<','>','!=','>=','<=','in','not in',
                'matches'(正则表达匹配),'startsWith','contains'(字符串中包含),'endsWith',
                'exists','doesNotExist','containsAll'(属性为数组的包含)
        value：查询比较的值

