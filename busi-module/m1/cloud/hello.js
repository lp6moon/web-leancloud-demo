var AV = require('leanengine');
AV.Cloud.define('m1_hello', function(request, response) {
    response.success('Hello m1!');
});
