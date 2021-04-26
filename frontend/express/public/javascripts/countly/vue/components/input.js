/* global jQuery, Vue, _ */

(function(countlyVue, $) {

    var countlyBaseComponent = countlyVue.components.BaseComponent,
        _mixins = countlyVue.mixins;

    var objectWithoutProperties = function(obj, excluded) {
        if (!obj || !excluded || excluded.length === 0) {
            return obj;
        }
        return Object.keys(obj).reduce(function(acc, val) {
            if (excluded.indexOf(val) === -1) {
                acc[val] = obj[val];
            }
            return acc;
        }, {});
    };

    var HEX_COLOR_REGEX = new RegExp('^#([0-9a-f]{3}|[0-9a-f]{6})$', 'i');

    Vue.component("cly-colorpicker", countlyBaseComponent.extend({
        mixins: [
            _mixins.i18n
        ],
        props: {
            value: {type: [String, Object], default: "#FFFFFF"},
            resetValue: { type: [String, Object], default: "#FFFFFF"}
        },
        data: function() {
            return {
                isOpened: false
            };
        },
        computed: {
            previewStyle: function() {
                return {
                    "background-color": this.value
                };
            },
            localValue: {
                get: function() {
                    return this.value.replace("#", "");
                },
                set: function(value) {
                    var colorValue = "#" + value.replace("#", "");
                    if (colorValue.match(HEX_COLOR_REGEX)) {
                        this.setColor({hex: colorValue});
                    }
                }
            }
        },
        methods: {
            setColor: function(color) {
                this.$emit("input", color.hex);
            },
            reset: function() {
                this.setColor({hex: this.resetValue});
            },
            open: function() {
                this.isOpened = true;
            },
            close: function() {
                this.isOpened = false;
            }
        },
        components: {
            picker: window.VueColor.Sketch
        },
        template: '<div class="cly-vue-colorpicker">\n' +
                    '<div @click.stop="open">\n' +
                        '<div class="preview-box" :style="previewStyle"></div>\n' +
                        '<input class="preview-input" type="text" v-model="localValue" />\n' +
                    '</div>\n' +
                    '<div class="picker-body" v-if="isOpened" v-click-outside="close">\n' +
                        '<picker :preset-colors="[]" :value="value" @input="setColor"></picker>\n' +
                        '<div class="button-controls">\n' +
                            '<cly-button :label="i18n(\'common.reset\')" @click="reset" skin="light"></cly-button>\n' +
                            '<cly-button :label="i18n(\'common.cancel\')" @click="close" skin="light"></cly-button>\n' +
                            '<cly-button :label="i18n(\'common.confirm\')" @click="close" skin="green"></cly-button>\n' +
                        '</div>\n' +
                    '</div>\n' +
                  '</div>'
    }));

    Vue.component("cly-radio", countlyBaseComponent.extend(
        // @vue/component
        {
            props: {
                value: {required: true, default: -1, type: [ String, Number ]},
                items: {
                    required: true,
                    type: Array,
                    default: function() {
                        return [];
                    }
                },
                skin: { default: "main", type: String},
                disabled: {type: Boolean, default: false}
            },
            computed: {
                topClasses: function() {
                    var classes = [];
                    if (["main", "light"].indexOf(this.skin) > -1) {
                        classes.push("radio-" + this.skin + "-skin");
                    }
                    else {
                        classes.push("radio-main-skin");
                    }
                    if (this.disabled) {
                        classes.push("disabled");
                    }
                    return classes;
                }
            },
            methods: {
                setValue: function(e) {
                    if (!this.disabled) {
                        this.$emit('input', e);
                    }
                }
            },
            template: '<div class="cly-vue-radio" v-bind:class="topClasses">\n' +
                            '<div class="radio-wrapper">\n' +
                                '<div @click="setValue(item.value)" v-for="(item, i) in items" :key="i" :class="{\'selected\': value == item.value}" class="radio-button">\n' +
                                    '<div class="box"></div>\n' +
                                    '<div class="text">{{item.label}}</div>\n' +
                                    '<div class="description">{{item.description}}</div>\n' +
                                '</div>\n' +
                            '</div>\n' +
                        '</div>'
        }
    ));

    Vue.component("cly-generic-radio", countlyBaseComponent.extend(
        // @vue/component
        {
            props: {
                value: {required: true, default: -1, type: [ String, Number ]},
                items: {
                    required: true,
                    type: Array,
                    default: function() {
                        return [];
                    }
                },
                skin: { default: "main", type: String},
            },
            computed: {
                skinClass: function() {
                    if (["main", "light"].indexOf(this.skin) > -1) {
                        return "generic-radio-" + this.skin + "-skin";
                    }
                    return "generic-radio-main-skin";
                }
            },
            methods: {
                setValue: function(e) {
                    this.$emit('input', e);
                }
            },
            template: '<div class="cly-vue-generic-radio" v-bind:class="[skinClass]">\n' +
                            '<div class="generic-radio-wrapper">\n' +
                                '<div @click="setValue(item.value)" v-for="(item, i) in items" :key="i" :class="{\'selected\': value == item.value}">\n' +
                                    '<div class="button-area">\n' +
                                        '<div class="component"><component :is="item.cmp" /></div>\n' +
                                        '<div class="text">{{item.label}}</div>\n' +
                                    '</div>\n' +
                                '</div>\n' +
                            '</div>\n' +
                        '</div>'
        }
    ));

    Vue.component("cly-text-field", countlyBaseComponent.extend(
        // @vue/component
        {
            mixins: [
                _mixins.i18n
            ],
            props: {
                value: {required: true, type: [ String, Number ], default: ''},
                removable: {type: Boolean, default: false},
                removeText: {type: String, default: ''},
                disabled: {type: Boolean, default: false}
            },
            methods: {
                setValue: function(e) {
                    this.$emit('input', e);
                },
                removeMe: function() {
                    this.$emit('remove-me');
                }
            },
            computed: {
                defaultListeners: function() {
                    return objectWithoutProperties(this.$listeners, ["input"]);
                },
                innerRemoveText: function() {
                    if (this.removeText) {
                        return this.removeText;
                    }
                    return this.i18n("common.remove");
                }
            },
            template: '<div class="cly-vue-text-field">\n' +
                            '<div class="remove-button"\n' +
                                'v-if="removable && !disabled"\n' +
                                '@click="removeMe">\n' +
                                '{{innerRemoveText}}\n' +
                            '</div>\n' +
                            '<input type="text" class="input"\n' +
                                'v-on="defaultListeners" v-bind="$attrs"\n' +
                                'v-bind:value="value"\n' +
                                'v-bind:disabled="disabled"\n' +
                                'v-on:input="setValue($event.target.value)">\n' +
                        '</div>'
        }
    ));

    Vue.component("cly-check", countlyBaseComponent.extend(
        // @vue/component
        {
            props: {
                value: {default: false, type: Boolean},
                label: {type: String, default: ''},
                skin: { default: "switch", type: String},
                disabled: {type: Boolean, default: false}
            },
            computed: {
                topClasses: function() {
                    var classes = [];
                    if (["switch", "tick", "star"].indexOf(this.skin) > -1) {
                        classes.push("check-" + this.skin + "-skin");
                    }
                    else {
                        classes.push("check-switch-skin");
                    }
                    if (this.disabled) {
                        classes.push("disabled");
                    }
                    return classes;
                },
                labelClass: function() {
                    return this.getClass(this.value);
                }
            },
            methods: {
                setValue: function(e) {
                    if (!this.disabled) {
                        this.$emit('input', e);
                    }
                },
                getClass: function(value) {
                    var classes = ["check-label"];
                    if (this.skin === "tick") {
                        classes.push("fa");
                        if (value) {
                            classes.push("fa-check-square");
                        }
                        else {
                            classes.push("fa-square-o");
                        }
                    }
                    else if (this.skin === "star") {
                        classes.push("ion-icons");
                        if (value) {
                            classes.push("ion-android-star");
                        }
                        else {
                            classes.push("ion-android-star-outline");
                        }
                    }
                    return classes;
                }
            },
            template: '<div class="cly-vue-check" v-bind:class="topClasses">\n' +
                            '<div class="check-wrapper">\n' +
                                '<input type="checkbox" class="check-checkbox" :checked="value">\n' +
                                '<div v-bind:class="labelClass" @click.stop="setValue(!value)"></div>\n' +
                                '<span v-if="label" class="check-text" @click.stop="setValue(!value)">{{label}}</span>\n' +
                            '</div>\n' +
                        '</div>'
        }
    ));

    Vue.component("cly-check-list", countlyBaseComponent.extend(
        // @vue/component
        {
            props: {
                value: {
                    default: function() {
                        return [];
                    },
                    type: Array
                },
                items: {
                    default: function() {
                        return [];
                    },
                    type: Array
                },
                skin: { default: "switch", type: String}
            },
            computed: {
                uncompressed: function() {
                    return this.getUncompressed();
                }
            },
            methods: {
                getUncompressed: function() {
                    var self = this;
                    return this.items.map(function(item) {
                        return self.value.indexOf(item.value) > -1;
                    });
                },
                setValue: function(value, status) {
                    var self = this;
                    var newArray = null;
                    if (status && self.value.indexOf(value) === -1) {
                        newArray = self.value.slice();
                        newArray.push(value);
                    }
                    else if (!status && self.value.indexOf(value) > -1) {
                        newArray = self.value.slice().filter(function(item) {
                            return item !== value;
                        });
                    }
                    if (newArray) {
                        this.$emit('input', newArray);
                    }
                }
            },
            template: '<div class="cly-vue-check-list">\n' +
                            '<cly-check v-for="(item, i) in items" :key="i" v-bind:skin="skin" v-bind:label="item.label" v-bind:value="uncompressed[i]" v-on:input="setValue(item.value, $event)">\n' +
                            '</cly-check>\n' +
                        '</div>'
        }
    ));

    Vue.component("cly-button", countlyBaseComponent.extend(
        // @vue/component
        {
            props: {
                label: {type: String, default: ''},
                skin: { default: "green", type: String},
                disabled: {type: Boolean, default: false}
            },
            computed: {
                activeClasses: function() {
                    var classes = [this.skinClass];
                    if (this.disabled) {
                        classes.push("disabled");
                    }
                    return classes;
                },
                skinClass: function() {
                    if (["green", "light", "orange"].indexOf(this.skin) > -1) {
                        return "button-" + this.skin + "-skin";
                    }
                    return "button-light-skin";
                }
            },
            template: '<div class="cly-vue-button" v-bind:class="activeClasses" v-on="$listeners">{{label}}</div>'
        }
    ));

    Vue.component("cly-text-area", countlyBaseComponent.extend(
        // @vue/component
        {
            props: {
                value: {required: true, type: [ String, Number ], default: ''}
            },
            methods: {
                setValue: function(e) {
                    this.$emit('input', e);
                }
            },
            computed: {
                defaultListeners: function() {
                    return objectWithoutProperties(this.$listeners, ["input"]);
                }
            },
            template: '<textarea class="cly-vue-text-area"\n' +
                            'v-bind="$attrs"\n' +
                            'v-on="defaultListeners"\n' +
                            ':value="value"\n' +
                            '@input="setValue($event.target.value)">\n' +
                        '</textarea>'
        }
    ));

    Vue.component("cly-select-n", countlyBaseComponent.extend(
        // @vue/component
        {
            mixins: [
                _mixins.i18n
            ],
            props: {
                value: {
                    type: [Object, String, Number, Boolean],
                    default: function() {
                        return { name: "", value: null };
                    }
                },
                items: {
                    type: Array,
                    default: function() {
                        return [];
                    }
                },
                placeholder: { type: String, default: '' },
                dynamicItems: { type: Boolean, default: false },
                disabled: { type: Boolean, default: false },
                aligned: { type: String, default: "left" },
                skin: { type: String, default: 'default' },
                listDelayWarning: {type: String, default: null}
            },
            mounted: function() {
                $(this.$refs.scrollable).slimScroll({
                    height: '100%',
                    start: 'top',
                    wheelStep: 10,
                    position: 'right',
                    disableFadeOut: true
                });
            },
            data: function() {
                return {
                    tempSearchQuery: "", // in-sync search query value
                    searchQuery: "", // debounced search query value
                    navigatedIndex: null,
                    opened: false,
                    waitingItems: false,
                    hasFocus: false,
                    scroller: null
                };
            },
            computed: {
                selectedItem: function() {
                    return this.value;
                },
                searchable: function() {
                    return this.items.length > 10 || this.dynamicItems;
                },
                containerClasses: function() {
                    var classes = [];
                    if (this.opened) {
                        classes.push("active");
                    }
                    if (this.dynamicItems) {
                        classes.push("dynamic-items");
                    }
                    if (this.disabled) {
                        classes.push("disabled");
                    }
                    if (["default", "slim"].indexOf(this.skin) > -1) {
                        classes.push("select-" + this.skin + "-skin");
                    }
                    else {
                        classes.push("select-default-skin");
                    }
                    if (["left", "center", "right"].indexOf(this.aligned) > -1) {
                        classes.push("select-aligned-" + this.aligned);
                    }
                    else {
                        classes.push("select-aligned-left");
                    }
                    return classes;
                },
                dropClasses: function() {
                    var classes = ["drop"];
                    if (this.skin !== "slim") {
                        classes.push("combo");
                    }

                    return classes;
                },
                visibleItems: function() {
                    var self = this;
                    if (!this.dynamicItems && this.tempSearchQuery && this.tempSearchQuery !== "") {
                        var visible = this.items.map(function() {
                            return false;
                        });
                        var loweredQuery = self.tempSearchQuery.toLowerCase();
                        this.items.forEach(function(item, idx) {
                            if (Object.prototype.hasOwnProperty.call(item, "value")) {
                                if (item.name.toLowerCase().indexOf(loweredQuery) > -1) {
                                    visible[idx] = true;
                                    if (self.groupIndex[idx] > -1) {
                                        visible[self.groupIndex[idx]] = true;
                                    }
                                }
                            }
                        });
                        return this.items.filter(function(item, idx) {
                            return visible[idx];
                        });
                    }
                    else if (this.dynamicItems && this.waitingItems) {
                        // blocked for search event to complete
                        return [];
                    }
                    else {
                        return this.items;
                    }
                },
                groupIndex: function() {
                    var index = [],
                        currentGroup = -1,
                        self = this;

                    this.items.forEach(function(item, idx) {
                        if (self.isItemGroup(item)) {
                            currentGroup = idx;
                            index.push(-1);
                        }
                        else {
                            index.push(currentGroup);
                        }
                    });
                    return index;
                },
                isKeyboardNavAvailable: function() {
                    return this.opened && this.hasFocus;
                }
            },
            methods: {
                setItem: function(item) {
                    if (!this.isItemGroup(item)) {
                        this.$emit("input", item);
                        this.opened = false;
                    }
                },
                close: function() {
                    this.opened = false;
                },
                fireDynamicSearch: function() {
                    if (this.dynamicItems) {
                        this.waitingItems = true;
                        this.$emit("search", this.searchQuery);
                    }
                },
                toggle: function() {
                    if (!this.disabled) {
                        this.opened = !this.opened;
                    }
                },
                findItemByValue: function(value) {
                    var found = this.items.filter(function(item) {
                        return item.value === value;
                    });
                    if (found.length > 0) {
                        return found[0];
                    }
                    return null;
                },
                selectNavigatedElement: function() {
                    if (this.navigatedIndex !== null && this.navigatedIndex < this.visibleItems.length) {
                        this.setItem(this.visibleItems[this.navigatedIndex]);
                    }
                },
                setNavigatedIndex: function(navigatedIndex) {
                    this.navigatedIndex = navigatedIndex;
                },
                scrollToNavigatedIndex: function() {
                    var self = this,
                        $scrollable = $(self.$refs.scrollable);

                    if (self.navigatedIndex !== null && $scrollable) {
                        var y = ($scrollable.scrollTop() + $(self.$refs["tmpItemRef_" + self.navigatedIndex]).position().top) + "px";
                        $scrollable.slimScroll({scrollTo: y});
                    }
                },
                isItemGroup: function(element) {
                    if (!Object.prototype.hasOwnProperty.call(element, "value")) {
                        return true;
                    }
                    if (element.group) {
                        return true;
                    }
                    return false;
                },
                getNextNonGroupIndex: function(startFrom, direction) {
                    for (var offset = 0; offset < this.visibleItems.length; offset++) {
                        var current = (direction * offset + startFrom);
                        if (current < 0) {
                            current = this.visibleItems.length + current;
                        }
                        current = current % this.visibleItems.length;
                        if (!this.isItemGroup(this.visibleItems[current])) {
                            return current;
                        }
                    }
                },
                upKeyEvent: function() {
                    if (!this.isKeyboardNavAvailable) {
                        return;
                    }

                    if (this.navigatedIndex === null) {
                        this.navigatedIndex = this.visibleItems.length - 1;
                    }
                    else {
                        this.navigatedIndex = this.getNextNonGroupIndex(this.navigatedIndex - 1, -1);
                    }

                    this.scrollToNavigatedIndex();
                },
                downKeyEvent: function() {
                    if (!this.isKeyboardNavAvailable) {
                        return;
                    }

                    if (this.navigatedIndex === null) {
                        this.navigatedIndex = 0;
                    }
                    else {
                        this.navigatedIndex = this.getNextNonGroupIndex(this.navigatedIndex + 1, 1);
                    }

                    this.scrollToNavigatedIndex();
                },
                escKeyEvent: function() {
                    if (this.navigatedIndex === null && this.opened) {
                        this.close();
                        return;
                    }
                    else if (this.navigatedIndex !== null) {
                        this.navigatedIndex = null;
                    }
                },
                enterKeyEvent: function() {
                    if (this.navigatedIndex === null) {
                        return;
                    }

                    this.selectNavigatedElement();
                }
            },
            watch: {
                value: {
                    immediate: true,
                    handler: function(passedValue) {
                        if (typeof passedValue !== 'object') {
                            var item = this.findItemByValue(passedValue);
                            if (item) {
                                this.setItem(item);
                            }
                            else {
                                this.setItem({name: passedValue, value: passedValue});
                            }
                        }
                    }
                },
                opened: function(newValue) {
                    if (!newValue) {
                        this.tempSearchQuery = "";
                        this.searchQuery = "";
                        this.navigatedIndex = null;
                    }
                },
                tempSearchQuery: _.debounce(function(newVal) {
                    this.searchQuery = newVal;
                }, 500),
                searchQuery: function() {
                    this.fireDynamicSearch();
                },
                items: {
                    immediate: true,
                    handler: function() {
                        this.waitingItems = false;
                    }
                },
                visibleItems: function() {
                    this.navigatedIndex = null; // reset navigation on visible items change
                }
            },
            template: '<div class="cly-vue-select"\n' +
                            'v-bind:class="containerClasses"\n' +
                            'v-click-outside="close"\n' +
                            '@keydown.up.prevent="upKeyEvent"\n' +
                            '@keydown.down.prevent="downKeyEvent"\n' +
                            '@keydown.esc="escKeyEvent"\n' +
                            '@keydown.enter="enterKeyEvent">\n' +
                            '<div class="select-inner" @click="toggle">\n' +
                                '<div class="text-container">\n' +
                                    '<div v-if="selectedItem" class="text">\n' +
                                        '<span>{{selectedItem.name}}</span>\n' +
                                    '</div>\n' +
                                    '<div v-if="!selectedItem" class="text">\n' +
                                        '<span class="text-light-gray">{{placeholder}}</span>\n' +
                                    '</div>\n' +
                                '</div>\n' +
                                '<div :class="dropClasses"></div>\n' +
                            '</div>\n' +
                            '<div class="search" v-if="searchable" v-show="opened">\n' +
                                '<div class="inner">\n' +
                                '<input type="search"\n' +
                                    '@focus="hasFocus = true"\n' +
                                    'v-model="tempSearchQuery"/>\n' +
                                '<i class="fa fa-search"></i>\n' +
                                '</div>\n' +
                            '</div>\n' +
                            '<div class="items-list square" v-show="opened">\n' +
                                '<div ref="scrollable" class="scrollable">\n' +
                                    '<div class="warning" v-if="dynamicItems && listDelayWarning">{{ listDelayWarning }}</div>\n' +
                                    '<div v-for="(item, i) in visibleItems" :key="i"\n' +
                                        '@mouseover="setNavigatedIndex(i)"\n' +
                                        '@mouseleave="setNavigatedIndex(null)"\n' +
                                        '@click="setItem(item)"\n' +
                                        ':ref="\'tmpItemRef_\' + i"\n' +
                                        ':class="{item: !isItemGroup(item), group : isItemGroup(item), navigated: i === navigatedIndex}">\n' +
                                        '<div v-if="isItemGroup(item)">\n' +
                                            '<span v-text="item.name"></span>\n' +
                                        '</div>\n' +
                                        '<div v-else v-bind:data-value="item.value">\n' +
                                            '<span v-text="item.name"></span>\n' +
                                        '</div>\n' +
                                    '</div>\n' +
                                '</div>\n' +
                            '</div>\n' +
                        '</div>'
        }
    ));

    Vue.component("cly-dropzone", window.vue2Dropzone);

    var AbstractListBox = countlyVue.components.BaseComponent.extend({
        props: {
            options: {type: Array},
            bordered: {type: Boolean, default: true}
        },
        methods: {
            navigateOptions: function() {
                if (!this.visible) {
                    this.visible = true;
                }
            },
            handleItemClick: function(option) {
                this.$emit("input", option.value);
                this.$emit("change", option.value);
            },
            handleItemHover: function(option) {
                this.hovered = option.value;
            },
            handleBlur: function() {
                this.hovered = this.value;
                this.focused = false;
            },
            handleHover: function() {
                this.focused = true;
            }
        },
        data: function() {
            return {
                hovered: null,
                focused: false
            };
        }
    });

    Vue.component("cly-listbox", AbstractListBox.extend({
        props: {
            value: { type: [String, Number] }
        },
        template: '<div\
                    class="cly-vue-listbox"\
                    tabindex="0"\
                    :class="{ \'is-focus\': focused, \'cly-vue-listbox--bordered\': bordered }"\
                    @mouseenter="handleHover"\
                    @mouseleave="handleBlur"\
                    @focus="handleHover"\
                    @blur="handleBlur">\
                    <el-scrollbar\
                        v-if="options.length > 0"\
                        tag="ul"\
                        wrap-class="el-select-dropdown__wrap"\
                        view-class="el-select-dropdown__list">\
                        <li\
                            tabindex="0"\
                            class="el-select-dropdown__item"\
                            :class="{\'selected\': value === option.value, \'hover\': hovered === option.value}"\
                            :key="option.value"\
                            @focus="handleItemHover(option)"\
                            @mouseenter="handleItemHover(option)"\
                            @keyup.enter="handleItemClick(option)"\
                            @click.stop="handleItemClick(option)"\
                            v-for="option in options">\
                            <span>{{option.label}}</span>\
                        </li>\
                    </el-scrollbar>\
                    <div v-else class="cly-vue-listbox__no-data">\
                        No data\
                    </div>\
                </div>'
    }));

    Vue.component("cly-checklistbox", AbstractListBox.extend({
        props: {
            value: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            sortable: {
                type: Boolean,
                default: false
            }
        },
        data: function() {
            return {
                sortMap: null
            };
        },
        watch: {
            options: {
                immediate: true,
                handler: function(options) {
                    if (this.sortable && !this.sortMap) {
                        this.sortMap = Object.freeze(options.reduce(function(acc, opt, idx) {
                            acc[opt.value] = idx;
                            return acc;
                        }, {}));
                    }
                }
            }
        },
        methods: {
            computeSortedOptions: function() {
                if (!this.sortable || !this.sortMap) {
                    return this.options;
                }
                var sortMap = this.sortMap,
                    wrapped = this.options.map(function(opt, idx) {
                        return { opt: opt, idx: idx, ord: sortMap[opt.value] || 0 };
                    });

                wrapped.sort(function(a, b) {
                    return (a.ord - b.ord) || (a.idx - b.idx);
                });

                return wrapped.map(function(item) {
                    return item.opt;
                });
            }
        },
        computed: {
            innerValue: {
                get: function() {
                    return this.value;
                },
                set: function(newVal) {
                    if (this.sortable && this.sortMap) {
                        var sortMap = this.sortMap,
                            wrapped = newVal.map(function(value, idx) {
                                return { value: value, idx: idx, ord: sortMap[value] || 0 };
                            });

                        wrapped.sort(function(a, b) {
                            return (a.ord - b.ord) || (a.idx - b.idx);
                        });

                        var sorted = wrapped.map(function(item) {
                            return item.value;
                        });
                        this.$emit("input", sorted);
                        this.$emit("change", sorted);
                    }
                    else {
                        this.$emit("input", newVal);
                        this.$emit("change", newVal);
                    }
                }
            },
            sortedOptions: {
                get: function() {
                    return this.computeSortedOptions();
                },
                set: function(sorted) {
                    if (!this.sortable) {
                        return;
                    }
                    this.sortMap = Object.freeze(sorted.reduce(function(acc, opt, idx) {
                        acc[opt.value] = idx;
                        return acc;
                    }, {}));
                    this.innerValue = this.value; // triggers innerValue.set
                    this.$emit('update:options', this.computeSortedOptions());
                }
            }
        },
        template: '<div\
                    class="cly-vue-listbox"\
                    tabindex="0"\
                    :class="{ \'is-focus\': focused, \'cly-vue-listbox--bordered\': bordered }"\
                    @mouseenter="handleHover"\
                    @mouseleave="handleBlur"\
                    @focus="handleHover"\
                    @blur="handleBlur">\
                    <el-scrollbar\
                        v-if="options.length > 0"\
                        tag="ul"\
                        wrap-class="el-select-dropdown__wrap"\
                        view-class="el-select-dropdown__list">\
                        <el-checkbox-group\
                            v-model="innerValue">\
                            <draggable \
                                handle=".drag-handler"\
                                v-model="sortedOptions"\
                                :options="{disabled: !sortable}">\
                            <li\
                                class="el-select-dropdown__item"\
                                :key="option.value"\
                                v-for="option in sortedOptions">\
                                <div v-if="sortable" class="drag-handler"><img src="images/drill/drag-icon.svg" /></div>\
                                <el-checkbox :label="option.value" :key="option.value">{{option.label}}</el-checkbox>\
                            </li>\
                            </draggable>\
                        </el-checkbox-group>\
                    </el-scrollbar>\
                    <div v-else class="cly-vue-listbox__no-data">\
                        No data\
                    </div>\
                </div>'
    }));

    var TabbedOptionsMixin = {
        props: {
            options: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            hideDefaultTabs: {type: Boolean, default: false},
            allPlaceholder: {type: String, default: 'All'},
            hideAllOptionsTab: {type: Boolean, default: false}
        },
        data: function() {
            return {
                activeTabId: null
            };
        },
        computed: {
            hasAllOptionsTab: function() {
                if (this.hideAllOptionsTab || this.mode === "multi-check-sortable") {
                    return false;
                }
                return true;
            },
            hasTabs: function() {
                if (!this.options || !this.options.length) {
                    return false;
                }
                return !!this.options[0].options;
            },
            publicTabs: function() {
                if (this.hasTabs && this.hasAllOptionsTab) {
                    var allOptions = {
                        name: "__all",
                        label: this.allPlaceholder,
                        options: this.flatOptions
                    };
                    return [allOptions].concat(this.options);
                }
                else if (this.hasTabs) {
                    return this.options;
                }
                return [{
                    name: "__root",
                    label: "__root",
                    options: this.options
                }];
            },
            flatOptions: function() {
                if (!this.hasTabs || !this.options.length) {
                    return this.options;
                }
                return this.options.reduce(function(items, tab) {
                    return items.concat(tab.options);
                }, []);
            },
            val2tab: function() {
                if (!this.publicTabs.length) {
                    return {};
                }
                return this.publicTabs.reduce(function(items, tab) {
                    tab.options.forEach(function(opt) {
                        items[opt.value] = tab.name;
                    });
                    return items;
                }, {});
            },
            selectedOptions: function() {
                if (!this.flatOptions.length) {
                    return {};
                }
                var self = this;
                if (Array.isArray(this.value)) {
                    return this.flatOptions.filter(function(item) {
                        return self.value.indexOf(item.value) > -1;
                    });
                }
                else {
                    var matching = this.flatOptions.filter(function(item) {
                        return item.value === self.value;
                    });
                    if (matching.length) {
                        return matching[0];
                    }
                }
                return {};
            }
        },
        methods: {
            updateTabFn: function(tabId) {
                this.activeTabId = tabId;
            },
            determineActiveTabId: function() {
                var self = this;
                this.$nextTick(function() {
                    if (!self.hasTabs) {
                        self.activeTabId = "__root";
                    }
                    else if (self.value && self.val2tab[self.value]) {
                        self.activeTabId = self.val2tab[self.value];
                    }
                    else if (this.hasAllOptionsTab) {
                        self.activeTabId = "__all";
                    }
                    else if (!self.activeTabId || self.activeTabId === "__all" || self.activeTabId === "__root") {
                        self.activeTabId = self.publicTabs[0].name;
                    }
                });
            },
        },
        watch: {
            hasAllOptionsTab: function() {
                this.determineActiveTabId();
            }
        }
    };

    var SearchableOptionsMixin = {
        props: {
            searchDisabled: {type: Boolean, default: false},
            searchPlaceholder: {type: String, default: 'Search'}
        },
        data: function() {
            return {
                searchQuery: ''
            };
        },
        methods: {
            getMatching: function(options) {
                if (!this.searchQuery || this.searchDisabled) {
                    return options;
                }
                var self = this;
                var query = self.searchQuery.toLowerCase();
                return options.filter(function(option) {
                    return option.label.toLowerCase().indexOf(query) > -1;
                });
            }
        }
    };

    Vue.component("cly-select-x", countlyVue.components.BaseComponent.extend({
        mixins: [TabbedOptionsMixin, SearchableOptionsMixin, _mixins.i18n],
        template: '<cly-dropdown\
                        class="cly-vue-select-x"\
                        ref="dropdown"\
                        :width="width"\
                        :placeholder="placeholder"\
                        :disabled="disabled"\
                        v-bind="$attrs"\
                        v-on="$listeners"\
                        @show="handleDropdownShow"\
                        @hide="focusOnTrigger">\
                        <template v-slot:trigger="dropdown">\
                            <slot name="trigger">\
                                <cly-input-dropdown-trigger\
                                    ref="trigger"\
                                    :size="size"\
                                    :disabled="disabled"\
                                    :adaptive-length="adaptiveLength"\
                                    :focused="dropdown.focused"\
                                    :opened="dropdown.visible"\
                                    :placeholder="placeholder"\
                                    :selected-options="selectedOptions">\
                                </cly-input-dropdown-trigger>\
                            </slot>\
                        </template>\
                        <div class="cly-vue-select-x__pop" :class="{\'cly-vue-select-x__pop--hidden-tabs\': hideDefaultTabs || !hasTabs }">\
                            <div class="cly-vue-select-x__header">\
                                <div class="cly-vue-select-x__title" v-if="title">{{title}}</div>\
                                <div class="cly-vue-select-x__header-slot" v-if="!!$scopedSlots.header">\
                                    <slot name="header" :active-tab-id="activeTabId" :tabs="publicTabs" :update-tab="updateTabFn"></slot>\
                                </div>\
                                <el-input\
                                    v-if="!searchDisabled"\
                                    ref="searchBox"\
                                    v-model="searchQuery"\
                                    @keydown.native.esc.stop.prevent="doClose" \
                                    :placeholder="searchPlaceholder">\
                                    <i slot="prefix" class="el-input__icon el-icon-search"></i>\
                                </el-input>\
                            </div>\
                            <el-tabs\
                                v-model="activeTabId"\
                                @keydown.native.esc.stop.prevent="doClose">\
                                <el-tab-pane :name="tab.name" :key="tab.name" v-for="tab in publicTabs">\
                                    <span slot="label">\
                                        {{tab.label}}\
                                    </span>\
                                    <cly-listbox\
                                        v-if="mode === \'single-list\'"\
                                        :bordered="false"\
                                        :options="getMatching(tab.options)"\
                                        @change="handleValueChange"\
                                        v-model="innerValue">\
                                    </cly-listbox>\
                                    <cly-checklistbox\
                                        v-else-if="mode === \'multi-check\'"\
                                        :bordered="false"\
                                        :options="getMatching(tab.options)"\
                                        @change="handleValueChange"\
                                        v-model="innerValue">\
                                    </cly-checklistbox>\
                                    <cly-checklistbox\
                                        v-else-if="mode === \'multi-check-sortable\'"\
                                        :sortable="true"\
                                        :bordered="false"\
                                        :options="getMatching(tab.options)"\
                                        @change="handleValueChange"\
                                        v-model="innerValue">\
                                    </cly-checklistbox>\
                                </el-tab-pane>\
                            </el-tabs>\
                            <div class="cly-vue-select-x__footer" v-if="!autoCommit">\
                                <div class="cly-vue-select-x__commit-section">\
                                    <el-button @click="doDiscard" size="small">{{ i18n("common.cancel") }}</el-button>\
                                    <el-button @click="doCommit" type="primary" size="small">{{ i18n("common.confirm") }}</el-button>\
                                </div>\
                            </div>\
                        </div>\
                    </cly-dropdown>',
        props: {
            title: {type: String, default: ''},
            placeholder: {type: String, default: 'Select'},
            value: { type: [String, Number, Array] },
            mode: {type: String, default: 'single-list'}, // multi-check,
            autoCommit: {type: Boolean, default: true},
            disabled: { type: Boolean, default: false},
            width: { type: [Number, Object], default: 400},
            size: {type: String, default: ''},
            adaptiveLength: {type: Boolean, default: false}
        },
        data: function() {
            return {
                uncommittedValue: null
            };
        },
        computed: {
            innerValue: {
                get: function() {
                    if (this.uncommittedValue && this.uncommittedValue !== this.value) {
                        return this.uncommittedValue;
                    }
                    return this.value;
                },
                set: function(newVal) {
                    if (this.autoCommit) {
                        this.$emit("input", newVal);
                        this.$emit("change", newVal);
                    }
                    else {
                        this.uncommittedValue = newVal;
                    }
                }
            }
        },
        mounted: function() {
            this.determineActiveTabId();
        },
        methods: {
            handleValueChange: function() {
                if (this.mode === 'single-list' && this.autoCommit) {
                    this.doClose();
                }
            },
            doClose: function() {
                this.determineActiveTabId();
                this.$refs.dropdown.handleClose();
            },
            updateDropdown: function() {
                this.$refs.dropdown.updateDropdown();
            },
            handleDropdownShow: function() {
                this.$forceUpdate();
                this.focusOnSearch();
            },
            focusOnSearch: function() {
                var self = this;
                this.$nextTick(function() {
                    self.$refs.searchBox.focus();
                });
            },
            focusOnTrigger: function() {
                var self = this;
                if (this.$refs.trigger && this.$refs.trigger.focus()) {
                    this.$nextTick(function() {
                        self.$refs.trigger.focus();
                    });
                }
            },
            doCommit: function() {
                if (this.uncommittedValue) {
                    this.$emit("input", this.uncommittedValue);
                    this.$emit("change", this.uncommittedValue);
                    this.uncommittedValue = null;
                }
                this.doClose();
            },
            doDiscard: function() {
                this.uncommittedValue = null;
                this.doClose();
            }
        },
        watch: {
            searchQuery: function() {
                this.updateDropdown();
            },
            activeTabId: function() {
                this.updateDropdown();
            },
            value: function() {
                this.uncommittedValue = null;
            }
        }
    }));

}(window.countlyVue = window.countlyVue || {}, jQuery));
