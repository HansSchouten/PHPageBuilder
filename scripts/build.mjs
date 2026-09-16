import { watch as watchFileSystem } from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import autoprefixer from 'autoprefixer';
import * as esbuild from 'esbuild';
import { minify as minifyHtml } from 'html-minifier-terser';
import postcss from 'postcss';
import * as sass from 'sass';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const production = process.argv.includes('--production');
const watching = process.argv.includes('--watch');

const grapesAssets = path.join(projectRoot, 'src/Modules/GrapesJS/resources/assets');
const websiteManagerAssets = path.join(projectRoot, 'src/Modules/WebsiteManager/resources/assets');
const authAssets = path.join(projectRoot, 'src/Modules/Auth/resources/assets');

const javascriptBundles = [
    {
        input: path.join(websiteManagerAssets, 'js/app.js'),
        output: path.join(projectRoot, 'dist/websitemanager/app.js'),
    },
    {
        input: path.join(grapesAssets, 'js/app.js'),
        output: path.join(projectRoot, 'dist/pagebuilder/app.js'),
    },
    {
        input: path.join(grapesAssets, 'js/page-injection.js'),
        output: path.join(projectRoot, 'dist/pagebuilder/page-injection.js'),
    },
];

const stylesheetBundles = [
    {
        input: path.join(authAssets, 'sass/app.scss'),
        output: path.join(projectRoot, 'dist/auth/app.css'),
    },
    {
        input: path.join(websiteManagerAssets, 'sass/app.scss'),
        output: path.join(projectRoot, 'dist/websitemanager/app.css'),
    },
    {
        input: path.join(grapesAssets, 'sass/app.scss'),
        output: path.join(projectRoot, 'dist/pagebuilder/app.css'),
    },
    {
        input: path.join(grapesAssets, 'sass/page-injection.scss'),
        output: path.join(projectRoot, 'dist/pagebuilder/page-injection.css'),
    },
];

const minifiedHtmlPlugin = {
    name: 'minified-html',
    setup(build) {
        build.onLoad({ filter: /\.html$/ }, async ({ path: htmlPath }) => {
            const source = await readFile(htmlPath, 'utf8');
            const contents = await minifyHtml(source, {
                collapseWhitespace: true,
                minifyCSS: true,
                removeComments: true,
            });

            return { contents, loader: 'text' };
        });
    },
};

async function buildJavaScript({ input, output }) {
    await mkdir(path.dirname(output), { recursive: true });
    await esbuild.build({
        entryPoints: [input],
        outfile: output,
        bundle: true,
        format: 'iife',
        target: ['es2015'],
        minify: production,
        plugins: [minifiedHtmlPlugin],
        legalComments: 'none',
        sourcemap: false,
        logLevel: 'silent',
    });
}

async function buildStylesheet({ input, output }) {
    const compiled = sass.compile(input, {
        style: production ? 'compressed' : 'expanded',
        loadPaths: [path.dirname(input)],
        silenceDeprecations: ['import'],
    });
    const processed = await postcss([autoprefixer]).process(compiled.css, {
        from: input,
        to: output,
        map: false,
    });

    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, processed.css);
}

async function copyImages() {
    await cp(
        path.join(grapesAssets, 'images'),
        path.join(projectRoot, 'dist/pagebuilder/images'),
        { recursive: true, force: true },
    );
}

async function buildAll() {
    const startedAt = Date.now();

    await Promise.all([
        ...javascriptBundles.map(buildJavaScript),
        ...stylesheetBundles.map(buildStylesheet),
        copyImages(),
    ]);

    const mode = production ? 'production' : 'development';
    console.log(`Built ${javascriptBundles.length} scripts and ${stylesheetBundles.length} stylesheets for ${mode} in ${Date.now() - startedAt} ms.`);
}

let buildRunning = false;
let rebuildQueued = false;
let rebuildTimer;

async function runBuild() {
    if (buildRunning) {
        rebuildQueued = true;
        return;
    }

    buildRunning = true;
    try {
        await buildAll();
    } catch (error) {
        console.error(error);
        if (!watching) {
            process.exitCode = 1;
        }
    } finally {
        buildRunning = false;
        if (rebuildQueued) {
            rebuildQueued = false;
            await runBuild();
        }
    }
}

function queueBuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(runBuild, 100);
}

await runBuild();

if (watching) {
    const watchedDirectories = [authAssets, websiteManagerAssets, grapesAssets];
    for (const directory of watchedDirectories) {
        watchFileSystem(directory, { recursive: true }, queueBuild);
    }
    console.log('Watching source assets for changes. Press Ctrl+C to stop.');
}
