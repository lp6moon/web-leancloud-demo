require('./app-core/app.js')({
    appRootDir:__dirname,
    appConfigPath:require('path').join(__dirname,'config/app-config.js')
});