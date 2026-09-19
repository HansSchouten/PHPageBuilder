const GENERATED_IDENTIFIER = /^ID[A-Z0-9]{14,}$/i;
const CODE_FIELDS = new Set(['css', 'style', 'styles', 'javascript', 'js', 'script']);

/**
 * Prepare clean storage data from cloned page-content components.
 *
 * This helper deliberately does not accept or rewrite serialized HTML. Callers
 * must pass clones: editor-only attributes and unused generated classes are
 * removed directly from those models before the caller serializes them.
 *
 * Complexity is linear in the number of components, style rules, additional
 * data fields and characters in authored code. No DOM parsing or recursive
 * calls are used.
 */
export function optimizePageStorage({
    contentRoots = [],
    styleComponents = [],
    additionalCode = []
} = {}) {
    let references = {
        classes: new Set(),
        ids: new Set()
    };
    let generatedCandidates = [];
    let authoredCode = [];

    toArray(contentRoots).forEach(function(root) {
        collectComponentTree(root, references, generatedCandidates, authoredCode);
    });
    collectAdditionalCode(additionalCode, authoredCode);

    let styles = toArray(styleComponents).filter(function(styleComponent) {
        return isPageStyle(styleComponent, references);
    });
    let css = styles.map(styleToCss).join('');

    let usedGeneratedIdentifiers = new Set();
    collectGeneratedIdentifiers(css, usedGeneratedIdentifiers);
    authoredCode.forEach(function(code) {
        collectGeneratedIdentifiers(code, usedGeneratedIdentifiers);
    });

    removeUnusedGeneratedIdentifiers(generatedCandidates, usedGeneratedIdentifiers);

    return {
        style: styles,
        css: css,
        usedGeneratedIdentifiers: usedGeneratedIdentifiers
    };
}

/**
 * Collect authored CSS and JavaScript from optional block data without
 * interpreting or changing any of it. Direct strings are supported for small
 * callers; nested objects are walked iteratively to remain safe for deeply
 * nested block structures.
 */
function collectAdditionalCode(value, authoredCode) {
    let pending = [{value: value, key: null, direct: true}];
    let visited = new WeakSet();

    while (pending.length) {
        let current = pending.pop();
        let currentValue = current.value;

        if (typeof currentValue === 'string' || typeof currentValue === 'function') {
            if (current.direct || (current.key && CODE_FIELDS.has(current.key.toLowerCase()))) {
                authoredCode.push(String(currentValue));
            }
            continue;
        }
        if (! currentValue || typeof currentValue !== 'object' || visited.has(currentValue)) {
            continue;
        }
        visited.add(currentValue);

        if (Array.isArray(currentValue)) {
            for (let index = currentValue.length - 1; index >= 0; index--) {
                pending.push({value: currentValue[index], key: current.key, direct: current.direct});
            }
            continue;
        }

        Object.keys(currentValue).forEach(function(key) {
            pending.push({value: currentValue[key], key: key, direct: false});
        });
    }
}

/**
 * Walk a GrapesJS component tree iteratively, so deeply nested page content
 * cannot exhaust the JavaScript call stack.
 */
function collectComponentTree(root, references, generatedCandidates, authoredCode) {
    let pending = root ? [root] : [];

    while (pending.length) {
        let component = pending.pop();
        if (! component || typeof component.get !== 'function') {
            continue;
        }

        removeRawContentMarker(component);
        collectComponentSelectors(component, references, generatedCandidates);
        collectComponentCode(component, authoredCode);

        let children = component.get('components');
        let childModels = children && Array.isArray(children.models) ? children.models : [];
        for (let index = childModels.length - 1; index >= 0; index--) {
            pending.push(childModels[index]);
        }
    }
}

function removeRawContentMarker(component) {
    let attributes = component.get('attributes') || {};
    if (Object.prototype.hasOwnProperty.call(attributes, 'data-raw-content')) {
        let updatedAttributes = Object.assign({}, attributes);
        delete updatedAttributes['data-raw-content'];
        component.set('attributes', updatedAttributes);
    }

    // Support components that stored the editor marker as a model property.
    if (component.get('data-raw-content') !== undefined && typeof component.unset === 'function') {
        component.unset('data-raw-content');
    }
}

function collectComponentSelectors(component, references, generatedCandidates) {
    let attributes = typeof component.getAttributes === 'function'
        ? component.getAttributes()
        : component.get('attributes') || {};
    let id = attributes.id;
    if (! id && typeof component.getId === 'function') {
        id = component.getId();
    }
    if (typeof id === 'string' && id) {
        references.ids.add(id);
    }

    let classes = typeof component.getClasses === 'function' ? component.getClasses() : [];
    classes.forEach(function(className) {
        if (typeof className !== 'string' || ! className) {
            return;
        }
        references.classes.add(className);
        if (GENERATED_IDENTIFIER.test(className)) {
            generatedCandidates.push({component: component, identifier: className, type: 'class'});
        }
    });

    let styleIdentifier = component.get('style-identifier');
    if (typeof styleIdentifier === 'string' && styleIdentifier) {
        references.classes.add(styleIdentifier);
        if (GENERATED_IDENTIFIER.test(styleIdentifier)) {
            generatedCandidates.push({component: component, identifier: styleIdentifier, type: 'style-identifier'});
        }
    }
}

function collectComponentCode(component, authoredCode) {
    let script = component.get('script');
    if (typeof script === 'string' || typeof script === 'function') {
        authoredCode.push(String(script));
    }

    let attributes = component.get('attributes') || {};
    Object.keys(attributes).forEach(function(name) {
        if (CODE_FIELDS.has(name.toLowerCase()) && typeof attributes[name] === 'string') {
            authoredCode.push(attributes[name]);
        }
    });

    let traits = component.get('traits');
    if (! traits || typeof traits.each !== 'function') {
        return;
    }
    traits.each(function(trait) {
        let name = String(trait.get('name') || '').toLowerCase();
        if (! CODE_FIELDS.has(name)) {
            return;
        }
        let value = typeof trait.getTargetValue === 'function'
            ? trait.getTargetValue()
            : trait.get('value');
        if (typeof value === 'string' || typeof value === 'function') {
            authoredCode.push(String(value));
        }
    });
}

function isPageStyle(styleComponent, references) {
    if (! styleComponent || typeof styleComponent.get !== 'function') {
        return false;
    }
    let style = styleComponent.get('style') || {};
    if (Object.keys(style).length === 0) {
        return false;
    }

    let selectors = styleComponent.get('selectors');
    let selectorModels = selectors && Array.isArray(selectors.models) ? selectors.models : [];
    return selectorModels.some(function(selector) {
        if (! selector || typeof selector.get !== 'function') {
            return false;
        }
        let name = selector.get('name');
        let type = selector.get('type');
        return (type === 1 && references.classes.has(name))
            || (type === 2 && references.ids.has(name));
    });
}

function styleToCss(styleComponent) {
    if (typeof styleComponent.toCSS !== 'function') {
        return '';
    }
    return styleComponent.toCSS({important: styleComponent.get('important')});
}

function collectGeneratedIdentifiers(code, identifiers) {
    if (! code) {
        return;
    }
    let pattern = /(^|[^A-Za-z0-9_-])(ID[A-Z0-9]{14,})(?=$|[^A-Za-z0-9_-])/gi;
    let match;
    while ((match = pattern.exec(code)) !== null) {
        identifiers.add(match[2].toUpperCase());
    }
}

function removeUnusedGeneratedIdentifiers(candidates, usedIdentifiers) {
    candidates.forEach(function(candidate) {
        if (usedIdentifiers.has(candidate.identifier.toUpperCase())) {
            return;
        }
        if (candidate.type === 'class' && typeof candidate.component.removeClass === 'function') {
            candidate.component.removeClass(candidate.identifier);
        }
        if (candidate.type === 'style-identifier' && typeof candidate.component.unset === 'function') {
            candidate.component.unset('style-identifier');
        }
    });
}

function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value && Array.isArray(value.models)) {
        return value.models;
    }
    if (value && typeof value.toArray === 'function') {
        return value.toArray();
    }
    return value ? [value] : [];
}
