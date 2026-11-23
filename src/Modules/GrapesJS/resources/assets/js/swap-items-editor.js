// An opted-in dynamic block marks each position with data-phpb-swap-slot.
// Each slot contains one child block whose relative block ID identifies its content.
const editor = window.editor;
const command = 'phpb-swap-items';
const confirmCommand = 'phpb-swap-items-confirm';
const cancelCommand = 'phpb-swap-items-cancel';
let activeBlock = null;
let originalToolbar = null;
let controls = [];
let picked = null;
let hovered = null;

function getSlots(block) {
    const slots = [];
    function visit(parent) {
        parent.components().each(child => {
            if (child.get('block-slug')) return; // A nested block owns its own slots.
            if (child.getAttributes()['data-phpb-swap-slot'] === undefined) {
                visit(child);
                return;
            }
            const items = child.components().filter(item => item.get('block-id'));
            slots.push({container: child, item: items.length === 1 ? items[0] : null});
        });
    }
    visit(block);
    const ids = slots.map(slot => slot.item && slot.item.get('block-id'));
    return ids.every(Boolean) && new Set(ids).size === slots.length ? slots : [];
}

function getConfig(block) {
    const config = block && (window.blockEditors || {})[block.get('block-slug')];
    return config && config.type === 'swap-items' && block.getTrait(config.order_setting) ? config : null;
}

function decisionAction(command, icon, label) {
    const caption = document.createElement('span');
    caption.textContent = label;
    return {
        command,
        label: `<i class="fa ${icon} mr-1" aria-hidden="true"></i>${caption.outerHTML}`,
        attributes: {class: 'phpb-swap-decision w-auto text-nowrap font-weight-bold', title: label, 'aria-label': label}
    };
}

function updateToolbar(block) {
    if (block === activeBlock) return;
    const toolbar = block.get('toolbar') || [];
    const actions = toolbar.filter(action => ![command, confirmCommand, cancelCommand].includes(action.command));
    const config = getConfig(block);
    if (config && getSlots(block).length >= 2) {
        const label = config.label || window.translations['swap-items'];
        actions.unshift({
            command,
            attributes: {class: 'fa fa-exchange', title: label, 'aria-label': label}
        });
    } else if (toolbar.length === actions.length) {
        return;
    }
    block.set('toolbar', actions, {avoidStore: true});
}

function finishSwap(confirm) {
    const block = activeBlock;
    if (!block) return;
    const element = block.getEl();
    const changed = controls.some(control => control.item !== control.initialItem);
    if (changed && element && element.isConnected) {
        if (confirm) {
            const order = controls.map(control => control.item.get('block-id'));
            // The preview already reflects the setting. Commit it once, without an Ajax rerender.
            block.attributes['is-updating'] = true;
            try {
                block.getTrait(getConfig(block).order_setting).setTargetValue(JSON.stringify(order));
            } finally {
                block.attributes['is-updating'] = false;
            }
        } else {
            placeItems(controls, controls.map(control => control.initialItem));
        }
    }
    document.removeEventListener('keydown', cancelOnEscape, true);
    controls[0].button.ownerDocument.removeEventListener('keydown', cancelOnEscape, true);
    controls.forEach(({button}) => {
        if (button.parentElement) button.parentElement.classList.remove('phpb-swap-slot-active');
        button.remove();
    });
    controls = [];
    picked = hovered = null;
    activeBlock = null;
    if ((block.get('toolbar') || []).some(action => action.command === cancelCommand)) {
        block.set('toolbar', originalToolbar, {avoidStore: true});
    }
    originalToolbar = null;
    if (editor.getSelected() === block) editor.trigger('component:toggled', block);
}

function cancelOnEscape(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    finishSwap(false);
}

function choose(control) {
    if (picked && picked !== control) {
        swap(picked, control);
        return;
    }
    picked = picked ? null : control;
    control.button.setAttribute('aria-pressed', String(!!picked));
}

function swap(first, second) {
    if (!activeBlock || activeBlock.getEl().closest('.gjs-freezed, .gjs-waiting')) return;
    placeItems([first, second], [second.item, first.item]);
    if (picked) picked.button.setAttribute('aria-pressed', 'false');
    picked = null;
}

// Move the existing models, including their nested content. A rollback can
// restore a whole permutation by detaching the affected items before placing them.
function placeItems(slots, items) {
    const moves = [];
    slots.forEach((slot, index) => {
        if (slot.item === items[index]) return;
        const collection = slot.container.components();
        moves.push({slot, collection, at: collection.indexOf(slot.item), item: items[index]});
    });
    if (moves.some(move => move.at < 0)) return;
    const options = {temporary: true, avoidStore: true};
    moves.forEach(({collection, slot}) => collection.remove(slot.item, options));
    moves.forEach(({collection, slot, item, at}) => {
        collection.add(item, {...options, at});
        slot.item = item;
    });
    moves.forEach(({item}) => window.runScriptsOfComponentAndChildren(item));
}

function controlAtPointer(event) {
    const target = event.currentTarget.ownerDocument.elementFromPoint(event.clientX, event.clientY);
    return controls.find(control => control.button === target);
}

function highlight(control) {
    if (hovered === control) return;
    if (hovered) hovered.button.classList.remove('phpb-swap-over');
    if (control) control.button.classList.add('phpb-swap-over');
    hovered = control;
}

function addControl(slot, index) {
    const el = slot.container.getEl();
    const button = el.ownerDocument.createElement('button');
    const control = {...slot, button, initialItem: slot.item};
    button.type = 'button';
    button.className = 'phpb-swap-target';
    button.title = window.translations['swap-items-hint'];
    button.setAttribute('aria-label', (index + 1) + '. ' + button.title);
    button.setAttribute('aria-pressed', 'false');
    el.classList.add('phpb-swap-slot-active');
    el.appendChild(button);

    // Let the button receive gestures without selecting or dragging underlying blocks.
    ['mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick'].forEach(type => {
        button.addEventListener(type, event => event.stopPropagation());
    });
    // Native drag events enter the canvas-wide GrapesJS block sorter. Capture
    // this gesture on the button and hit-test the visible destination instead.
    button.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove', event => {
        if (button.hasPointerCapture(event.pointerId)) highlight(controlAtPointer(event));
    });
    button.addEventListener('lostpointercapture', () => highlight(null));
    button.addEventListener('pointerup', event => {
        if (!button.hasPointerCapture(event.pointerId)) return;
        event.stopPropagation();
        const target = controlAtPointer(event);
        if (target === control) choose(control);
        else if (target) swap(control, target);
    });
    button.addEventListener('click', event => {
        event.stopPropagation();
        if (event.detail === 0) choose(control); // Keyboard or assistive technology.
    });
    return control;
}

editor.Commands.add(command, {
    run() {
        const block = editor.getSelected();
        if (activeBlock || !getConfig(block)) return;
        const slots = getSlots(block);
        if (slots.length < 2) return;
        activeBlock = block;
        originalToolbar = block.get('toolbar');
        controls = slots.map(addControl);
        block.set('toolbar', [
            decisionAction(confirmCommand, 'fa-check', window.translations['swap-items-done']),
            decisionAction(cancelCommand, 'fa-times', window.translations['swap-items-cancel'])
        ], {avoidStore: true});
        document.addEventListener('keydown', cancelOnEscape, true);
        block.getEl().ownerDocument.addEventListener('keydown', cancelOnEscape, true);
        editor.trigger('component:toggled', block);
    }
});
editor.Commands.add(confirmCommand, {run: () => finishSwap(true)});
editor.Commands.add(cancelCommand, {run: () => finishSwap(false)});

editor.on('component:selected', updateToolbar);
editor.on('component:deselected', block => {
    if (activeBlock === block) finishSwap(false);
    const toolbar = block.get('toolbar') || [];
    if (toolbar.some(action => action.command === command)) {
        block.set('toolbar', toolbar.filter(action => action.command !== command), {avoidStore: true});
    }
});
