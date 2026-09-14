!function(t){var e={};function n(o){if(e[o])return e[o].exports;var i=e[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:o})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=n(1),i=(n.n(o),n(2)),a=(n.n(i),n(3)),r=(n.n(a),n(4)),s=(n.n(r),n(5)),c=(n.n(s),n(6)),l=(n.n(c),n(7)),d=(n.n(l),n(8));n.n(d)},function(t,e){$(document).ready(function(){function t(){$(window).width()<1e3&&($("#gjs").addClass("sidebar-collapsed"),e())}function e(){window.editor.trigger("change:canvasOffset canvasScroll")}$(".gjs-editor").append($("#toggle-sidebar")),$(".gjs-pn-panels").prepend($("#sidebar-header")),$(".gjs-pn-panels").append($("#sidebar-bottom-buttons")),$("#toggle-sidebar").click(function(){$("#gjs").toggleClass("sidebar-collapsed"),e()}),t(),window.editor.on("run:open-sm",function(t){$(".gjs-trt-traits").parent().parent().css("display","none"),$(".gjs-sm-sectors").parent().parent().css("display","block"),$("#gjs-sm-advanced .gjs-sm-properties").append($(".gjs-clm-tags"))}),window.editor.on("run:open-tm",function(t){$(".gjs-sm-sectors").parent().parent().css("display","none"),$(".gjs-trt-traits").parent().parent().css("display","block")}),window.editor.on("block:drag:start",function(e){t()}),window.editor.on("rteToolbarPosUpdate",function(t){window.editor&&window.editor.getSelected()&&(window.editor.getSelected().getEl()&&setTimeout(function(){var e=$(".gjs-rte-toolbar").first();if(e.offset().top<t.elementTop+.5*t.elementHeight){var n=t.elementTop-e.height();n>0&&e.css("top",n+"px")}},0))});var n=!1;$(document).keydown(function(t){8===t.which&&(n=!0)}).keyup(function(t){8===t.which&&(n=!1)}),$(window).on("beforeunload",function(t){n&&t.preventDefault()})}),window.addEventListener("message",function(t){"page-loaded"===t.data?($("#phpb-loading").addClass("loaded"),$(".gjs-blocks-cs").prepend($("#block-search")),window.isLoaded=!0,$(window).trigger("pagebuilder-page-loaded")):"touch-start"===t.data&&window.touchStart()},!1)},function(t,e){$(document).on("input","#block-search input",function(){var t=$(this).val().toLowerCase();$(".gjs-block-category").each(function(){var e=!1;$(this).find(".gjs-block").each(function(){$(this).data("original-html")||$(this).data("original-html",$(this).html());var n=$(this).text();if(n.toLowerCase().includes(t)){$(this).removeClass("d-none"),e=!0;var o=new RegExp("("+t+")","gi"),i=n.replace(o,"<b>$1</b>");$(this).find(".gjs-block-label").html($(this).data("original-html").replace(n.trim(),i))}else $(this).addClass("d-none")}),$(this).removeClass("d-none"),e||$(this).addClass("d-none")})})},function(t,e){!function(){window.customBuilderScripts={},window.editor.on("component:create",function(t){if(t.components().length){var e=t.components().models[t.components().length-1];if("script"===e.attributes.type){var n=t.attributes.attributes["block-id"];void 0===n&&(n=t.attributes.attributes.id);for(var o=e,i=!1;o.parent();)if((o=o.parent()).attributes.attributes["phpb-content-container"]){i=!0;break}i&&(window.customBuilderScripts[n]=e.toHTML(),e.remove())}}}),window.editor.on("component:add",function(t){if(void 0!==t.attributes["run-builder-script"]){var e=customBuilderScripts;window.customBuilderScripts[t.attributes["block-id"]]=customBuilderScripts[t.attributes["run-builder-script"]],runScriptsOfComponentAndChildren(t),window.customBuilderScripts=e,delete t.attributes["run-builder-script"]}}),window.editor.on("sorter:drag:end",function(t){var e=t.modelToDrop;for(var n in e&&e.attributes&&(e.attributes["block-id"]||e.attributes.id)&&window.runScriptsOfComponentAndChildren(e),CKEDITOR.instances)CKEDITOR.instances[n].destroy(!0)}),window.runScriptsOfComponentAndChildren=function(t){!function(t){var e=t.attributes["block-id"];void 0===e&&(e=t.attributes.attributes.id);if(e&&void 0!==window.customBuilderScripts[e]){var n=t.attributes["style-identifier"],o=$("<container>").append(window.customBuilderScripts[e]);o.find("script").prepend("let inPageBuilder = true;"),o.find("script").prepend('let blockSelector = ".'+n+'";'),o.find("script").prepend('let block = document.getElementsByClassName("'+n+'")[0];'),o.find("script").prepend("(function(){"),o.find("script").append("})();");var i=document.createElement("script");i.type="text/javascript",i.innerHTML=o.find("script").html(),window.editor.Canvas.getDocument().body.appendChild(i)}}(t),t.components().each(function(t){runScriptsOfComponentAndChildren(t)})}}()},function(t,e){!function(){function t(){!function(){if(!("IntersectionObserver"in window))return;window.initLazyLoading=function(){var t=new IntersectionObserver(function(e,n){e.forEach(function(e){e.isIntersecting&&(e.target.classList.add("bg-in-view"),t.unobserve(e.target),e.target.dataset&&parseInt(e.target.dataset.swiperSlideIndex)>0&&e.target.parentElement.classList.add("children-in-view"))})}),e=[].slice.call(document.querySelectorAll(".block-thumb:not(.bg-observing)"));e.forEach(function(e){t.observe(e),e.classList.add("bg-observing")})};document.head.insertAdjacentHTML("beforeend","<style>*:not(.children-in-view) > .block-thumb:not(.bg-in-view) { background: none !important; }</style>"),document.addEventListener("DOMContentLoaded",function(){window.initLazyLoading()})}(),function(){for(var t in window.themeBlocks){var e=window.themeBlocks[t],n=$("<container>").append(e.content);n.find("[phpb-blocks-container]").each(function(){""!==$(this).html()&&""===$(this).html().trim()&&$(this).html("")}),window.themeBlocks[t].content=n.html(),e.content=n.html(),editor.BlockManager.add(t,e)}}();var t=document.createElement("script");t.type="text/javascript",t.src=window.injectionScriptUrl;var n=t.outerHTML+"<script>"+e.toString()+e.name+"()<\/script>";window.initialComponents=window.initialComponents.replace("</body>",n+"</body>"),$.each(window.languages,function(t,e){null===window.pageBlocks[t]&&(window.pageBlocks[t]={})}),activateLanguage(window.currentLanguage)}function e(){for(var t=document.querySelectorAll("script"),e=0;e<t.length;e++){var n=t[e];if(n.innerHTML.startsWith("var script")){var o=n.innerHTML.split("=")[0],i=parseInt(o.replace("var script",""));if(Number.isInteger(i)){var a="script"+i+"Start";if("function"==typeof window[a])return 0!==i&&window[a](),!1}}}}function n(t){var e=t;if("phpb-block"===t.get("tagName")){var o=t.attributes.attributes.id;void 0!==window.pageBlocks[window.currentLanguage][o]&&void 0!==window.pageBlocks[window.currentLanguage][o].html&&(e=t.replaceWith(window.pageBlocks[window.currentLanguage][o].html),window.pageBlocks[window.currentLanguage][o].html="")}e.get("components").each(function(t){return n(t)})}function o(t){var e=!1,n=t.getEl();if(n&&n.style){var o=window.getComputedStyle(n);["background","background-image","background-color"].forEach(function(t){var n=o.getPropertyValue(t);void 0===n||""===n||n.includes("none")||n.includes("rgba(0, 0, 0, 0)")||(e=!0)})}return e}function i(t){return t.attributes.traits.length>0}function a(t){if("phpb-block"===t.attributes.tagName){var e=t.parent(),n=cloneComponent(t),o=void 0;"false"===t.attributes.attributes["is-html"]?e.components().each(function(e){if(e.cid===t.cid){var i="wrapper"in t.attributes.attributes?t.attributes.attributes.wrapper:"div";(o=t.replaceWith({tagName:i})).attributes["is-style-wrapper"]=!0,n.components().each(function(t){o.append(cloneComponent(t))})}}):e.components().each(function(e){if(e.cid===t.cid)if(1===n.components().length){var i=cloneComponent(n.components().models[0]);o=t.replaceWith(i)}else(o=t.replaceWith({tagName:"div"})).attributes["is-style-wrapper"]=!0,n.components().each(function(t){o.append(cloneComponent(t))})}),t.remove(),c(n,o,!0,!1),function(t){if(void 0===window.blockSettings[t.attributes["block-slug"]])return;t.attributes.settings={};var e=function(t){var e=[],n=t,o=!1;for(;n.parent()&&void 0===n.parent().attributes.attributes["phpb-blocks-container"]&&"true"!==n.parent().attributes["is-html"]&&void 0===n.parent().attributes.attributes["phpb-content-container"];)"false"===n.parent().attributes["is-html"]&&(o=!0),void 0!==n.attributes["block-id"]&&e.push(n.attributes["block-id"]),n=n.parent();var i=t.attributes["block-id"];o?i=n.attributes["block-id"]:e=[];var a=window.pageBlocks[window.currentLanguage][i];e.reverse().forEach(function(t){a=void 0===a||void 0===a.blocks||void 0===a.blocks[t]?{}:a.blocks[t]});var r={};void 0!==a&&void 0!==a.settings&&void 0!==a.settings.attributes&&(r=a.settings.attributes);return r}(t);void 0!==e["style-identifier"]&&t.addClass(e["style-identifier"]);t.attributes["is-updating"]=!0,window.blockSettings[t.attributes["block-slug"]].forEach(function(n){var o=t.addTrait(n);void 0!==e[n.name]?o.setTargetValue(e[n.name]):void 0!==n["default-value"]&&o.setTargetValue(n["default-value"])}),t.attributes["is-updating"]=!1}(o),a(o)}else t.components().each(function(t){a(t)})}function r(t,e){if(0===e.length)return t;var n=null;return t.components().each(function(t){if(t.attributes["block-id"]===e[0])return n=r(t,e.slice(1)),!1}),t.components().each(function(t){var o=r(t,e);if(null!==o)return n=o,!1}),n}$("#language-selector select").on("change",function(){var t=$(this).find("option:selected").val();window.switchLanguage(t,function(){activateLanguage(t)})}),window.activateLanguage=function(t){window.currentLanguage=t,window.editor.select(),window.editor.DomComponents.clear(),window.editor.DomComponents.componentsById=[],window.editor.UndoManager.clear(),window.editor.Canvas.getDocument().querySelectorAll("script").forEach(function(t){t.remove()}),window.editor.setComponents(window.initialComponents),function t(e){if("phpb-content-container"in e.attributes.attributes)return;u(e);e.get("components").each(function(e){return t(e)})}(editor.getWrapper()),window.editor.getWrapper().find("[phpb-content-container]").forEach(function(t,e){t.set("custom-name",window.translations["page-content"]),t.components(window.contentContainerComponents[e]),n(t),a(t)})},$(window).on("pagebuilder-page-loaded",function(t){window.editor.getWrapper().find("[phpb-content-container]").forEach(function(t){l(t),window.runScriptsOfComponentAndChildren(t)}),window.setWaiting(!1),setTimeout(function(){window.changesOffset=window.editor.getModel().get("changesCount"),window.afterInitialRendering=!0},250)}),window.editor.on("component:selected",function(t){i(t)?$(".gjs-pn-buttons .gjs-pn-btn:nth-of-type(2)").click():""===t.get("type")&&o(t)&&($(".gjs-pn-buttons .gjs-pn-btn:nth-of-type(3)").click(),$("#gjs-sm-position").hasClass("gjs-sm-open")&&$("#gjs-sm-position").find(".gjs-sm-title").click(),$("#gjs-sm-background").hasClass("gjs-sm-open")||$("#gjs-sm-background").find(".gjs-sm-title").click()),i(t)||setTimeout(function(){$(".gjs-trt-traits").html('<p class="no-settings">'+window.translations["trait-manager"]["no-settings"]+"</p>")},0),setTimeout(function(){t.attributes.removable||$(".gjs-toolbar .fa-trash-o.gjs-toolbar-item").hide(),t.attributes.copyable||$(".gjs-toolbar .fa-clone.gjs-toolbar-item").hide(),t.attributes.draggable||$(".gjs-toolbar .fa-arrows.gjs-toolbar-item").hide(),t.attributes.removable||t.attributes.copyable||t.attributes.draggable||window.editor.select(t.parent());var e=t.attributes["block-slug"];if(e&&window.themeBlocks[e]){var n=window.themeBlocks[e].label.split("</div>");n.length>1&&$(".gjs-toolbar").attr("title","Bloknaam: "+n[1])}},0)}),window.editor.on("component:clone",function(t){if(!s){var e=window.editor.getWrapper().find("."+t.attributes["style-identifier"])[0];void 0!==t.attributes["style-identifier"]&&""!==t.attributes["style-identifier"]&&(t.removeClass(t.attributes["style-identifier"]),delete t.attributes["style-identifier"],d(t)),t.attributes["block-id"]=t.attributes["block-slug"],e&&void 0!==window.customBuilderScripts[e.attributes["block-id"]]&&(t.attributes["run-builder-script"]=e.attributes["block-id"])}}),window.editor.on("block:drag:stop",function(t){if(t&&t.attributes&&t.attributes.attributes){var e=b();t.attributes.attributes["dropped-component-id"]=e;var n=t.parent();a(t),n.components().each(function(n){n.attributes["dropped-component-id"]===e&&(delete n.attributes["dropped-component-id"],t=n)}),l(t),window.runScriptsOfComponentAndChildren(t)}}),window.editor.on("component:update",function(t){if(!0===window.isLoaded&&void 0!==t.attributes["block-slug"]&&!t.attributes["is-updating"]&&void 0!==t.changed.attributes&&0!==$(".gjs-frame").contents().find("#"+t.ccid).length){var e=window.getDynamicBlockUpdateContext(t),n=window.getComponentDataInStorageFormat(e.component);window.refreshDynamicBlock(e.component,n,e.relativeIds)}}),window.getDynamicBlockUpdateContext=function(t){for(var e=[],n=t,o=!1;n.parent()&&void 0===n.parent().attributes.attributes["phpb-blocks-container"]&&"true"!==n.parent().attributes["is-html"]&&void 0===n.parent().attributes.attributes["phpb-content-container"];)"false"===n.parent().attributes["is-html"]&&(o=!0),void 0!==n.attributes["block-id"]&&e.push(n.attributes["block-id"]),n=n.parent();return o||(e=[]),{component:o?n:t,relativeIds:e}},window.refreshDynamicBlock=function(t,e){var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};t.attributes["is-updating"]=!0,$(".gjs-frame").contents().find("#"+t.ccid).addClass("gjs-freezed");var s=window.editor.getWrapper().find("#"+t.ccid)[0].parent();return $.ajax({type:"POST",url:window.renderBlockUrl,data:{data:JSON.stringify(e),language:window.currentLanguage},success:function(c){var d=$(c).attr("block-id");window.pageBlocks[window.currentLanguage]=window.pageBlocks[window.currentLanguage]||{},window.pageBlocks[window.currentLanguage][d]=void 0===e.blocks[d]?{}:e.blocks[d],t.replaceWith(c),n(s),a(s),l(s,!1,!1);var u=r(s,[d]);u&&runScriptsOfComponentAndChildren(u);var p=o.slice();p.push(d);var b=r(s,p.reverse());b&&window.editor.select(b);var g=document.querySelector("iframe");g&&g.contentWindow&&g.contentWindow.dispatchEvent(new Event("resize")),"function"==typeof i.success&&i.success(u,d)},error:function(e){$(".gjs-frame").contents().find("#"+t.ccid).removeClass("gjs-freezed"),t.attributes["is-updating"]=!1,"function"==typeof i.error?i.error(e):window.toastr.error(window.translations["toastr-component-update-failed"])}})};var s=!1;function c(t,e,n,o){var i=t.attributes.attributes;for(var a in i)o&&(e.attributes.attributes[a]=i[a]),n&&(e.attributes[a]=i[a])}function l(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];if(u(t),void 0!==t.attributes.attributes["phpb-content-container"])t.set({droppable:!0,hoverable:!0});else if(void 0!==t.attributes["block-slug"]){t.find("[phpb-hide-if-not-editable]").forEach(function(t){n||window.afterInitialRendering?t.addClass("editable"):t.removeClass("editable")});var i={selectable:!0,hoverable:!0};e||(i={removable:!0,draggable:!0,copyable:!0,selectable:!0,hoverable:!0,stylable:!0},d(t)),"true"===t.attributes["is-html"]?(e=!1,n=!0):(e=!0,n=!1,t.getEl().setAttribute("data-cursor","default")),t.set(i)}if(void 0===t.attributes.attributes["data-raw-content"]){if(n&&(function(t){var e=t.get("tagName"),n={};"phpb-blocks-container"in t.attributes.attributes&&(n.hoverable=!0,n.selectable=!0,n.droppable=!0);["h1","h2","h3","h4","h5","h6","h7","p","small","b","strong","i","em","label","button","ol","ul","li","table"].includes(e)||"phpb-editable"in t.attributes.attributes?(n.editable=!0,t.attributes["made-text-editable"]="true"):["img"].includes(e)&&(n.editable=!0);o(t)&&(n.hoverable=!0,n.selectable=!0,n.stylable=!0);"a"===e&&(n.hoverable=!0,n.selectable=!0,n.stylable=!0,n.removable=!0);$.isEmptyObject(n)||(t.set(n),void 0!==n.stylable&&n.stylable&&d(t))}(t),"true"===t.attributes["made-text-editable"])){t.attributes.attributes["data-raw-content"]="true";var a=t.replaceWith(t.toHTML());return["block-id","block-slug","is-html","style-identifier"].forEach(function(e){a.attributes[e]=t.attributes[e]}),void l(a)}t.get("components").each(function(t){return l(t,e,n)})}else t.set({editable:!0})}function d(t){var e=!1;t.getClasses().forEach(function(t){t.startsWith("ID")&&t.length>=16&&(e=t)}),void 0===t.attributes["style-identifier"]&&(t.attributes["style-identifier"]=e||b()),t.addClass(t.attributes["style-identifier"])}function u(t){t.set({removable:!1,draggable:!1,droppable:!1,badgable:!1,stylable:!1,highlightable:!1,copyable:!1,resizable:!1,editable:!1,layerable:!1,selectable:!1,hoverable:!1})}window.cloneComponent=function(t){s=!0;var e=t.clone();return function t(e,n){c(e,n,!1,!0);for(var o=0;o<e.components().length;o++){var i=e.components().models[o],a=n.components().models[o];t(i,a)}}(t,e),s=!1,e};var p=0;function b(){return"ID"+(Date.now().toString(36)+Math.random().toString(36).substr(2,5)+p++).toUpperCase()}!function e(){window.grapesJSLoaded?t():setTimeout(e,100)}()}()},function(t,e){var n=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t};$(document).ready(function(){function t(t){var e=window.pageBlocks[t],n=window.pageBlocks[window.currentLanguage];if(void 0===e)e=n;else for(var o in function(t,e){for(var n in t)if(void 0!==e[n])for(var o in t[n].blocks){var i=t[n].blocks[o],a=e[n].blocks[o];if(i&&a){var r=i.html.match(/phpb-blocks-container(.*)>(.*)</g),s=a.html.match(/phpb-blocks-container(.*)>(.*)</g);if(r&&s)for(var c=0;c<r.length;c++)e[n].blocks[o].html=e[n].blocks[o].html.replace(s[c],r[c])}}}(n,e),n)void 0===e[o]&&(e[o]=n[o]);var i=function(t){var o=$("<container>"+n[t].html+"</container>"),i=$("<container>"+e[t].html+"</container>");o.find("[phpb-blocks-container]").each(function(t){var e=$(this).html();i.find("[phpb-blocks-container]").eq(t).html(e)}),e[t].html=i.html()};for(var a in n)i(a);window.pageBlocks[t]=e}function e(t){setTimeout(function(){var e=window.pageData.css?window.pageData.css:window.initialCss;window.pageData={html:[],components:[],css:null,style:null},window.pageBlocks[window.currentLanguage]=[],window.editor.getWrapper().find("[phpb-content-container]").forEach(function(t,o){var a=i(t);window.pageData.css=function(t,e){if(!t)return e;var n=JSON.stringify(window.pageBlocks),o=t.match(new RegExp("\\.ID(.*?){(.*?)}","g"));if(!o)return e;return o.forEach(function(t){var o=t.split("{")[0],i=o.replace("."," ").trim();-1===e.indexOf(o)&&n.indexOf(i)>=0&&(e+=t)}),e}(e,a.css),window.pageData.style=a.style,window.pageData.html[o]=a.html,window.pageData.components[o]=a.components,window.pageBlocks[window.currentLanguage]=n({},window.pageBlocks[window.currentLanguage],a.blocks),window.contentContainerComponents[o]=a.components}),t&&t()},200)}function o(){c(),e(function(){$.each(window.languages,function(e,n){e!==window.currentLanguage&&t(e)});var e,n,o,i=window.pageData;i.blocks=(e=window.pageBlocks,n=JSON.stringify(window.pageData.html),o={},$.each(e,function(t,e){var i={};$.each(e,function(t,e){i[t]=JSON.stringify(e)});var a={};$.each(e,function(t,e){if(n.includes(t))return a[t]=e,!0;$.each(i,function(n,o){if(o.includes(t))return a[t]=e,!1})}),o[t]=a}),o),i.style=function(t,e){var n=JSON.stringify(t),o=[];return e.forEach(function(t){if(t.attributes.selectors.models.length){if(0===Object.keys(t.attributes.style).length)return;var e=t.attributes.selectors.models[0].id;n.includes(e)&&o.push(t)}}),o}(i.blocks,i.style),$.ajax({type:"POST",url:$("#save-page").data("url"),data:{data:JSON.stringify(i)},success:function(){c(),window.toastr.success(window.translations["toastr-changes-saved"]),setTimeout(function(){window.changesOffset=window.editor.getModel().get("changesCount")},250)},error:function(t){c(),console.log(t);var e=t.statusText+" "+t.status;e=t.responseJSON.message?e+': "'+t.responseJSON.message+'"':e,window.toastr.error(e),window.toastr.error(window.translations["toastr-saving-failed"])}})})}function i(t){var e=window.editor.DomComponents.componentsById;window.editor.DomComponents.componentsById=[];var n=function t(e){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];var o=arguments.length>2&&void 0!==arguments[2]&&arguments[2];var i={current_block:{settings:{},blocks:{},html:"",is_html:!1},blocks:{}};var r=n;var c=o;void 0!==e.attributes["block-id"]&&("false"===e.attributes["is-html"]?(r=!0,c=!1):n&&(r=!1,c=!0));e.get("components").forEach(function(e){var n=t(e,r,c);for(var o in n.current_block.blocks)i.current_block.blocks[o]=n.current_block.blocks[o];for(var a in n.blocks)i.blocks[a]=n.blocks[a]});if(!e.parent())return i;if(void 0===e.attributes["block-id"])return i;if("true"===e.attributes["is-html"])if(n)i.current_block.blocks[e.attributes["block-id"]]={settings:{},blocks:{},html:window.html_beautify(a(e)),is_html:!0};else{void 0!==e.attributes["style-identifier"]&&(i.current_block.settings.attributes={"style-identifier":e.attributes["style-identifier"]});var l=e.attributes["block-id"];e.attributes["block-id"].startsWith("ID")||(l=s()),e.replaceWith({tagName:"phpb-block",attributes:{slug:e.attributes["block-slug"],id:l}}),i.blocks[l]={settings:i.current_block.settings,blocks:{},html:window.html_beautify(a(e)),is_html:!0},i.current_block={settings:{},blocks:{},html:"",is_html:!1}}else{var d={};e.get("traits").each(function(t){d[t.get("name")]=t.getTargetValue()}),i.current_block.settings.attributes=d,void 0!==e.attributes["style-identifier"]&&(i.current_block.settings.attributes["style-identifier"]=e.attributes["style-identifier"]);var u=e.attributes["block-id"];if(e.attributes["block-id"].startsWith("ID")||(u=s()),e.replaceWith({tagName:"phpb-block",attributes:{slug:e.attributes["block-slug"],id:u}}),n){var p={settings:{},blocks:{},html:"",is_html:!1};p.blocks[e.attributes["block-id"]]=i.current_block,i.current_block=p}else i.blocks[u]=i.current_block,i.current_block={settings:{},blocks:{},html:"",is_html:!1}}return i}(t=window.cloneComponent(t)).blocks,o=window.html_beautify(function(t){var e="";t.get("components").forEach(function(t){return e+=t.toHTML()});var n=$("<container>"+e+"</container>");return n.find("phpb-block").each(function(){$(this).replaceWith('[block slug="'+$(this).attr("slug")+'" id="'+$(this).attr("id")+'"]')}),n.html()}(t)),i=window.editor.getCss(),r=window.editor.getStyle(),c=JSON.parse(JSON.stringify(t.get("components")));return window.editor.DomComponents.componentsById=e,{html:o,css:i,components:c,blocks:n,style:r}}function a(t){var e=$("<container>"+t.toHTML()+"</container>");return e.find("phpb-block").each(function(){$(this).replaceWith('[block slug="'+$(this).attr("slug")+'" id="'+$(this).attr("id")+'"]')}),e.html()}window.pageData={},window.changesOffset=0,window.onbeforeunload=function(){if(window.editor.getModel().get("changesCount")-window.changesOffset>0)return"Are you sure? There are unsaved changes."},$("#save-page").click(function(){o()}),$(document).bind("keydown",function(t){if(t.ctrlKey&&83===t.which)return window.editor.store(),o(),t.preventDefault(),!1}),window.switchLanguage=function(n,o){window.setWaiting(!0),e(function(){t(n);var e,i,a,r=window.pageData;r.blocks=(e={},i=n,a=window.pageBlocks[n],i in e?Object.defineProperty(e,i,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[i]=a,e),$.ajax({type:"POST",url:window.renderLanguageVariantUrl,data:{data:JSON.stringify(r),language:n},success:function(t){t=JSON.parse(t),window.pageBlocks[n]=t.dynamicBlocks?t.dynamicBlocks:{},o()},error:function(t){o(),console.log(t);var e=t.statusText+" "+t.status;e=t.responseJSON.message?e+': "'+t.responseJSON.message+'"':e,window.toastr.error(e),window.toastr.error(window.translations["toastr-switching-language-failed"])}})})},window.getComponentDataInStorageFormat=function(t){var e=window.cloneComponent(t.parent());return e.get("components").reset(),e.append(t),i(e)};var r=0;function s(){return"ID"+(Date.now().toString(36)+Math.random().toString(36).substr(2,5)+r++).toUpperCase()}function c(){var t=$("#save-page");t.blur(),t.hasClass("waiting")?(t.attr("disabled",!1),t.removeClass("waiting"),t.find(".spinner-border").addClass("d-none")):(t.attr("disabled",!0),t.addClass("waiting"),t.find(".spinner-border").removeClass("d-none"))}window.setWaiting=function(t){var e=window.editor.DomComponents.getWrapper();t?e.addClass("gjs-waiting"):e.removeClass("gjs-waiting")}})},function(t,e){!function(){var t=!1,e=null,n=null;function o(t){for(;t;){var e=t.attributes["block-slug"],n=e&&window.blockEditors?window.blockEditors[e]:null;if(n&&"ai-content"===n.type)return{component:t,config:n};t=t.parent()}return null}function i(t,e){var n=window.getDynamicBlockUpdateContext(t),o=window.getComponentDataInStorageFormat(n.component);o.blocks=o.blocks||{};var i=n.component.attributes["block-id"];if(!o.blocks[i]){var l=n.component.attributes["block-slug"],u=String(o.html||"").match(/\[block\s+slug="[^"]+"\s+id="[^"]+"\]/g)||[];u.some(function(t){var e=t.match(/\[block\s+slug="([^"]+)"\s+id="([^"]+)"\]/);if(e&&e[1]===l&&o.blocks[e[2]])return i=e[2],!0;return!1})}var a=o.blocks[i]||{settings:{attributes:{}},blocks:{},html:"",is_html:!1};o.blocks[i]=a;n.relativeIds.slice().reverse().forEach(function(t){a.blocks&&a.blocks[t]&&(a=a.blocks[t])});var r=e&&e.content_block_id||"content",s=function t(e,n){var o=null;return e.components().each(function(e){return!o&&(e.attributes["block-id"]===n?(o=e,!1):!(o=t(e,n))&&void 0)}),o}(t,r);return{updateContext:n,data:o,rootData:a,rootId:i,contentBlockId:r,contentComponent:s}}function a(t){var e=document.createElement("div");return e.innerHTML=t||"",e.querySelectorAll("*").forEach(function(t){["block-id","block-slug","is-html","wrapper","style-identifier","dropped-component-id","data-gjs-type"].forEach(function(e){t.removeAttribute(e)})}),e.innerHTML}function r(t){return void 0===t||null===t?"":String(t)}function s(t,e){var n,o=i(t,e),s=o.rootData.settings&&o.rootData.settings.attributes?o.rootData.settings.attributes:{},c=r((o.rootData.blocks&&o.rootData.blocks[o.contentBlockId]?o.rootData.blocks[o.contentBlockId]:{}).html);return""===c&&o.contentComponent&&(c=(n=o.contentComponent)?a(n.toHTML()):""),""===c&&(c=r(s.html)),{html:a(c),css:r(s.css),javascript:r(s.javascript),status:r(s.generation_status)}}function c(t,e){var n=$("#phpb-ai-content-message");n.removeClass("alert-success alert-danger alert-warning alert-info"),n.addClass("alert-"+(e||"info")),n.text(t||""),t?n.removeClass("d-none").show():n.addClass("d-none").hide()}function l(){}function d(t,e){busy=t,updateGenerateButtonState(),$("#phpb-ai-content-generate-spinner").toggleClass("d-none",!t||"generate"!==e),$("#phpb-ai-content-apply-spinner").toggleClass("d-none",!t||"apply"!==e),updateApplyButtonState()}var originalSource=null,busy=!1;function hasSourceChanges(){return!!originalSource&&($("#phpb-ai-content-html").val()!==originalSource.html||$("#phpb-ai-content-css").val()!==originalSource.css||$("#phpb-ai-content-javascript").val()!==originalSource.javascript)}function hasExistingContent(t){var e=document.createElement("div");e.innerHTML=t.html||"",e.querySelectorAll(".ai-content-body-fallback").forEach(function(t){t.remove()});return e.innerHTML.trim()!==""||t.css.trim()!==""||t.javascript.trim()!==""}function updateApplyButtonState(){var t=hasSourceChanges();$("#phpb-ai-content-apply").toggleClass("btn-primary",t).toggleClass("btn-secondary",!t).prop("disabled",busy||!t)}function updateGenerateButtonState(){var t=!!$("#phpb-ai-content-prompt").val().trim();$("#phpb-ai-content-generate").toggleClass("btn-primary",t).toggleClass("btn-secondary",!t).prop("disabled",busy||!t)}function setEditorMode(t){var e="prompt"===t,n=e?"Code bewerken":"Bewerk met tekst";$("#phpb-ai-content-mode-toggle").attr("data-current-mode",t).attr("aria-label",n).find("span").text(n),$("#phpb-ai-content-mode-toggle i").toggleClass("fa-code",e).toggleClass("fa-magic",!e),$("[data-ai-mode-pane]").hide(),$("[data-ai-mode-pane="+t+"]").show(),$("#phpb-ai-content-generate").toggleClass("d-none",!e),$("#phpb-ai-content-apply").toggleClass("d-none",e)}function u(){$("#phpb-ai-content-modal").length||($("body").append('\n<div class="modal fade" id="phpb-ai-content-modal" tabindex="-1" role="dialog" aria-hidden="true">\n    <div class="modal-dialog modal-xl" role="document">\n        <div class="modal-content">\n            <div class="modal-header">\n                <h5 class="modal-title">Website aanpassen met AI</h5>\n                <div class="d-flex align-items-center ml-auto">\n                    <button type="button" id="phpb-ai-content-mode-toggle" class="btn btn-light border text-secondary px-3" data-ai-mode-toggle aria-label="Code bewerken">\n                        <i class="fa fa-code mr-2" style="color:#6394c9" aria-hidden="true"></i><span>Code bewerken</span>\n                    </button>\n                    <button type="button" class="close" style="margin:0 0 0 30px;padding:0;outline:none;box-shadow:none" data-dismiss="modal" aria-label="Sluiten"><span aria-hidden="true">&times;</span></button>\n                </div>\n            </div>\n            <div class="modal-body">\n                <div id="phpb-ai-content-message" class="alert d-none" role="status"></div>\n<div class="phpb-ai-content-tab mt-3" data-ai-mode-pane="prompt">\n    <label id="phpb-ai-content-prompt-label" for="phpb-ai-content-prompt"><strong style="font-weight:500">Wat wil je maken?</strong></label>\n    <button type="button" id="phpb-ai-content-prompt-info-button" class="btn btn-link text-secondary p-0 ml-1" aria-label="Uitleg over de opdracht" data-toggle="tooltip" data-placement="top" title="Beschrijf wat je op de pagina wilt zien en plak hierbij eventueel de tekst die je wilt gebruiken."><i class="fa fa-info-circle" aria-hidden="true"></i></button>\n    <textarea id="phpb-ai-content-prompt" class="form-control" rows="7" aria-describedby="phpb-ai-content-prompt-error"></textarea>\n    <div id="phpb-ai-content-prompt-error" class="invalid-feedback">Vul eerst een opdracht in.</div>\n</div>\n<div class="phpb-ai-content-tab mt-3" data-ai-mode-pane="source" style="display:none">\n    <ul class="nav nav-tabs" role="tablist">\n        <li class="nav-item"><button class="nav-link active" type="button" data-ai-tab="html">HTML</button></li>\n        <li class="nav-item"><button class="nav-link" type="button" data-ai-tab="css">CSS</button></li>\n        <li class="nav-item"><button class="nav-link" type="button" data-ai-tab="javascript">JavaScript</button></li>\n    </ul>\n    <div class="phpb-ai-content-tab mt-3" data-ai-pane="html">\n        <label for="phpb-ai-content-html">HTML-fragment</label>\n        <textarea id="phpb-ai-content-html" class="form-control phpb-ai-content-source" rows="18" spellcheck="false"></textarea>\n    </div>\n    <div class="phpb-ai-content-tab mt-3" data-ai-pane="css" style="display:none">\n        <label for="phpb-ai-content-css">CSS voor dit blok</label>\n        <textarea id="phpb-ai-content-css" class="form-control phpb-ai-content-source" rows="18" spellcheck="false"></textarea>\n        <small class="form-text text-muted">De CSS wordt automatisch beperkt tot dit blok.</small>\n    </div>\n    <div class="phpb-ai-content-tab mt-3" data-ai-pane="javascript" style="display:none">\n        <label for="phpb-ai-content-javascript">JavaScript</label>\n        <textarea id="phpb-ai-content-javascript" class="form-control phpb-ai-content-source" rows="18" spellcheck="false"></textarea>\n        <small class="form-text text-muted">JavaScript wordt alleen uitgevoerd als dit is ingeschakeld in de blokinstellingen en de algemene configuratie.</small>\n    </div>\n</div>\n            </div>\n            <div id="phpb-ai-content-footer" class="modal-footer">\n                <button id="phpb-ai-content-generate" type="button" class="btn btn-secondary" data-ai-mode-action="prompt" disabled>\n                    Aanpassing maken<span id="phpb-ai-content-generate-spinner" class="spinner-border spinner-border-sm d-none ml-2" role="status" aria-hidden="true"></span>\n                </button>\n                <button id="phpb-ai-content-apply" type="button" class="btn btn-secondary d-none" disabled>\n                    Wijzigingen toepassen<span id="phpb-ai-content-apply-spinner" class="spinner-border spinner-border-sm d-none ml-2" role="status" aria-hidden="true"></span>\n                </button>\n            </div>\n        </div>\n    </div>\n</div>'),$(document).on("click","[data-ai-mode-toggle]",function(){var t=$(this).attr("data-current-mode");setEditorMode("prompt"===t?"source":"prompt")}),$(document).on("click","[data-ai-tab]",function(){var t=$(this).data("ai-tab");$("[data-ai-tab]").removeClass("active"),$(this).addClass("active"),$("[data-ai-pane]").hide(),$('[data-ai-pane="'+t+'"]').show()}),$("#phpb-ai-content-generate").on("click",f),$("#phpb-ai-content-apply").on("click",h),$("#phpb-ai-content-prompt-info-button").tooltip({trigger:"hover focus",placement:"top"}),$("#phpb-ai-content-html, #phpb-ai-content-css, #phpb-ai-content-javascript").on("input",updateApplyButtonState),$("#phpb-ai-content-prompt").on("input",function(){$(this).val().trim()&&$(this).removeClass("is-invalid").removeAttr("aria-invalid"),updateGenerateButtonState()}))}function p(t,e){var n=s(t,e);n.html=n.html.replace(/(<[^<>]*?)\s+data-raw-content="true"([^<>]*>)/gi,"$1$2"),$("#phpb-ai-content-prompt-label strong").text(hasExistingContent(n)?"Wat wil je aanpassen?":"Wat wil je maken?"),$("#phpb-ai-content-html").val(n.html),$("#phpb-ai-content-css").val(n.css),$("#phpb-ai-content-javascript").val(n.javascript),originalSource={html:n.html,css:n.css,javascript:n.javascript},updateApplyButtonState(),setEditorMode("prompt"),$("[data-ai-tab=html]").click(),$("#phpb-ai-content-prompt").val("").removeClass("is-invalid").removeAttr("aria-invalid"),updateGenerateButtonState(),c("","info"),l([])}function b(t){var i=o(t),a=$("#gjs-pn-ai-content-editor-button");a.toggle(!!i),$(".gjs-pn-views .gjs-pn-btn").css("width",i?"25%":"33.33%"),i?(a.attr("title",i.config.label||"AI-inhoud bewerken"),!busy&&$("#phpb-ai-content-modal").hasClass("show")&&e!==i.component&&(e=i.component,n=i.config,p(e,n))):!busy&&$("#phpb-ai-content-modal").hasClass("show")&&($("#phpb-ai-content-modal").modal("hide"),e=null,n=null)}function g(t,o,z){if(e&&n){var editorConfig=n,a=i(e,editorConfig),s=a.rootData;s.settings=s.settings||{},s.settings.attributes=s.settings.attributes||{},s.blocks=s.blocks||{};var u=s.blocks[a.contentBlockId]||{settings:{},blocks:{},html:"",is_html:!0};u.html=r(t.html),u.is_html=!0,s.blocks[a.contentBlockId]=u,s.settings.attributes.html=r(t.html),s.settings.attributes.css=r(t.css),s.settings.attributes.javascript=r(t.javascript),s.settings.attributes.generation_status="ready",d(!0,z||"apply"),c("","info"),l(o||[]),window.refreshDynamicBlock(a.updateContext.component,a.data,a.updateContext.relativeIds,{success:function(t){e=t,n=editorConfig,d(!1),"generate"===z?$("#phpb-ai-content-modal").modal("hide"):(p(e,editorConfig),l(o||[]))},error:function(t){d(!1),c(t&&t.responseJSON&&t.responseJSON.message?t.responseJSON.message:"De inhoud kon niet op het canvas worden toegepast.","danger")}})}}function f(){if(e&&n){var t=n.generate_url||window.aiContentGenerateUrl||window.aiContentConfig&&window.aiContentConfig.generate_url||"",o=$("#phpb-ai-content-prompt").val().trim();c("","info"),$("#phpb-ai-content-prompt").removeClass("is-invalid").removeAttr("aria-invalid");if(t)if(o){var i=s(e,n);d(!0,"generate"),l([]),$.ajax({type:"POST",url:t,dataType:"json",data:{prompt:o,model:(function(t){var e=null;var n=t&&t.get("traits");n&&n.each(function(t){"ai_model"===t.get("name")&&(e=t.getTargetValue())});return e})(e),context:{block_slug:e.attributes["block-slug"],current_html:i.html,current_css:i.css,current_javascript:i.javascript,layout_context:function(t){if(!t||!t.ccid)return"";var e=document.querySelector(".gjs-frame"),n=e&&e.contentDocument,o=n&&n.getElementById(t.ccid);if(!o)return"";for(var i=[],a=o.querySelector(".ai-content-body")||o;a&&1===a.nodeType;){var r=a.tagName.toLowerCase();if("phpb-block"!==r&&"script"!==r&&"style"!==r){var s=Array.from(a.classList||[]).filter(function(t){return!t.startsWith("gjs-")&&!t.startsWith("phpb-")}),c="<"+r;s.length&&(c+=' class="'+s.join(" ")+'"'),c+=">",i.unshift(c)}if(a===n.body)break;a=a.parentElement}return i.length&&i[0].toLowerCase().startsWith("<body")||i.unshift("<body>"),i.push("<AI_CONTENT_TARGET />"),i.map(function(t,e){return"  ".repeat(e)+t}).join("\n")}(e)}},success:function(t){var e=t&&t.data?t.data:t;e=e||{},$("#phpb-ai-content-html").val(r(e.html)),$("#phpb-ai-content-css").val(r(e.css)),$("#phpb-ai-content-javascript").val(r(e.javascript)),updateApplyButtonState(),g({html:r(e.html),css:r(e.css),javascript:r(e.javascript)},e.warnings||[],"generate")},error:function(t){d(!1),c(t&&t.responseJSON&&t.responseJSON.message?t.responseJSON.message:"AI-generatie is mislukt.","danger")}})}else $("#phpb-ai-content-prompt").addClass("is-invalid").attr("aria-invalid","true").trigger("focus");else c("Er is geen eindpunt voor AI-generatie ingesteld.","danger")}}function h(){hasSourceChanges()&&g({html:$("#phpb-ai-content-html").val(),css:$("#phpb-ai-content-css").val(),javascript:$("#phpb-ai-content-javascript").val()},[],"apply")}function w(){!t&&window.editor&&(t=!0,u(),window.editor.Commands.add("open-ai-content-editor",{run:function(t){var i,a,r=o(t.getSelected());r&&(i=r.component,a=r.config,i&&a&&(e=i,n=a,u(),p(i,a),$("#phpb-ai-content-modal").modal("show")))}}),window.editor.Panels.addButton("views",{id:"ai-content-editor-button",className:"fa fa-magic",command:"open-ai-content-editor",attributes:{title:"AI-inhoud bewerken"},active:!1}),window.editor.on("component:selected",b),window.editor.on("component:deselected",function(){b(window.editor.getSelected())}),b(window.editor.getSelected()))}!function t(){window.editor?w():setTimeout(t,100)}()}()},function(t,e){$(document).ready(function(){window.CKEDITOR.on("instanceReady",function(t){t.editor.on("paste",function(t){var e=t.data.dataValue;e=(e=e.replace(/<(?!\/?(?:a|table|tr|td|th|thead|tbody|tfoot|caption|col|colgroup|p|ul|ol|li|br|strong|em|b|i|u|strike|sub|sup|h1|h2|h3|h4|h5|h6|blockquote|pre|hr)\b)[^>]+>/gm,"")).replace(/<(a|table|tr|td|th|thead|tbody|tfoot|caption|col|colgroup|p|ul|ol|li|br|strong|em|b|i|u|strike|sub|sup|h1|h2|h3|h4|h5|h6|blockquote|pre|hr)\b[^>]*>/gm,function(t,e){if("a"===e){var n=t.match(/href="([^"]*)"/);return n?'<a href="'+n[1]+'">':t}if("|table|tr|td|th|thead|tbody|tfoot|".includes("|"+e+"|")){var o=t.match(/style="([^"]*)"/);return o?"<"+e+' style="'+o[1]+'">':t}return"<"+e+">"}),t.data.dataValue=e})}),window.CKEDITOR.on("dialogDefinition",function(t){var e=t.data.name,n=t.data.definition;if("link"===e){var o=n.getContents("info");n.onLoad=function(){var t=CKEDITOR.dialog.getCurrent();t.getContentElement("info","linkType").getElement().hide(),t.getContentElement("info","protocol").getElement().hide(),t.getContentElement("info","url").getElement().hide()},o.add({type:"select",id:"linktype-selector",label:"Linktype",default:"",items:[[window.translations.page,"page"],["URL","url"]],onChange:function(t){var e=CKEDITOR.dialog.getCurrent();"page"===t.data.value?(e.getContentElement("info","page-selector").getElement().show(),e.getContentElement("info","url-field").getElement().hide()):(e.getContentElement("info","page-selector").getElement().hide(),e.getContentElement("info","url-field").getElement().show(),e.getContentElement("info","url-field").setValue(""))},setup:function(t){void 0===t.type?this.setValue("page"):"url"===t.type&&t.url.url.startsWith("[page id=")?this.setValue("page"):this.setValue(t.type)}}),o.add({type:"select",id:"page-selector",label:window.translations.page,default:"",items:window.pages,onChange:function(){var t=CKEDITOR.dialog.getCurrent(),e="[page id="+this.getValue()+"]";t.setValueOf("info","url",e),t.setValueOf("info","protocol","")},setup:function(t){this.allowOnChange=!1;var e="";t.url&&(e=t.url.url.substr(9,t.url.url.length-10)),this.setValue(e),this.allowOnChange=!0}}),o.add({type:"text",id:"url-field",label:"URL",default:"",onChange:function(){var t=CKEDITOR.dialog.getCurrent(),e=this.getValue();t.setValueOf("info","url",e)},setup:function(t){this.allowOnChange=!1;var e="";t.url&&(e=t.url.url),this.setValue(e),this.allowOnChange=!0}})}})})},function(t,e){$(document).ready(function(){window.touchStart=function(){$("#gjs").addClass("sidebar-collapsed")}})}]);
;(function () {
    "use strict";

    if (window.phpbAiContentToolbarBundlePatch) {
        return;
    }
    window.phpbAiContentToolbarBundlePatch = true;

    var initialized = false;
    var decoratedComponent = null;
    var toolbarSnapshots = new WeakMap();
    var actionClass = "phpb-ai-content-toolbar-item";

    function getManagedBlock(component) {
        while (component) {
            var slug = component.attributes && component.attributes["block-slug"];
            var config = slug && window.blockEditors ? window.blockEditors[slug] : null;

            if (config && config.type === "ai-content") {
                return {component: component, config: config};
            }
            component = typeof component.parent === "function" ? component.parent() : null;
        }
        return null;
    }

    function restoreToolbar(component) {
        if (!component || !toolbarSnapshots.has(component)) {
            return;
        }
        component.set("toolbar", toolbarSnapshots.get(component));
        toolbarSnapshots.delete(component);
        if (decoratedComponent === component) {
            decoratedComponent = null;
        }
    }

    function updateToolbar(component) {
        var managedBlock = getManagedBlock(component);

        if (decoratedComponent && decoratedComponent !== component) {
            restoreToolbar(decoratedComponent);
        }

        if (!managedBlock) {
            return;
        }

        var toolbar = component.get("toolbar") || [];
        var hasAction = toolbar.some(function (item) {
            var classes = item.attributes && item.attributes.class || "";
            return classes.split(/\s+/).indexOf(actionClass) !== -1;
        });

        if (!hasAction && !toolbarSnapshots.has(component)) {
            toolbarSnapshots.set(component, toolbar.slice());
            toolbar = [{
                attributes: {
                    class: "fa fa-magic " + actionClass,
                    title: managedBlock.config.label || "AI-inhoud bewerken",
                    "aria-label": managedBlock.config.label || "AI-inhoud bewerken"
                },
                command: "open-ai-content-editor"
            }].concat(toolbar);
            component.set("toolbar", toolbar);
        }

        decoratedComponent = component;
    }

    function hideLegacySidebarButton() {
        if (document.getElementById("phpb-ai-content-toolbar-compat-style")) {
            return;
        }
        var style = document.createElement("style");
        style.id = "phpb-ai-content-toolbar-compat-style";
        style.textContent =
            "#gjs-pn-ai-content-editor-button{display:none!important}" +
            ".phpb-ai-content-legacy-hidden{display:none!important}" +
            ".gjs-pn-views .gjs-pn-btn{width:33.3333%!important}";
        document.head.appendChild(style);

        document.querySelectorAll(".gjs-pn-views .gjs-pn-btn").forEach(function (button) {
            var isLegacyAiButton = button.id.indexOf("ai-content-editor") !== -1 ||
                button.classList.contains("fa-magic") ||
                button.querySelector(".fa-magic");

            if (isLegacyAiButton) {
                button.classList.add("phpb-ai-content-legacy-hidden");
            }
        });
    }

    function initializeWhenReady() {
        if (initialized || window.phpbAiContentToolbarInitialized) {
            return;
        }

        var editor = window.editor;
        if (!editor) {
            window.setTimeout(initializeWhenReady, 50);
            return;
        }

        initialized = true;
        hideLegacySidebarButton();
        editor.on("component:selected", updateToolbar);
        editor.on("component:deselected", function (component) {
            restoreToolbar(component);
            window.setTimeout(function () {
                updateToolbar(editor.getSelected());
            }, 0);
        });
        updateToolbar(editor.getSelected());
    }

    initializeWhenReady();
    function bindPlaceholderActions(editor) {
        function bindToCanvasFrame() {
            var canvasDocument = editor.Canvas.getDocument();
            if (!canvasDocument || canvasDocument.__phpbAiContentActionBound) {
                return;
            }
            canvasDocument.__phpbAiContentActionBound = true;
            canvasDocument.addEventListener("click", function (event) {
                var clickedElement = event.target && event.target.nodeType === 1
                    ? event.target
                    : event.target && event.target.parentElement;
                var action = clickedElement && clickedElement.closest("[data-ai-content-open]");
                if (!action) {
                    return;
                }

                event.preventDefault();
                var actionComponent = editor.getWrapper()
                    .find("[data-ai-content-open]")
                    .find(function (component) {
                        return component.getEl() === action;
                    });
                if (actionComponent && typeof editor.select === "function") {
                    editor.select(actionComponent);
                }

                window.setTimeout(function () {
                    var managedBlock = getManagedBlock(actionComponent || editor.getSelected());
                    if (managedBlock) {
                        editor.runCommand("open-ai-content-editor");
                    }
                }, 0);
            }, true);
        }

        editor.on("canvas:frame:load", bindToCanvasFrame);
        bindToCanvasFrame();
    }

    function bindPlaceholderActionsWhenReady() {
        var editor = window.editor;
        if (!editor) {
            window.setTimeout(bindPlaceholderActionsWhenReady, 50);
            return;
        }
        bindPlaceholderActions(editor);
    }

    bindPlaceholderActionsWhenReady();
})();

// Clean up AI block styles orphaned by older renderings that placed <style>
// nodes beside, rather than inside, the AI block root. Keep this in the bundle
// directly so development does not require a build step.
(function() {
    function removeOrphanedAiContentStyles() {
        var editor = window.editor;
        if (!editor || !editor.getWrapper) return;

        var wrapper = editor.getWrapper();
        var activeScopes = {};

        function collectScopes(component) {
            var classes = typeof component.getClasses === 'function' ? component.getClasses() : [];
            if (classes.indexOf('ai-content-block') !== -1) {
                classes.forEach(function(className) {
                    if (className.indexOf('ai-content-') === 0 && className !== 'ai-content-block') {
                        activeScopes[className] = true;
                    }
                });
            }

            var children = component.get('components');
            if (!children) return;
            children.models.slice().forEach(function(child) {
                collectScopes(child);
            });
        }

        function removeOrphanedStyles(component) {
            var children = component.get('components');
            if (!children) return;
            children.models.slice().forEach(function(child) {
                if ((child.get('tagName') || '').toLowerCase() !== 'style') {
                    removeOrphanedStyles(child);
                    return;
                }

                var holder = document.createElement('div');
                holder.innerHTML = child.toHTML();
                var style = holder.querySelector('style');
                var scopes = style && style.textContent
                    ? style.textContent.match(/\.ai-content-[A-Za-z0-9_-]+/g) || []
                    : [];
                if (!scopes.length || scopes.some(function(scope) { return activeScopes[scope.slice(1)]; })) return;

                var parent = child.parent();
                var removeWrapper = parent && parent !== wrapper
                    && (parent.get('tagName') || '').toLowerCase() === 'div'
                    && typeof parent.getClasses === 'function'
                    && parent.getClasses().some(function(className) { return /^ID[A-Z0-9]{10,}$/i.test(className); })
                    && parent.get('components').length === 1;
                child.remove();
                if (removeWrapper) parent.remove();
            });
        }

        collectScopes(wrapper);
        removeOrphanedStyles(wrapper);
    }

    document.addEventListener('click', function(event) {
        var target = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
        if (target && target.closest && target.closest('#save-page')) {
            removeOrphanedAiContentStyles();
        }
    }, true);

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && (event.key === 's' || event.key === 'S' || event.which === 83)) {
            removeOrphanedAiContentStyles();
        }
    }, true);

})();

(function() {
    function updateJavascriptHint() {
        var hint = document.querySelector('#phpb-ai-content-modal [data-ai-pane="javascript"] .form-text');
        if (hint) {
            hint.textContent = 'Gebruik aiContentRoot om dit blok te bereiken. JavaScript wordt uitgevoerd op de gepubliceerde pagina, niet in de PageBuilder zelf.';
        }
    }

    if (window.jQuery) {
        window.jQuery(document).on('shown.bs.modal', '#phpb-ai-content-modal', updateJavascriptHint);
    }
})();
