let mix = require('webpack-mix').mix;

let assetsPath = 'src/GrapesJS/resources/assets/';

mix.sass(assetsPath + 'sass/app.scss', 'dist')
    .js(assetsPath + 'js/app.js', 'dist');