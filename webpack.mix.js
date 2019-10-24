let mix = require('webpack-mix').mix;

let loginAssetsPath = 'src/Modules/Login/resources/assets/';
mix.sass(loginAssetsPath + 'sass/app.scss', 'dist/login');

let websiteManagerAssetsPath = 'src/Modules/WebsiteManager/resources/assets/';
mix.sass(websiteManagerAssetsPath + 'sass/app.scss', 'dist/websitemanager');

let grapesJSAssetsPath = 'src/Modules/GrapesJS/resources/assets/';
mix.sass(grapesJSAssetsPath + 'sass/app.scss', 'dist/pagebuilder');
