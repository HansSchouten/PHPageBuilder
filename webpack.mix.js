let mix = require('webpack-mix').mix;

let loginAssetsPath = 'src/Login/resources/assets/';
mix.sass(loginAssetsPath + 'sass/app.scss', 'dist/login');

let websiteManagerAssetsPath = 'src/WebsiteManager/resources/assets/';
mix.sass(websiteManagerAssetsPath + 'sass/app.scss', 'dist/websitemanager');

let grapesJSAssetsPath = 'src/GrapesJS/resources/assets/';
mix.sass(grapesJSAssetsPath + 'sass/app.scss', 'dist/pagebuilder')
    .js(grapesJSAssetsPath + 'js/app.js', 'dist/pagebuilder');
