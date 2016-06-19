var express = require('express');
var AV = require('leanengine');

var app = express();

app.use(AV.express());
app.get('/', function(req, res) {
  res.send(new Date());
});


module.exports = app;
