var logger=AppCtx.Logger('cloud');
var AV = require('leanengine');
AV.Cloud.define('hello', function(request, response) {
    logger.debug('执行云函数:hello');
    response.success('Hello world!');
});
