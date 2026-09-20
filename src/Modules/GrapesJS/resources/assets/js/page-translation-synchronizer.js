const STRUCTURAL_ATTRIBUTES = new Set(['style-identifier']);
const GENERATED_STYLE_IDENTIFIER = /^ID[A-Z0-9]{14,}$/i;
const GENERATED_STYLE_IDENTIFIER_REFERENCE = /ID[A-Z0-9]{14,}/i;

/**
 * Keep the merge state and block-setting rules out of the page save workflow.
 * The caller only has to register freshly serialized blocks, request a
 * synchronization and commit an accepted source-language checkpoint.
 */
export function createPageTranslationSynchronizer({
    initialVariants = {},
    blockSettings = {},
    synchronizeContainerHtml = synchronizeBlockContainerHtml,
    synchronizeStyleHtml = synchronizeGeneratedStyleClassesInHtml
} = {}) {
    let baselines = cloneTranslationData(initialVariants);
    let settingPolicies = buildSettingSynchronizationPolicies(blockSettings);
    let serializedBlockSlugs = new WeakMap();

    function shouldAlwaysSynchronizeAttribute(sourceBlock, attributeName) {
        let blockSlug = serializedBlockSlugs.get(sourceBlock);
        return blockSlug !== undefined
            && settingPolicies[blockSlug] !== undefined
            && settingPolicies[blockSlug][attributeName] === true;
    }

    return {
        registerSerializedBlock: function(blockData, blockSlug) {
            if (blockData && typeof blockData === 'object') {
                serializedBlockSlugs.set(blockData, blockSlug);
            }
        },

        synchronize: function(variants, sourceLanguage) {
            return synchronizePageTranslations({
                baselines: baselines,
                variants: variants,
                sourceLanguage: sourceLanguage,
                synchronizeContainerHtml: synchronizeContainerHtml,
                synchronizeStyleHtml: synchronizeStyleHtml,
                shouldAlwaysSynchronizeAttribute: shouldAlwaysSynchronizeAttribute
            });
        },

        commitBaseline: function(sourceLanguage, sourceVariant) {
            if (sourceLanguage) {
                baselines[sourceLanguage] = cloneTranslationData(sourceVariant);
            }
        }
    };
}

/**
 * Merge every target language from the language currently being edited.
 *
 * The previous authored snapshot of the source language is the common base.
 * This makes synchronization symmetric: whichever language is being edited
 * can be the source, while values already changed in another language remain
 * untouched.
 */
export function synchronizePageTranslations({
    baselines = {},
    variants = {},
    sourceLanguage,
    synchronizeContainerHtml = null,
    synchronizeStyleHtml = null,
    shouldAlwaysSynchronizeAttribute = null
} = {}) {
    if (! sourceLanguage || ! hasOwn(variants, sourceLanguage)) {
        return {
            variants: cloneValue(variants),
            conflicts: [{
                language: sourceLanguage || null,
                path: [],
                type: 'missing-source-language'
            }]
        };
    }

    let source = asBlockMap(variants[sourceLanguage]);
    let base = asBlockMap(baselines[sourceLanguage]);
    let mergedVariants = {};
    let conflicts = [];

    Object.keys(variants).forEach(function(language) {
        if (language === sourceLanguage) {
            mergedVariants[language] = cloneValue(source);
            return;
        }

        let merged = mergeBlockTranslations({
            base: base,
            source: source,
            target: asBlockMap(variants[language]),
            shouldAlwaysSynchronizeAttribute: shouldAlwaysSynchronizeAttribute
        });
        let languageConflicts = merged.conflicts;

        synchronizeBlockStructure(
            source,
            merged.blocks,
            synchronizeContainerHtml,
            synchronizeStyleHtml,
            languageConflicts
        );

        mergedVariants[language] = merged.blocks;
        languageConflicts.forEach(function(conflict) {
            conflicts.push({
                language: language,
                path: conflict.path,
                type: conflict.type
            });
        });
    });

    if (! Object.prototype.hasOwnProperty.call(mergedVariants, sourceLanguage)) {
        mergedVariants[sourceLanguage] = cloneValue(source);
    }

    return {
        variants: mergedVariants,
        conflicts: conflicts
    };
}

/**
 * Merge one source/target language pair. Block membership and nesting are
 * structural and therefore follow the source. Values inside matching blocks
 * use a conservative three-way merge.
 */
export function mergeBlockTranslations({
    base = {},
    source = {},
    target = {},
    shouldAlwaysSynchronizeAttribute = null
} = {}) {
    let conflicts = [];
    let blocks = mergeBlockMap(
        base,
        source,
        target,
        [],
        conflicts,
        false,
        shouldAlwaysSynchronizeAttribute
    );

    return {
        blocks: blocks,
        conflicts: conflicts
    };
}

/**
 * Create a detached snapshot suitable for a future merge base.
 */
export function cloneTranslationData(value) {
    return cloneValue(value);
}

/**
 * Compile sidebar setting metadata into a constant-time lookup table.
 * Free-text settings use three-way merging by default; every other editor
 * type follows the active language unless the block config explicitly opts
 * out with always_sync_across_languages=false.
 */
export function buildSettingSynchronizationPolicies(blockSettings = {}) {
    let policies = {};

    Object.keys(blockSettings || {}).forEach(function(blockSlug) {
        let settings = Array.isArray(blockSettings[blockSlug]) ? blockSettings[blockSlug] : [];
        let blockPolicies = {};

        settings.forEach(function(setting) {
            if (! setting || typeof setting.name !== 'string') {
                return;
            }

            blockPolicies[setting.name] = typeof setting.always_sync_across_languages === 'boolean'
                ? setting.always_sync_across_languages
                : setting.type !== 'text';
        });
        policies[blockSlug] = blockPolicies;
    });

    return policies;
}

function mergeBlockMap(
    base,
    source,
    target,
    path,
    conflicts,
    preserveEmptyArray = true,
    shouldAlwaysSynchronizeAttribute = null
) {
    let baseMap = asBlockMap(base);
    let sourceMap = asBlockMap(source);
    let targetMap = asBlockMap(target);
    let result = {};

    // The source defines the shared structure. Target-only blocks represent a
    // deletion in the source and are intentionally omitted.
    Object.keys(sourceMap).forEach(function(blockId) {
        let blockPath = path.concat(blockId);
        let baseState = propertyState(baseMap, blockId);
        let sourceState = propertyState(sourceMap, blockId);
        let targetState = propertyState(targetMap, blockId);

        if (! targetState.exists) {
            copyState(result, blockId, sourceState);
            return;
        }

        if (isPlainObject(sourceState.value) && isPlainObject(targetState.value)) {
            result[blockId] = mergeBlock(
                baseState.exists && isPlainObject(baseState.value) ? baseState.value : {},
                sourceState.value,
                targetState.value,
                blockPath,
                conflicts,
                shouldAlwaysSynchronizeAttribute
            );
            return;
        }

        copyState(result, blockId, resolveAtomicState(
            baseState,
            sourceState,
            targetState,
            blockPath,
            conflicts,
            'block'
        ));
    });

    if (preserveEmptyArray && Object.keys(result).length === 0 && Array.isArray(source)) {
        return [];
    }
    return result;
}

function mergeBlock(base, source, target, path, conflicts, shouldAlwaysSynchronizeAttribute) {
    let result = {};
    let reservedKeys = new Set(['settings', 'blocks', 'html', 'is_html']);
    let keys = new Set([
        ...Object.keys(base),
        ...Object.keys(source),
        ...Object.keys(target)
    ]);

    keys.forEach(function(key) {
        if (! reservedKeys.has(key)) {
            applyAtomicProperty(result, key, base, source, target, path.concat(key), conflicts);
        }
    });

    // Block type, membership and nesting are shared page structure.
    copyState(result, 'is_html', propertyState(source, 'is_html'));

    let settingsState = mergeSettings(
        propertyState(base, 'settings'),
        propertyState(source, 'settings'),
        propertyState(target, 'settings'),
        path.concat('settings'),
        conflicts,
        source,
        shouldAlwaysSynchronizeAttribute
    );
    copyState(result, 'settings', settingsState);

    if (hasOwn(source, 'blocks')) {
        result.blocks = mergeBlockMap(
            base.blocks,
            source.blocks,
            target.blocks,
            path.concat('blocks'),
            conflicts,
            true,
            shouldAlwaysSynchronizeAttribute
        );
    }

    // Authored HTML is language-dependent. Dynamic block HTML is merely a
    // rendered pagebuilder cache and remains local to the target language.
    if (source.is_html === true) {
        applyAtomicProperty(result, 'html', base, source, target, path.concat('html'), conflicts);
    } else if (hasOwn(target, 'html')) {
        result.html = cloneValue(target.html);
    } else if (hasOwn(source, 'html')) {
        result.html = cloneValue(source.html);
    }

    return result;
}

function mergeSettings(
    baseState,
    sourceState,
    targetState,
    path,
    conflicts,
    sourceBlock,
    shouldAlwaysSynchronizeAttribute
) {
    if (! sourceState.exists || ! targetState.exists
        || ! isPlainObject(sourceState.value) || ! isPlainObject(targetState.value)
    ) {
        return resolveAtomicState(baseState, sourceState, targetState, path, conflicts, 'settings');
    }

    let base = baseState.exists && isPlainObject(baseState.value) ? baseState.value : {};
    let source = sourceState.value;
    let target = targetState.value;
    let result = {};
    let keys = new Set([
        ...Object.keys(base),
        ...Object.keys(source),
        ...Object.keys(target)
    ]);

    keys.forEach(function(key) {
        if (key === 'attributes') {
            if (hasOwn(source, key)) {
                result.attributes = mergeAtomicMap(
                    base.attributes,
                    source.attributes,
                    target.attributes,
                    path.concat('attributes'),
                    conflicts,
                    sourceBlock,
                    shouldAlwaysSynchronizeAttribute
                );
            }
            return;
        }
        applyAtomicProperty(result, key, base, source, target, path.concat(key), conflicts);
    });

    return {exists: true, value: result};
}

/**
 * Settings are atomic merge units, even when a setting contains an array or
 * object. Internal structural attributes are the only exception and always
 * follow the source language.
 */
function mergeAtomicMap(
    base,
    source,
    target,
    path,
    conflicts,
    sourceBlock,
    shouldAlwaysSynchronizeAttribute
) {
    let baseMap = isPlainObject(base) ? base : {};
    let sourceMap = isPlainObject(source) ? source : {};
    let targetMap = isPlainObject(target) ? target : {};
    let result = {};
    let keys = new Set([
        ...Object.keys(baseMap),
        ...Object.keys(sourceMap),
        ...Object.keys(targetMap)
    ]);

    keys.forEach(function(key) {
        let alwaysSynchronize = typeof shouldAlwaysSynchronizeAttribute === 'function'
            && shouldAlwaysSynchronizeAttribute(sourceBlock, key, path.concat(key)) === true;

        if (STRUCTURAL_ATTRIBUTES.has(key) || alwaysSynchronize) {
            copyState(result, key, propertyState(sourceMap, key));
            return;
        }
        applyAtomicProperty(result, key, baseMap, sourceMap, targetMap, path.concat(key), conflicts);
    });
    return result;
}

/**
 * Synchronize only the contents of phpb-blocks-container elements. A template
 * parses arbitrary HTML without executing scripts. Text, attributes, CSS and
 * JavaScript outside these containers remain the target translation's version.
 */
function synchronizeBlockContainerHtml(sourceHtml, targetHtml) {
    if (sourceHtml.indexOf('phpb-blocks-container') === -1) {
        return targetHtml;
    }

    let sourceTemplate = document.createElement('template');
    let targetTemplate = document.createElement('template');
    sourceTemplate.innerHTML = sourceHtml;
    targetTemplate.innerHTML = targetHtml;

    let sourceContainers = sourceTemplate.content.querySelectorAll('[phpb-blocks-container]');
    if (sourceContainers.length === 0) {
        return targetHtml;
    }

    let targetContainers = targetTemplate.content.querySelectorAll('[phpb-blocks-container]');
    if (sourceContainers.length !== targetContainers.length) {
        return {html: targetHtml, conflict: true};
    }

    sourceContainers.forEach(function(sourceContainer, index) {
        targetContainers[index].innerHTML = sourceContainer.innerHTML;
    });
    return targetTemplate.innerHTML;
}

/**
 * Synchronize only generated GrapesJS selector classes. Authored classes and
 * translated element contents remain untouched. Parsing through a template
 * keeps script/style contents inert while the browser handles HTML syntax.
 */
function synchronizeGeneratedStyleClassesInHtml(sourceHtml, targetHtml) {
    if (! GENERATED_STYLE_IDENTIFIER_REFERENCE.test(sourceHtml)
        && ! GENERATED_STYLE_IDENTIFIER_REFERENCE.test(targetHtml)
    ) {
        return targetHtml;
    }

    let sourceTemplate = document.createElement('template');
    let targetTemplate = document.createElement('template');
    sourceTemplate.innerHTML = sourceHtml;
    targetTemplate.innerHTML = targetHtml;

    let synchronized = synchronizeGeneratedStyleClassTrees(
        sourceTemplate.content,
        targetTemplate.content
    );
    let html = synchronized.changed ? targetTemplate.innerHTML : targetHtml;

    return synchronized.conflict ? {html: html, conflict: true} : html;
}

/**
 * Match element trees conservatively by sibling position and tag name. A
 * class on a matching parent can still be synchronized when its descendants
 * differ, but ambiguous descendant branches are left unchanged.
 */
export function synchronizeGeneratedStyleClassTrees(sourceRoot, targetRoot) {
    let changed = false;
    let conflict = false;
    let pending = [{source: sourceRoot, target: targetRoot}];

    while (pending.length) {
        let current = pending.pop();
        let sourceChildren = elementChildren(current.source);
        let targetChildren = elementChildren(current.target);

        if (sourceChildren.length !== targetChildren.length) {
            conflict = true;
            continue;
        }

        for (let index = 0; index < sourceChildren.length; index++) {
            let sourceElement = sourceChildren[index];
            let targetElement = targetChildren[index];

            if (elementName(sourceElement) !== elementName(targetElement)) {
                conflict = true;
                continue;
            }

            if (synchronizeGeneratedStyleClassList(sourceElement, targetElement)) {
                changed = true;
            }

            let sourceGrandchildren = elementChildren(sourceElement);
            let targetGrandchildren = elementChildren(targetElement);
            if (sourceGrandchildren.length !== targetGrandchildren.length) {
                conflict = true;
                continue;
            }

            pending.push({source: sourceElement, target: targetElement});
        }
    }

    return {changed: changed, conflict: conflict};
}

function synchronizeGeneratedStyleClassList(sourceElement, targetElement) {
    let sourceClasses = classNames(sourceElement);
    let targetClasses = classNames(targetElement);
    let generatedSourceClasses = sourceClasses.filter(isGeneratedStyleIdentifier);
    let authoredTargetClasses = targetClasses.filter(function(className) {
        return ! isGeneratedStyleIdentifier(className);
    });
    let synchronizedClasses = authoredTargetClasses.slice();

    generatedSourceClasses.forEach(function(className) {
        if (synchronizedClasses.indexOf(className) === -1) {
            synchronizedClasses.push(className);
        }
    });

    if (arraysEqual(targetClasses, synchronizedClasses)) {
        return false;
    }

    if (synchronizedClasses.length) {
        targetElement.setAttribute('class', synchronizedClasses.join(' '));
    } else {
        targetElement.removeAttribute('class');
    }
    return true;
}

function elementChildren(element) {
    if (! element || ! element.children) {
        return [];
    }
    return Array.prototype.slice.call(element.children);
}

function elementName(element) {
    return String(element.localName || element.tagName || '').toLowerCase();
}

function classNames(element) {
    let classAttribute = element && typeof element.getAttribute === 'function'
        ? element.getAttribute('class')
        : null;
    return typeof classAttribute === 'string' && classAttribute.trim() !== ''
        ? classAttribute.trim().split(/\s+/)
        : [];
}

function isGeneratedStyleIdentifier(className) {
    return GENERATED_STYLE_IDENTIFIER.test(className);
}

function arraysEqual(left, right) {
    return left.length === right.length && left.every(function(value, index) {
        return value === right[index];
    });
}

/**
 * Copy the contents of each block container from source HTML into the matching
 * translated HTML. Only the caller-supplied HTML function knows about DOM
 * syntax; this data helper never parses or rewrites authored code itself.
 */
function synchronizeBlockStructure(
    source,
    target,
    synchronizeContainerHtml,
    synchronizeStyleHtml,
    conflicts
) {
    if (typeof synchronizeContainerHtml !== 'function'
        && typeof synchronizeStyleHtml !== 'function'
    ) {
        return;
    }

    let pending = [{source: asBlockMap(source), target: asBlockMap(target), path: []}];
    while (pending.length) {
        let current = pending.pop();

        Object.keys(current.source).forEach(function(blockId) {
            let sourceBlock = current.source[blockId];
            let targetBlock = current.target[blockId];
            if (! isPlainObject(sourceBlock) || ! isPlainObject(targetBlock)) {
                return;
            }

            let blockPath = current.path.concat(blockId);
            if (sourceBlock.is_html === true
                && typeof sourceBlock.html === 'string'
                && typeof targetBlock.html === 'string'
            ) {
                let structureConflict = false;
                let htmlPath = blockPath.concat('html');
                let synchronizers = [synchronizeContainerHtml, synchronizeStyleHtml];

                synchronizers.forEach(function(synchronizer) {
                    if (typeof synchronizer !== 'function') {
                        return;
                    }
                    let synchronized = synchronizer(
                        sourceBlock.html,
                        targetBlock.html,
                        htmlPath
                    );
                    if (typeof synchronized === 'string') {
                        targetBlock.html = synchronized;
                    } else if (synchronized && typeof synchronized.html === 'string') {
                        targetBlock.html = synchronized.html;
                        structureConflict = structureConflict || synchronized.conflict === true;
                    }
                });

                if (structureConflict) {
                    recordConflict(conflicts, htmlPath, 'structure');
                }
            }

            pending.push({
                source: asBlockMap(sourceBlock.blocks),
                target: asBlockMap(targetBlock.blocks),
                path: blockPath.concat('blocks')
            });
        });
    }
}

function applyAtomicProperty(result, key, base, source, target, path, conflicts) {
    copyState(result, key, resolveAtomicState(
        propertyState(base, key),
        propertyState(source, key),
        propertyState(target, key),
        path,
        conflicts,
        'value'
    ));
}

function resolveAtomicState(base, source, target, path, conflicts, type) {
    if (statesEqual(source, base)) {
        return cloneState(target);
    }
    if (statesEqual(target, base)) {
        return cloneState(source);
    }
    if (statesEqual(source, target)) {
        return cloneState(source);
    }

    recordConflict(conflicts, path, type);
    return cloneState(target);
}

function propertyState(value, key) {
    return value && typeof value === 'object' && hasOwn(value, key)
        ? {exists: true, value: value[key]}
        : {exists: false, value: undefined};
}

function copyState(target, key, state) {
    if (state.exists) {
        target[key] = cloneValue(state.value);
    }
}

function cloneState(state) {
    return state.exists
        ? {exists: true, value: cloneValue(state.value)}
        : {exists: false, value: undefined};
}

function statesEqual(left, right) {
    return left.exists === right.exists
        && (! left.exists || valuesEqual(left.value, right.value));
}

function valuesEqual(left, right) {
    if (left === right) {
        return true;
    }
    if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
        return false;
    }
    if (Array.isArray(left) !== Array.isArray(right)) {
        return false;
    }

    let pending = [[left, right]];
    while (pending.length) {
        let pair = pending.pop();
        let leftValue = pair[0];
        let rightValue = pair[1];

        if (leftValue === rightValue) {
            continue;
        }
        if (leftValue === null || rightValue === null
            || typeof leftValue !== 'object' || typeof rightValue !== 'object'
            || Array.isArray(leftValue) !== Array.isArray(rightValue)
        ) {
            return false;
        }

        let leftKeys = Object.keys(leftValue);
        let rightKeys = Object.keys(rightValue);
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }
        for (let index = 0; index < leftKeys.length; index++) {
            let key = leftKeys[index];
            if (! hasOwn(rightValue, key)) {
                return false;
            }
            pending.push([leftValue[key], rightValue[key]]);
        }
    }
    return true;
}

function cloneValue(value) {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(cloneValue);
    }

    let clone = {};
    Object.keys(value).forEach(function(key) {
        clone[key] = cloneValue(value[key]);
    });
    return clone;
}

function asBlockMap(value) {
    return value && typeof value === 'object' ? value : {};
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && ! Array.isArray(value);
}

function hasOwn(value, key) {
    return value !== null
        && typeof value === 'object'
        && Object.prototype.hasOwnProperty.call(value, key);
}

function recordConflict(conflicts, path, type) {
    conflicts.push({path: path.slice(), type: type});
}
