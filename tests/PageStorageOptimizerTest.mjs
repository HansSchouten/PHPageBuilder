import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const helperUrl = new URL(
    '../src/Modules/GrapesJS/resources/assets/js/page-storage-optimizer.js',
    import.meta.url
);
const source = await readFile(helperUrl, 'utf8');
const compiled = await transform(source, { format: 'cjs', target: 'es2015' });
const helperModule = { exports: {} };
new Function('module', 'exports', compiled.code)(helperModule, helperModule.exports);
const { optimizePageStorage } = helperModule.exports;

class Collection {
    constructor(models = []) {
        this.models = models;
    }

    each(callback) {
        this.models.forEach(callback);
    }
}

class Model {
    constructor(values = {}) {
        this.values = values;
    }

    get(name) {
        return this.values[name];
    }

    set(name, value) {
        this.values[name] = value;
    }

    unset(name) {
        delete this.values[name];
    }
}

class Component extends Model {
    constructor({ id = '', classes = [], attributes = {}, children = [], traits = [], ...values } = {}) {
        super({
            ...values,
            attributes,
            components: new Collection(children),
            traits: new Collection(traits)
        });
        this.id = id;
        this.classes = classes;
    }

    getId() {
        return this.id;
    }

    getAttributes() {
        return {
            ...this.get('attributes'),
            ...(this.id ? { id: this.id } : {}),
            ...(this.classes.length ? { class: this.classes.join(' ') } : {})
        };
    }

    getClasses() {
        return this.classes.slice();
    }

    removeClass(className) {
        this.classes = this.classes.filter(value => value !== className);
    }
}

class Trait extends Model {
    getTargetValue() {
        return this.get('value');
    }
}

class Selector extends Model {}

class StyleRule extends Model {
    constructor({ selector, type, style, css }) {
        super({
            style,
            selectors: new Collection([new Selector({ name: selector, type })])
        });
        this.css = css;
    }

    toCSS() {
        return this.css;
    }
}

function classRule(className, css = `.${className}{color:red;}`) {
    return new StyleRule({ selector: className, type: 1, style: { color: 'red' }, css });
}

function idRule(id, css = `#${id}{color:red;}`) {
    return new StyleRule({ selector: id, type: 2, style: { color: 'red' }, css });
}

{
    const result = optimizePageStorage({
        contentRoots: [],
        styleComponents: [idRule('layout-footer'), classRule('layout-only')]
    });
    assert.deepEqual(result.style, []);
    assert.equal(result.css, '');
}

{
    const component = new Component({
        id: 'page-heading',
        classes: ['heading'],
        attributes: { 'data-raw-content': 'true' }
    });
    const headingRule = classRule('heading');
    const result = optimizePageStorage({
        contentRoots: [component],
        styleComponents: [idRule('layout-footer'), headingRule]
    });
    assert.deepEqual(result.style, [headingRule]);
    assert.equal(result.css, '.heading{color:red;}');
    assert.equal(component.get('attributes')['data-raw-content'], undefined);
}

{
    const identifier = 'IDABCDEFGHIJKLMN';
    const component = new Component({
        classes: [identifier],
        'style-identifier': identifier
    });
    optimizePageStorage({ contentRoots: [component] });
    assert.deepEqual(component.getClasses(), []);
    assert.equal(component.get('style-identifier'), undefined);
}

{
    const identifier = 'IDNOPQRSTUVWXYZ1';
    const component = new Component({ classes: [identifier] });
    const style = classRule(identifier);
    const result = optimizePageStorage({
        contentRoots: [component],
        styleComponents: [style]
    });
    assert.deepEqual(component.getClasses(), [identifier]);
    assert.deepEqual(result.style, [style]);
}

{
    const identifier = 'IDCODEUSE1234567';
    const code = `const markup = '<div class="card">hello</div>'; document.querySelector('.${identifier}');`;
    const component = new Component({
        classes: [identifier],
        traits: [new Trait({ name: 'javascript', value: code })]
    });
    optimizePageStorage({ contentRoots: [component] });
    assert.deepEqual(component.getClasses(), [identifier]);
    assert.equal(component.get('traits').models[0].getTargetValue(), code);
}

{
    const identifier = 'IDOTHERLANG12345';
    const component = new Component({ classes: [identifier] });
    const otherLanguageBlocks = {
        nl: {},
        en: {
            block: {
                settings: {
                    attributes: {
                        html: `<div class="${identifier}">This is content, not code</div>`,
                        css: `.${identifier} { color: red; }`
                    }
                }
            }
        }
    };
    optimizePageStorage({
        contentRoots: [component],
        additionalCode: otherLanguageBlocks
    });
    assert.deepEqual(component.getClasses(), [identifier]);
}

{
    const identifier = 'IDDETACHED123456';
    const liveComponent = new Component({
        classes: [identifier],
        attributes: { 'data-raw-content': 'true' },
        'style-identifier': identifier
    });
    const storageClone = new Component({
        classes: liveComponent.getClasses(),
        attributes: {...liveComponent.get('attributes')},
        'style-identifier': liveComponent.get('style-identifier')
    });

    optimizePageStorage({ contentRoots: [storageClone] });

    assert.deepEqual(storageClone.getClasses(), []);
    assert.equal(storageClone.get('attributes')['data-raw-content'], undefined);
    assert.equal(storageClone.get('style-identifier'), undefined);
    assert.deepEqual(liveComponent.getClasses(), [identifier]);
    assert.equal(liveComponent.get('attributes')['data-raw-content'], 'true');
    assert.equal(liveComponent.get('style-identifier'), identifier);
}

{
    let root = new Component();
    let current = root;
    for (let index = 0; index < 20000; index++) {
        let child = new Component();
        current.get('components').models.push(child);
        current = child;
    }
    assert.doesNotThrow(() => optimizePageStorage({ contentRoots: [root] }));
}

console.log('Page storage optimizer tests passed.');
