var AV=require('leanengine');

AV.Cloud.beforeSave('TestClass',function(request,response){
    var model = request.object;
    console.log('beforeSave:')
    console.log(model.toJSON())
    response.success();

})

AV.Cloud.beforeUpdate('TestClass', function(request, response) {
    var model = request.object;
    console.log(model)
    response.success();
});