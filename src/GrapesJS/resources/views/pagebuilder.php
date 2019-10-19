<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PageBuilder</title>

    <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?= phpb_asset('pagebuilder/app.css') ?>">

    <script src="https://unpkg.com/grapesjs"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js"></script>
</head>

<body>

<div id="gjs">
</div>

<script type="text/javascript">
    var editor = grapesjs.init({
        container : '#gjs',
        noticeOnUnload: false,
        storageManager: {
            autoload: false,
            autosave: false
        },
        styleManager: {
            textNoElement: '<?= phpb_trans('pagebuilder.style-no-element-selected') ?>'
        },
        traitManager: {
            textNoElement: '<?= phpb_trans('pagebuilder.trait-no-element-selected') ?>'
        },
        fromElement: true,
        canvas: {
            styles: [
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            ],
            scripts: [
                'https://code.jquery.com/jquery-3.3.1.slim.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
                'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js'
            ],
        }
    });

    // styling for elements of the page that is build
    editor.addComponents(`
<style>
</style>
		`);

    var domc = editor.DomComponents;

    var defaultType = domc.getType('default');
    var defaultModel = defaultType.model;
    var defaultView = defaultType.view;

    var textType = domc.getType('text');
    var textModel = textType.model;
    var textView = textType.view;

    var imageType = domc.getType('image');
    var imageModel = imageType.model;
    var imageView = imageType.view;

    var originalText = domc.getType('text');
    domc.addType('text', {
        model: originalText.model.extend({
            defaults: Object.assign({}, originalText.defaults, {
                'custom-name': 'Paragraaf',
            })
        }, {
            isComponent(el) {
            }
        }),
        view: originalText.view
    });

    domc.addType('paragraph', {
        model: textModel.extend({
            defaults: Object.assign({}, textModel.prototype.defaults, {
                'custom-name': 'Paragraaf',
                tagName: 'p',
                traits: [
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'No'},
                            {value: 'lead', name: 'Yes'}
                        ],
                        label: 'Lead?'
                    }
                ].concat(textModel.prototype.defaults.traits)
            })
        }, {
            isComponent(el) {
                if(el && el.tagName && el.tagName === 'P') {
                    return {type: 'paragraph'};
                }
            }
        }),
        view: textView
    });

    domc.addType('header', {
        model: textModel.extend({
            defaults: Object.assign({}, textModel.prototype.defaults, {
                'custom-name': 'Koptekst',
                tagName: 'h1',
                traits: [
                    {
                        type: 'select',
                        options: [
                            {value: 'h1', name: 'Eén (grootste)'},
                            {value: 'h2', name: 'Twee'},
                            {value: 'h3', name: 'Drie'},
                            {value: 'h4', name: 'Vier'},
                            {value: 'h5', name: 'Vijf'},
                            {value: 'h6', name: 'Zes (kleinste)'},
                        ],
                        label: 'Grootte',
                        name: 'tagName',
                        changeProp: 1
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'Standaard'},
                            {value: 'display-1', name: 'Eén (grootste)'},
                            {value: 'display-2', name: 'Twee '},
                            {value: 'display-3', name: 'Drie '},
                            {value: 'display-4', name: 'Vier (kleinste)'}
                        ],
                        label: 'Weergave grootte'
                    }
                ].concat(textModel.prototype.defaults.traits)
            }),

        }, {
            isComponent(el) {
                if(el && ['H1','H2','H3','H4','H5','H6'].includes(el.tagName)) {
                    return {type: 'header'};
                }
            }
        }),
        view: textView
    });






    domc.addType('container', {
        model: defaultModel.extend({
            defaults: Object.assign({}, defaultModel.prototype.defaults, {
                'custom-name': 'Container',
                tagName: 'div',
                droppable: true,
                traits: [
                    {
                        type: 'class_select',
                        options: [
                            {value: 'container', name: 'Fixed'},
                            {value: 'container-fluid', name: 'Fluid'}
                        ],
                        label: 'Width'
                    }
                ].concat(defaultModel.prototype.defaults.traits)
            })
        }, {
            isComponent(el) {
                if (el && el.classList && (el.classList.contains('container') || el.classList.contains('container-fluid'))) {
                    return {type: 'container'};
                }
            }
        }),
        view: defaultView
    });

    domc.addType('row', {
        model: defaultModel.extend({
            defaults: Object.assign({}, defaultModel.prototype.defaults, {
                'custom-name': 'Rij',
                tagName: 'div',
                draggable: '.container, .container-fluid',
                droppable: true,
                traits: [].concat(defaultModel.prototype.defaults.traits)
            })
        }, {
            isComponent(el) {
                if (el && el.classList && el.classList.contains('row')) {
                    return {type: 'row'};
                }
            }
        }),
        view: defaultView
    });

    domc.addType('column', {
        model: defaultModel.extend({
            defaults: Object.assign({}, defaultModel.prototype.defaults, {
                'custom-name': 'Kolom',
                draggable: '.row',
                droppable: true,
                traits: [
                    {
                        type: 'class_select',
                        options: [
                            {value: 'col', name: 'Equal'},
                            {value: 'col-auto', name: 'Variable'},
                            ... [1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'col-'+i, name: i+'/12'} })
                        ],
                        label: 'XS Width',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            {value: 'col-sm', name: 'Equal'},
                            {value: 'col-sm-auto', name: 'Variable'},
                            ... [1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'col-sm-'+i, name: i+'/12'} })
                        ],
                        label: 'SM Width',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            {value: 'col-md', name: 'Equal'},
                            {value: 'col-md-auto', name: 'Variable'},
                            ... [1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'col-md-'+i, name: i+'/12'} })
                        ],
                        label: 'MD Width',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            {value: 'col-lg', name: 'Equal'},
                            {value: 'col-lg-auto', name: 'Variable'},
                            ... [1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'col-lg-'+i, name: i+'/12'} })
                        ],
                        label: 'LG Width',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            {value: 'col-xl', name: 'Equal'},
                            {value: 'col-xl-auto', name: 'Variable'},
                            ... [1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'col-xl-'+i, name: i+'/12'} })
                        ],
                        label: 'XL Width',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'offset-'+i, name: i+'/12'} })
                        ],
                        label: 'XS Offset',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'offset-sm-'+i, name: i+'/12'} })
                        ],
                        label: 'SM Offset',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'offset-md-'+i, name: i+'/12'} })
                        ],
                        label: 'MD Offset',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'offset-lg-'+i, name: i+'/12'} })
                        ],
                        label: 'LG Offset',
                    },
                    {
                        type: 'class_select',
                        options: [
                            {value: '', name: 'None'},
                            ... [0,1,2,3,4,5,6,7,8,9,10,11,12].map(function(i) { return {value: 'offset-xl-'+i, name: i+'/12'} })
                        ],
                        label: 'XL Offset',
                    },
                ].concat(defaultModel.prototype.defaults.traits)
            }),
        }, {
            isComponent(el) {
                let match = false;
                if(el && el.classList) {
                    el.classList.forEach(function(klass) {
                        if(klass=="col" || klass.match(/^col-/)) {
                            match = true;
                        }
                    });
                }
                if(match) return {type: 'column'};
            }
        }),
        view: defaultView
    });




    var bm = editor.BlockManager;

    bm.add('container').set({
        label: `
				<svg aria-hidden="true" width="24" height="50" focusable="false" data-prefix="far" data-icon="window-maximize" class="svg-inline--fa fa-window-maximize fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm0 394c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V192h416v234z"></path></svg>
				<div class="gjs-block-label">Container<br>(hoofdbreedte)</div>
				`,
        category: 'Layout',
        content: {
            type: 'container',
            classes: ['container']
        }
    });

    bm.add('container-fluid').set({
        label: `
				<svg aria-hidden="true" width="24" height="50" focusable="false" data-prefix="far" data-icon="window-maximize" class="svg-inline--fa fa-window-maximize fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm0 394c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V192h416v234z"></path></svg>
				<div class="gjs-block-label">Container<br>(volledige breedte)</div>
				`,
        category: 'Layout',
        content: {
            type: 'container',
            classes: ['container-fluid']
        }
    });

    bm.add('row').set({
        label: `
				<svg aria-hidden="true" width="24" height="50" focusable="false" data-prefix="fas" data-icon="window-maximize" class="svg-inline--fa fa-window-maximize fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-16 160H64v-84c0-6.6 5.4-12 12-12h360c6.6 0 12 5.4 12 12v84z"></path></svg>
				<div class="gjs-block-label">Row</div>
				`,
        category: 'Layout',
        content: {
            type: 'row',
            classes: ['row']
        }
    });
    bm.add('column').set({
        label: `
				<svg aria-hidden="true" width="24" height="50" focusable="false" data-prefix="fas" data-icon="columns" class="svg-inline--fa fa-columns fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM224 416H64V160h160v256zm224 0H288V160h160v256z"></path></svg>
				<div class="gjs-block-label">Column</div>
				`,
        category: 'Layout',
        content: {
            type: 'column',
            classes: ['col']
        }
    });

    bm.add('jumbotron', {
        category: 'Pagina onderdelen',
        label: 'Jumbotron',
        attributes: {class:'fa fa-font'},
        content: '<section class="jumbotron text-center"><div class="container"> <h1 class="jumbotron-heading">Album example</h1> <p class="lead text-muted">Something short and leading about the collection below its contents, the creator, etc. Make it short and sweet, but not too short so folks don\'t simply skip over it entirely.</p> <p> <a href="#" class="btn btn-primary my-2">Main call to action</a> <a href="#" class="btn btn-secondary my-2">Secondary action</a> </p> </div> </section>',
    });


    // text
    bm.add('text', {
        category: 'Tekst',
        label: 'Tekstregel',
        attributes: {class:'fa fa-font'},
        content: {
            type: 'text',
            content: 'Dit is een tekstregel'
        }
    });
    bm.add('header', {
        category: 'Tekst',
        label: 'Koptekst',
        attributes: {class:'fa fa-header'},
        content: {
            type: 'header',
            content: 'Koptekst'
        }
    });
    bm.add('paragraph', {
        category: 'Tekst',
        label: 'Paragraaf',
        attributes: {class:'fa fa-paragraph'},
        content: {
            type: 'paragraph',
            content: 'Dit is een tekst paragraaf.'
        }
    });




    const tm = editor.TraitManager;
    // Select trait that maps a class list to the select options.
    // The default select option is set if the input has a class, and class list is modified when select value changes.
    tm.addType('class_select', {
        events:{
            'change': 'onChange',  // trigger parent onChange method on input change
        },
        getInputEl: function() {
            if (!this.inputEl) {
                var md = this.model;
                var opts = md.get('options') || [];
                var input = document.createElement('select');
                var target = this.target;
                var target_view_el = this.target.view.el;
                for(let i = 0; i < opts.length; i++) {
                    let name = opts[i].name;
                    let value = opts[i].value;
                    if(value=='') { value = 'GJS_NO_CLASS'; } // 'GJS_NO_CLASS' represents no class--empty string does not trigger value change
                    let option = document.createElement('option');
                    option.text = name;
                    option.value = value;
                    const value_a = value.split(' ');
                    //if(target_view_el.classList.contains(value)) {
                    if(_.intersection(target_view_el.classList, value_a).length == value_a.length) {
                        option.setAttribute('selected', 'selected');
                    }
                    input.append(option);
                }
                this.inputEl = input;
            }
            return this.inputEl;
        },

        onValueChange: function () {
            var classes = this.model.get('options').map(opt => opt.value);
            for(let i = 0; i < classes.length; i++) {
                if(classes[i].length > 0) {
                    var classes_i_a = classes[i].split(' ');
                    for(let j = 0; j < classes_i_a.length; j++) {
                        if(classes_i_a[j].length > 0) {
                            this.target.removeClass(classes_i_a[j]);
                        }
                    }
                }
            }
            const value = this.model.get('value');
            if(value.length > 0 && value != 'GJS_NO_CLASS') {
                const value_a = value.split(' ');
                for(let i = 0; i < value_a.length; i++) {
                    this.target.addClass(value_a[i]);
                }
            }
            this.target.em.trigger('change:selectedComponent');
        }
    });
</script>
</body>
</html>
