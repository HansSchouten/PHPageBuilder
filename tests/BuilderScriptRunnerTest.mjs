import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const runnerPath = new URL('../src/Modules/GrapesJS/resources/assets/js/run-builder-scripts.js', import.meta.url);
const lifecyclePath = new URL('../src/Modules/GrapesJS/resources/assets/js/manage-editable-components.js', import.meta.url);
const runnerSource = await readFile(runnerPath, 'utf8');
const lifecycleSource = await readFile(lifecyclePath, 'utf8');
const listeners = {};
const executed = [];
let context;

const document = {
    createElement() {
        return { type: null, innerHTML: '' };
    },
    getElementsByClassName() {
        return [];
    },
};

document.body = {
    appendChild(script) {
        vm.runInContext(script.innerHTML, context);
    },
};

const window = {
    executed,
    editor: {
        on(name, callback) {
            (listeners[name] ||= []).push(callback);
        },
        Canvas: {
            getDocument() {
                return document;
            },
        },
    },
};

function $(selector) {
    let scriptContents = '';
    return {
        append(html) {
            const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
            scriptContents = match ? match[1] : '';
            return this;
        },
        find() {
            return {
                prepend(value) {
                    scriptContents = value + scriptContents;
                    return this;
                },
                append(value) {
                    scriptContents += value;
                    return this;
                },
                html() {
                    return scriptContents;
                },
            };
        },
    };
}

context = vm.createContext({ window, document, $, Date });
vm.runInContext(runnerSource, context);

function createComponent(attributes = {}, children = []) {
    const elementAttributes = {};
    const classes = new Set();
    const component = {
        attributes,
        _children: children,
        components() {
            return {
                get length() { return component._children.length; },
                get models() { return component._children; },
                each(callback) { component._children.forEach(callback); },
            };
        },
        getEl() {
            return {
                getAttribute(name) { return elementAttributes[name] ?? null; },
                setAttribute(name, value) { elementAttributes[name] = value; },
                classList: { add(name) { classes.add(name); } },
            };
        },
        _elementAttributes: elementAttributes,
        _classes: classes,
    };

    for (const child of children) child._parent = component;
    return component;
}

function scriptChild(label) {
    return {
        attributes: { type: 'script' },
        toHTML() { return `<script>window.executed.push("${label}");</script>`; },
        remove() {
            const siblings = this._parent._children;
            siblings.splice(siblings.indexOf(this), 1);
        },
    };
}

const layoutBlock = createComponent({ attributes: { 'block-id': 'layout-block' } });
const layoutScript = scriptChild('layout');
layoutScript._parent = layoutBlock;
layoutBlock._children.push(layoutScript);

const pageBlock = createComponent({ 'block-id': 'page-block', 'style-identifier': 'page-block-style' });
const pageScript = scriptChild('page');
pageScript._parent = pageBlock;
pageBlock._children.push(pageScript);

const contentContainer = createComponent({ attributes: { 'phpb-content-container': '' } }, [pageBlock]);
const wrapper = createComponent({}, [layoutBlock, contentContainer]);

for (const component of [layoutBlock, pageBlock]) {
    for (const callback of listeners['component:create']) callback(component);
}

assert.equal(layoutBlock._children.length, 0, 'layout builder script should be extracted from the component tree');
assert.equal(pageBlock._children.length, 0, 'page builder script should be extracted from the component tree');

window.runScriptsOfComponentAndChildren(wrapper, true);
assert.deepEqual(executed, ['layout'], 'layout pass should skip editable page-content containers');
assert.match(layoutBlock._elementAttributes['data-phpb-layout-script-class'], /^phpb-layout-script-preview-/);
assert.ok(layoutBlock._classes.has(layoutBlock._elementAttributes['data-phpb-layout-script-class']));

window.runScriptsOfComponentAndChildren(contentContainer);
assert.deepEqual(executed, ['layout', 'page'], 'the regular content pass should still run page block scripts');

assert.match(lifecycleSource, /runScriptsOfComponentAndChildren\(window\.editor\.getWrapper\(\),\s*true\)/,
    'page-load lifecycle should start a layout pass at the wrapper and skip page-content containers');

console.log('Builder script runner tests passed.');
