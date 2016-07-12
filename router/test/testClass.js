var logger=AppCtx.Logger('router.test.testClass');

var model=AppCtx.BaseModel('TestClass',logger);
var s=AppCtx.BaseRouter(model,logger);

module.exports=s.initRouter();