import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const helperUrl = new URL(
    '../src/Modules/GrapesJS/resources/assets/js/page-translation-synchronizer.js',
    import.meta.url
);
const source = await readFile(helperUrl, 'utf8');
const compiled = await transform(source, { format: 'cjs', target: 'es2015' });
const helperModule = { exports: {} };
new Function('module', 'exports', compiled.code)(helperModule, helperModule.exports);
const {
    buildSettingSynchronizationPolicies,
    cloneTranslationData,
    createPageTranslationSynchronizer,
    mergeBlockTranslations,
    synchronizeGeneratedStyleClassTrees,
    synchronizePageTranslations
} = helperModule.exports;

function dynamicBlock(attributes = {}, blocks = [], html = '') {
    return {
        settings: {attributes},
        blocks,
        html,
        is_html: false
    };
}

function htmlBlock(html) {
    return {
        settings: [],
        blocks: [],
        html,
        is_html: true
    };
}

function commitSourceBaseline(baselines, variants, sourceLanguage) {
    baselines[sourceLanguage] = cloneTranslationData(variants[sourceLanguage]);
}

function testElement(tagName, className = '', children = []) {
    let attributes = {};
    if (className) {
        attributes.class = className;
    }

    return {
        localName: tagName,
        children,
        getAttribute(name) {
            return Object.prototype.hasOwnProperty.call(attributes, name)
                ? attributes[name]
                : null;
        },
        setAttribute(name, value) {
            attributes[name] = value;
        },
        removeAttribute(name) {
            delete attributes[name];
        }
    };
}

{
    // PageRenderer exposes an empty language as null; editor initialization
    // normalizes it to an object before the regular save path runs.
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants: {en: null},
        blockSettings: {}
    });
    const variants = {en: {}};
    const result = synchronizer.synchronize(variants, 'en');

    assert.deepEqual(result, {
        variants: {en: {}},
        conflicts: []
    });
    assert.notStrictEqual(result.variants, variants);
    assert.notStrictEqual(result.variants.en, variants.en);
}

{
    // The persisted empty-array representation is accepted unchanged too.
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants: {nl: []},
        blockSettings: {}
    });
    const variants = {nl: []};
    const result = synchronizer.synchronize(variants, 'nl');

    assert.deepEqual(result, {
        variants: {nl: []},
        conflicts: []
    });
}

{
    // Changes in the only available language are preserved unchanged. The
    // synchronizer still returns detached data as required by save rollback.
    const initialVariants = {
        nl: {block: dynamicBlock({title: 'Hallo', enabled: '1'})}
    };
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants,
        blockSettings: {
            demo: [
                {name: 'title', type: 'text'},
                {name: 'enabled', type: 'select'}
            ]
        }
    });
    const variants = cloneTranslationData(initialVariants);
    variants.nl.block.settings.attributes.title = 'Hallo wereld';
    variants.nl.block.settings.attributes.enabled = '0';
    synchronizer.registerSerializedBlock(variants.nl.block, 'demo');

    const result = synchronizer.synchronize(variants, 'nl');

    assert.deepEqual(result.variants, variants);
    assert.deepEqual(result.conflicts, []);
    assert.notStrictEqual(result.variants.nl, variants.nl);
    assert.notStrictEqual(result.variants.nl.block, variants.nl.block);

    synchronizer.commitSourceBaseline(result.variants, 'nl');
}

{
    const policies = buildSettingSynchronizationPolicies({
        demo: [
            {name: 'title', type: 'text'},
            {name: 'enabled', type: 'select'},
            {name: 'toggle', type: 'yes_no'},
            {name: 'image', type: 'image'},
            {name: 'localized_select', type: 'select', always_sync_across_languages: false},
            {name: 'forced_text', type: 'text', always_sync_across_languages: true}
        ]
    });

    assert.deepEqual(policies, {
        demo: {
            title: false,
            enabled: true,
            toggle: true,
            image: true,
            localized_select: false,
            forced_text: true
        }
    });

    const base = {block: dynamicBlock({
        title: 'Base title',
        enabled: '1',
        image: '/base.jpg',
        localized_select: 'base-option',
        forced_text: 'base-code'
    })};
    const source = {block: dynamicBlock({
        title: 'Source title',
        enabled: '0',
        image: '/source.jpg',
        localized_select: 'source-option',
        forced_text: 'source-code'
    })};
    const target = {block: dynamicBlock({
        title: 'Translated title',
        enabled: '1',
        image: '/target.jpg',
        localized_select: 'target-option',
        forced_text: 'target-code'
    })};
    const blockSlugs = new WeakMap([[source.block, 'demo']]);
    const result = mergeBlockTranslations({
        base,
        source,
        target,
        shouldAlwaysSynchronizeAttribute: (sourceBlock, attributeName) => {
            const slug = blockSlugs.get(sourceBlock);
            return slug !== undefined && policies[slug][attributeName] === true;
        }
    });

    assert.deepEqual(result.blocks.block.settings.attributes, {
        title: 'Translated title',
        enabled: '0',
        image: '/source.jpg',
        localized_select: 'target-option',
        forced_text: 'source-code'
    });
    assert.deepEqual(result.conflicts, [
        {path: ['block', 'settings', 'attributes', 'title'], type: 'value'},
        {path: ['block', 'settings', 'attributes', 'localized_select'], type: 'value'}
    ]);
}

{
    // Always-synchronized settings are deterministic in both directions and
    // do not depend on the per-language three-way baselines. Exercise the
    // stateful facade used by save-page.js, including block-slug registration.
    const initialVariants = {
        nl: {block: dynamicBlock({ai_reasoning_effort: 'high'})},
        en: {block: dynamicBlock({ai_reasoning_effort: 'high'})}
    };
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants,
        blockSettings: {
            'ai-content': [
                {name: 'ai_reasoning_effort', type: 'select'}
            ]
        }
    });
    let variants = cloneTranslationData(initialVariants);

    variants.en.block.settings.attributes.ai_reasoning_effort = 'medium';
    synchronizer.registerSerializedBlock(variants.en.block, 'ai-content');
    let englishMerge = synchronizer.synchronize(variants, 'en');
    assert.equal(englishMerge.variants.nl.block.settings.attributes.ai_reasoning_effort, 'medium');
    assert.equal(englishMerge.variants.en.block.settings.attributes.ai_reasoning_effort, 'medium');

    variants = englishMerge.variants;
    synchronizer.commitSourceBaseline(variants, 'en');
    variants.nl.block.settings.attributes.ai_reasoning_effort = 'high';
    synchronizer.registerSerializedBlock(variants.nl.block, 'ai-content');
    let dutchMerge = synchronizer.synchronize(variants, 'nl');
    assert.equal(dutchMerge.variants.nl.block.settings.attributes.ai_reasoning_effort, 'high');
    assert.equal(dutchMerge.variants.en.block.settings.attributes.ai_reasoning_effort, 'high');
    assert.deepEqual(dutchMerge.conflicts, []);
}

{
    // Generated selector classes are structural. Preserve target-authored
    // classes, do not copy source-authored classes, and replace only ID... classes.
    const sourceHeading = testElement('h1', 'source-heading IDMU9VJIAZBLNIB19', [
        testElement('span', 'IDMU9VJIAZBLNIB20')
    ]);
    const targetHeading = testElement('h1', 'translated-heading IDTARGET00000001', [
        testElement('span', 'translated-copy')
    ]);
    const result = synchronizeGeneratedStyleClassTrees(
        {children: [sourceHeading]},
        {children: [targetHeading]}
    );

    assert.deepEqual(result, {changed: true, conflict: false});
    assert.equal(
        targetHeading.getAttribute('class'),
        'translated-heading IDMU9VJIAZBLNIB19'
    );
    assert.equal(
        targetHeading.children[0].getAttribute('class'),
        'translated-copy IDMU9VJIAZBLNIB20'
    );
}

{
    // A matching parent is safe to update even if translated descendants have
    // a different structure. Ambiguous descendants are skipped and reported.
    const sourceHeading = testElement('h1', 'IDMU9VJIAZBLNIB19', [
        testElement('em')
    ]);
    const targetHeading = testElement('h1');
    const result = synchronizeGeneratedStyleClassTrees(
        {children: [sourceHeading]},
        {children: [targetHeading]}
    );

    assert.deepEqual(result, {changed: true, conflict: true});
    assert.equal(targetHeading.getAttribute('class'), 'IDMU9VJIAZBLNIB19');
}

{
    // Exact reported flow: EN receives custom styling while NL has translated
    // text. The NL text remains intact and only the technical selector follows.
    const initialVariants = {
        nl: {heading: htmlBlock('<h1>hallo wereld!</h1>')},
        en: {heading: htmlBlock('<h1>hello world!</h1>')}
    };
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants,
        synchronizeStyleHtml(sourceHtml, targetHtml) {
            let identifier = sourceHtml.match(/ID[A-Z0-9]{14,}/i)[0];
            return targetHtml.replace('<h1>', `<h1 class="${identifier}">`);
        }
    });
    const variants = cloneTranslationData(initialVariants);
    variants.en.heading.settings = {
        attributes: {'style-identifier': 'IDMU9VJIAZBLNIB19'}
    };
    variants.en.heading.html =
        '<h1 class="IDMU9VJIAZBLNIB19">hello world!</h1>';

    const result = synchronizer.synchronize(variants, 'en');

    assert.equal(
        result.variants.nl.heading.html,
        '<h1 class="IDMU9VJIAZBLNIB19">hallo wereld!</h1>'
    );
    assert.equal(
        result.variants.nl.heading.settings.attributes['style-identifier'],
        'IDMU9VJIAZBLNIB19'
    );
}

{
    // Reproduce the CSS-block acceptance flow exactly: the first NL save
    // creates the same value in EN, then an EN edit must overwrite NL because
    // this text setting explicitly opts into unconditional synchronization.
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants: {nl: {}, en: {}},
        blockSettings: {
            css: [{
                name: 'css',
                type: 'text',
                always_sync_across_languages: true
            }]
        }
    });
    let variants = {
        nl: {cssBlock: dynamicBlock({css: 'h1 { color: red }'})},
        en: {}
    };

    synchronizer.registerSerializedBlock(variants.nl.cssBlock, 'css');
    let dutchSave = synchronizer.synchronize(variants, 'nl');
    assert.equal(
        dutchSave.variants.en.cssBlock.settings.attributes.css,
        'h1 { color: red }'
    );

    variants = dutchSave.variants;
    synchronizer.commitSourceBaseline(variants, 'nl');
    variants.en.cssBlock.settings.attributes.css = 'h1 { color: green}';
    synchronizer.registerSerializedBlock(variants.en.cssBlock, 'css');
    let englishSave = synchronizer.synchronize(variants, 'en');

    assert.equal(
        englishSave.variants.en.cssBlock.settings.attributes.css,
        'h1 { color: green}'
    );
    assert.equal(
        englishSave.variants.nl.cssBlock.settings.attributes.css,
        'h1 { color: green}'
    );
    assert.deepEqual(englishSave.conflicts, []);
}

{
    // AI/custom editors can replace a block without reliably changing
    // GrapesJS' changesCount. A successful first save must still checkpoint
    // the generated block so a later inline text edit has a valid merge base.
    const synchronizer = createPageTranslationSynchronizer({
        initialVariants: {nl: {}, en: {}}
    });
    let variants = {
        nl: {
            aiContent: dynamicBlock({css: '.page { color: red; }'}, {
                content: htmlBlock('<h1>Abstracte kunst</h1>')
            })
        },
        en: {}
    };

    let generatedSave = synchronizer.synchronize(variants, 'nl');
    variants = generatedSave.variants;
    synchronizer.commitSourceBaseline(variants, 'nl');
    assert.equal(variants.nl.aiContent.origin_language, 'nl');
    assert.equal(variants.en.aiContent.origin_language, 'nl');
    assert.equal(variants.nl.aiContent.blocks.content.origin_language, 'nl');
    assert.equal(variants.en.aiContent.blocks.content.origin_language, 'nl');

    variants.nl.aiContent.blocks.content.html = '<h1>Abstracte kunst!</h1>';
    let inlineEditSave = synchronizer.synchronize(variants, 'nl');

    assert.equal(
        inlineEditSave.variants.en.aiContent.blocks.content.html,
        '<h1>Abstracte kunst!</h1>'
    );
    assert.deepEqual(inlineEditSave.conflicts, []);
}

{
    // A language that merely received copied text is not its origin. Editing
    // that language creates a translation and must not write back into the
    // language from which the text originally came.
    let synchronizer = createPageTranslationSynchronizer({
        initialVariants: {nl: {}, en: {}}
    });
    let variants = {
        nl: {
            content: dynamicBlock({}, {
                body: htmlBlock('<h1>Hallo wereld</h1>')
            })
        },
        en: {}
    };

    let firstDutchSave = synchronizer.synchronize(variants, 'nl');
    variants = firstDutchSave.variants;
    synchronizer.commitSourceBaseline(variants, 'nl');

    variants.nl.content.blocks.body.html = '<h1>Hallo wereld!</h1>';
    let secondDutchSave = synchronizer.synchronize(variants, 'nl');
    variants = secondDutchSave.variants;
    synchronizer.commitSourceBaseline(variants, 'nl');
    assert.equal(
        variants.en.content.blocks.body.html,
        '<h1>Hallo wereld!</h1>'
    );

    // A real page reload reconstructs all in-memory merge state. The persisted
    // origin must still prevent an English translation from flowing into NL.
    variants = cloneTranslationData(variants);
    synchronizer = createPageTranslationSynchronizer({
        initialVariants: variants,
        defaultOriginLanguage: 'nl'
    });
    variants.en.content.blocks.body.html = '<h1>Hello world!</h1>';
    let englishTranslationSave = synchronizer.synchronize(variants, 'en');
    variants = englishTranslationSave.variants;
    synchronizer.commitSourceBaseline(variants, 'en');

    assert.equal(
        variants.en.content.blocks.body.html,
        '<h1>Hello world!</h1>'
    );
    assert.equal(
        variants.nl.content.blocks.body.html,
        '<h1>Hallo wereld!</h1>'
    );

    // Reload once more and edit the origin. The existing translation has
    // diverged from the old NL base and therefore remains English.
    variants = cloneTranslationData(variants);
    synchronizer = createPageTranslationSynchronizer({
        initialVariants: variants,
        defaultOriginLanguage: 'nl'
    });
    variants.nl.content.blocks.body.html = '<h1>Hallo abstracte wereld!</h1>';
    let laterDutchSave = synchronizer.synchronize(variants, 'nl');

    assert.equal(
        laterDutchSave.variants.nl.content.blocks.body.html,
        '<h1>Hallo abstracte wereld!</h1>'
    );
    assert.equal(
        laterDutchSave.variants.en.content.blocks.body.html,
        '<h1>Hello world!</h1>'
    );
}

{
    // Origins are per nested block, not merely per root. A new child added in
    // EN to an NL-origin parent can therefore propagate from EN independently.
    let variants = {
        nl: {layout: dynamicBlock({}, {})},
        en: {layout: dynamicBlock({}, {})}
    };
    let synchronizer = createPageTranslationSynchronizer({
        initialVariants: variants,
        defaultOriginLanguage: 'nl'
    });

    variants.en.layout.blocks.englishChild = htmlBlock('<span>Hello</span>');
    let englishChildSave = synchronizer.synchronize(variants, 'en');

    assert.equal(englishChildSave.variants.en.layout.origin_language, 'nl');
    assert.equal(
        englishChildSave.variants.en.layout.blocks.englishChild.origin_language,
        'en'
    );
    assert.equal(
        englishChildSave.variants.nl.layout.blocks.englishChild.origin_language,
        'en'
    );
    assert.equal(
        englishChildSave.variants.nl.layout.blocks.englishChild.html,
        '<span>Hello</span>'
    );
}

{
    const base = {block: dynamicBlock({html: '<h1>Hello</h1>', ai_reasoning_effort: 'medium'})};
    const source = {block: dynamicBlock({html: '<h1>Hello!!</h1>', ai_reasoning_effort: 'high'})};
    const target = {block: dynamicBlock({html: '<h1>Hello</h1>', ai_reasoning_effort: 'medium'})};
    const result = mergeBlockTranslations({base, source, target});

    assert.equal(result.blocks.block.settings.attributes.html, '<h1>Hello!!</h1>');
    assert.equal(result.blocks.block.settings.attributes.ai_reasoning_effort, 'high');
    assert.deepEqual(result.conflicts, []);
}

{
    const base = {block: dynamicBlock({html: '<h1>Hallo</h1>', ai_reasoning_effort: 'medium'})};
    const source = {block: dynamicBlock({html: '<h1>Hallo!!</h1>', ai_reasoning_effort: 'high'})};
    const target = {block: dynamicBlock({html: '<h1>Hello</h1>', ai_reasoning_effort: 'medium'})};
    const result = mergeBlockTranslations({base, source, target});

    assert.equal(result.blocks.block.settings.attributes.html, '<h1>Hello</h1>');
    assert.equal(result.blocks.block.settings.attributes.ai_reasoning_effort, 'high');
    assert.deepEqual(result.conflicts, [
        {path: ['block', 'settings', 'attributes', 'html'], type: 'value'}
    ]);
}

{
    const originalCode = `h1::before { content: "<script>if (a < b) { x = '</div>'; }</script>"; }`;
    const updatedCode = `h1::before { content: "<script>if (a < b) { x = '<main>'; }</script>"; }`;
    const javascript = `const html = '<div data-value="a > b">${'${value}'}</div>';`;
    const base = {block: dynamicBlock({css: originalCode, javascript})};
    const source = {block: dynamicBlock({css: updatedCode, javascript})};
    const target = {block: dynamicBlock({css: originalCode, javascript})};
    const result = mergeBlockTranslations({base, source, target});

    assert.equal(result.blocks.block.settings.attributes.css, updatedCode);
    assert.equal(result.blocks.block.settings.attributes.javascript, javascript);
}

{
    const base = {
        block: dynamicBlock({}, {
            content: htmlBlock('<h1>Hello</h1>')
        }, '<div>server-rendered base</div>')
    };
    const source = {
        block: dynamicBlock({}, {
            content: htmlBlock('<h1>Hello world</h1>')
        }, '')
    };
    const target = {
        block: dynamicBlock({}, {
            content: htmlBlock('<h1>Hello</h1>')
        }, '<div>server-rendered target</div>')
    };
    const result = mergeBlockTranslations({base, source, target});

    assert.equal(result.blocks.block.blocks.content.html, '<h1>Hello world</h1>');
    assert.equal(result.blocks.block.html, '<div>server-rendered target</div>');
}

{
    const sourceBlock = dynamicBlock({css: 'h1 { color: red; }'});
    const result = mergeBlockTranslations({
        base: {},
        source: {newBlock: sourceBlock},
        target: {}
    });

    assert.deepEqual(result.blocks.newBlock, sourceBlock);
    assert.notEqual(result.blocks.newBlock, sourceBlock);
    assert.notEqual(result.blocks.newBlock.settings, sourceBlock.settings);
    result.blocks.newBlock.settings.attributes.css = 'changed';
    assert.equal(sourceBlock.settings.attributes.css, 'h1 { color: red; }');
}

{
    const unchanged = dynamicBlock({text: 'old'});
    const result = mergeBlockTranslations({
        base: {removed: unchanged},
        source: {},
        target: {removed: unchanged}
    });
    assert.equal(result.blocks.removed, undefined);
    assert.deepEqual(result.conflicts, []);
}

{
    const baseBlock = dynamicBlock({text: 'old'});
    const translatedBlock = dynamicBlock({text: 'translated'});
    const result = mergeBlockTranslations({
        base: {removed: baseBlock},
        source: {},
        target: {removed: translatedBlock}
    });
    assert.equal(result.blocks.removed, undefined);
    assert.deepEqual(result.conflicts, []);
}

{
    const base = {block: dynamicBlock({options: {layout: 'grid', columns: [1, 2]}})};
    const source = {block: dynamicBlock({options: {layout: 'list', columns: [1, 2]}})};
    const target = {block: dynamicBlock({options: {layout: 'grid', columns: [1, 3]}})};
    const result = mergeBlockTranslations({base, source, target});

    assert.deepEqual(result.blocks.block.settings.attributes.options, {
        layout: 'grid',
        columns: [1, 3]
    });
    assert.deepEqual(result.conflicts, [
        {path: ['block', 'settings', 'attributes', 'options'], type: 'value'}
    ]);
}

{
    const base = {block: dynamicBlock({css: 'h1 { color: red; }', javascript: 'init();'})};
    const source = {block: dynamicBlock({javascript: 'init();'})};
    const target = {block: dynamicBlock({css: 'h1 { color: red; }', javascript: 'init();'})};
    const baseBeforeMerge = structuredClone(base);
    const sourceBeforeMerge = structuredClone(source);
    const targetBeforeMerge = structuredClone(target);
    const result = mergeBlockTranslations({base, source, target});

    assert.equal('css' in result.blocks.block.settings.attributes, false);
    assert.deepEqual(base, baseBeforeMerge);
    assert.deepEqual(source, sourceBeforeMerge);
    assert.deepEqual(target, targetBeforeMerge);
}

{
    const base = {block: dynamicBlock({css: 'h1 { color: red; }'})};
    const source = {block: dynamicBlock({})};
    const target = {block: dynamicBlock({css: 'h1 { color: blue; }'})};
    const result = mergeBlockTranslations({base, source, target});

    assert.equal(result.blocks.block.settings.attributes.css, 'h1 { color: blue; }');
    assert.deepEqual(result.conflicts, [
        {path: ['block', 'settings', 'attributes', 'css'], type: 'value'}
    ]);
}

{
    const base = {block: dynamicBlock({'style-identifier': 'IDSHARED00000001', html: 'Hallo'})};
    const source = {block: dynamicBlock({'style-identifier': 'IDSHARED00000002', html: 'Hallo'})};
    const target = {block: dynamicBlock({'style-identifier': 'IDTARGET00000001', html: 'Hello'})};
    const result = mergeBlockTranslations({base, source, target});

    assert.equal(
        result.blocks.block.settings.attributes['style-identifier'],
        'IDSHARED00000002'
    );
    assert.equal(result.blocks.block.settings.attributes.html, 'Hello');
}

{
    function synchronizeTestContainers(sourceHtml, targetHtml) {
        const sourceMatch = sourceHtml.match(/<!--blocks-->([\s\S]*?)<!--\/blocks-->/);
        if (! sourceMatch) {
            return targetHtml;
        }
        return targetHtml.replace(
            /<!--blocks-->[\s\S]*?<!--\/blocks-->/,
            `<!--blocks-->${sourceMatch[1]}<!--/blocks-->`
        );
    }

    let variants = {
        nl: {
            root: dynamicBlock({title: 'Hallo', effort: 'medium'}, {
                layout: htmlBlock('<h1>Nederlandse titel</h1><!--blocks-->[A]<!--/blocks-->')
            })
        },
        en: {
            root: dynamicBlock({title: 'Hello', effort: 'medium'}, {
                layout: htmlBlock('<h1>English title</h1><!--blocks-->[A]<!--/blocks-->')
            })
        }
    };
    let baselines = cloneTranslationData(variants);

    // NL is edited. The translated title remains English, while an unchanged
    // setting and the shared nested-block structure follow NL.
    variants.nl.root.settings.attributes.title = 'Hallo wereld';
    variants.nl.root.settings.attributes.effort = 'high';
    variants.nl.root.blocks.layout.html =
        '<h1>Nederlandse titel</h1><!--blocks-->[A][B]<!--/blocks-->';

    let firstMerge = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'nl',
        synchronizeContainerHtml: synchronizeTestContainers
    });
    assert.equal(firstMerge.variants.en.root.settings.attributes.title, 'Hello');
    assert.equal(firstMerge.variants.en.root.settings.attributes.effort, 'high');
    assert.equal(
        firstMerge.variants.en.root.blocks.layout.html,
        '<h1>English title</h1><!--blocks-->[A][B]<!--/blocks-->'
    );

    // Commit the successful checkpoint, add a block from EN and verify that it
    // is created in NL without sharing mutable object references.
    variants = firstMerge.variants;
    commitSourceBaseline(baselines, variants, 'nl');
    variants.en.addedInEnglish = dynamicBlock({text: 'First draft'});

    let secondMerge = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'en',
        synchronizeContainerHtml: synchronizeTestContainers
    });
    assert.equal(
        secondMerge.variants.nl.addedInEnglish.settings.attributes.text,
        'First draft'
    );
    assert.notEqual(
        secondMerge.variants.nl.addedInEnglish,
        secondMerge.variants.en.addedInEnglish
    );

    // After another checkpoint, a new EN change propagates because NL still
    // equals its last synchronized base.
    variants = secondMerge.variants;
    commitSourceBaseline(baselines, variants, 'en');
    variants.en.addedInEnglish.settings.attributes.text = 'Improved draft';

    let thirdMerge = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'en',
        synchronizeContainerHtml: synchronizeTestContainers
    });
    assert.equal(
        thirdMerge.variants.nl.addedInEnglish.settings.attributes.text,
        'Improved draft'
    );
}

{
    // Full lifecycle of a new value: it follows its originating language until
    // another language is genuinely edited, after which both versions diverge.
    let variants = {nl: {}, en: {}};
    let baselines = cloneTranslationData(variants);

    variants.nl.block = dynamicBlock({title: 'Hallo', effort: 'medium'});
    let firstDutchSave = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'nl'
    });
    variants = firstDutchSave.variants;
    commitSourceBaseline(baselines, variants, 'nl');
    assert.equal(variants.en.block.settings.attributes.title, 'Hallo');

    variants.nl.block.settings.attributes.title = 'Hallo wereld';
    variants.nl.block.settings.attributes.effort = 'high';
    let secondDutchSave = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'nl'
    });
    variants = secondDutchSave.variants;
    commitSourceBaseline(baselines, variants, 'nl');
    assert.equal(variants.en.block.settings.attributes.title, 'Hallo wereld');
    assert.equal(variants.en.block.settings.attributes.effort, 'high');

    variants.en.block.settings.attributes.title = 'Hello world';
    let firstEnglishSave = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'en'
    });
    variants = firstEnglishSave.variants;
    commitSourceBaseline(baselines, variants, 'en');
    assert.equal(variants.en.block.settings.attributes.title, 'Hello world');
    assert.equal(variants.nl.block.settings.attributes.title, 'Hallo wereld');

    variants.en.addedInEnglish = dynamicBlock({text: 'English draft'});
    let englishBlockSave = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'en'
    });
    variants = englishBlockSave.variants;
    commitSourceBaseline(baselines, variants, 'en');
    assert.equal(
        variants.nl.addedInEnglish.settings.attributes.text,
        'English draft'
    );

    variants.en.addedInEnglish.settings.attributes.text = 'Improved English draft';
    let englishBlockUpdate = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'en'
    });
    assert.equal(
        englishBlockUpdate.variants.nl.addedInEnglish.settings.attributes.text,
        'Improved English draft'
    );
}

{
    const variants = {
        nl: {block: dynamicBlock({text: 'Hallo'})},
        en: {block: dynamicBlock({text: 'Hello'})}
    };
    const result = synchronizePageTranslations({
        baselines: cloneTranslationData(variants),
        variants,
        sourceLanguage: 'missing'
    });

    assert.deepEqual(result.variants, variants);
    assert.notEqual(result.variants, variants);
    assert.deepEqual(result.conflicts, [{
        language: 'missing',
        path: [],
        type: 'missing-source-language'
    }]);
}

{
    const variants = {
        nl: {block: dynamicBlock({text: 'Hallo'}, {
            content: htmlBlock('<div phpb-blocks-container>[A]</div>')
        })},
        en: {block: dynamicBlock({text: 'Hello'}, {
            content: htmlBlock('<div phpb-blocks-container>[A]</div>')
        })}
    };
    const variantsBeforeMerge = structuredClone(variants);
    const result = synchronizePageTranslations({
        baselines: cloneTranslationData(variants),
        variants,
        sourceLanguage: 'nl',
        synchronizeContainerHtml: (sourceHtml) => sourceHtml
    });

    assert.deepEqual(variants, variantsBeforeMerge);
    assert.notEqual(result.variants, variants);
    assert.notEqual(result.variants.nl.block, variants.nl.block);
    assert.notEqual(result.variants.en.block, variants.en.block);
}

{
    const variants = {
        nl: {block: htmlBlock('<div phpb-blocks-container>[A][B]</div>')},
        en: {block: htmlBlock('<div phpb-blocks-container>[A][C]</div>')}
    };
    const baselines = {
        nl: {block: htmlBlock('<div phpb-blocks-container>[A]</div>')},
        en: {block: htmlBlock('<div phpb-blocks-container>[A]</div>')}
    };
    const result = synchronizePageTranslations({
        baselines,
        variants,
        sourceLanguage: 'nl',
        synchronizeContainerHtml: (sourceHtml, targetHtml) => ({
            html: targetHtml,
            conflict: true
        })
    });

    assert.equal(
        result.variants.en.block.html,
        '<div phpb-blocks-container>[A][C]</div>'
    );
    assert.deepEqual(result.conflicts, [
        {language: 'en', path: ['block', 'html'], type: 'value'},
        {language: 'en', path: ['block', 'html'], type: 'structure'}
    ]);
}

{
    // Exercise a production-sized flat page. This guards both the linear
    // traversal and the absence of recursion over the block collection.
    const blockCount = 5000;
    const base = {};
    const source = {};
    const target = {};
    for (let index = 0; index < blockCount; index++) {
        const blockId = `block-${index}`;
        base[blockId] = dynamicBlock({text: `Text ${index}`, effort: 'medium'});
        source[blockId] = dynamicBlock({text: `Updated text ${index}`, effort: 'high'});
        target[blockId] = dynamicBlock({text: `Translation ${index}`, effort: 'medium'});
    }

    const result = mergeBlockTranslations({base, source, target});
    assert.equal(Object.keys(result.blocks).length, blockCount);
    assert.equal(result.blocks['block-4999'].settings.attributes.text, 'Translation 4999');
    assert.equal(result.blocks['block-4999'].settings.attributes.effort, 'high');
    assert.equal(result.conflicts.length, blockCount);
}

console.log('Page translation synchronizer tests passed.');
