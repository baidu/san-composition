describe('defineComponent', () => {
    // TODO:
    return;
    it("dispatch should pass message up, util the first component which recieve it", function (done) {
        var Select = defineComponent(() => {
            template('<ul><slot></slot></ul>');

            messages({
                'UI:select-item-selected': function (arg) {
                    var value = arg.value;
                    this.data.set('value', value);

                    var len = this.items.length;
                    while (len--) {
                        this.items[len].data.set('selectValue', value);
                    }
                },

                'UI:select-item-attached': function (arg) {
                    this.items.push(arg.target);
                    arg.target.data.set('selectValue', this.data.get('value'));
                },

                'UI:select-item-detached': function (arg) {
                    var len = this.items.length;
                    while (len--) {
                        if (this.items[len] === arg.target) {
                            this.items.splice(len, 1);
                        }
                    }
                }
            });

            onInited(function () {
                this.items = [];
            });
        });

        var selectValue;
        var item;
        var SelectItem = defineComponent(() => {
            template('<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>');

            method({
                select: function () {
                    var value = this.data.get('value');
                    this.dispatch('UI:select-item-selected', value);
                    selectValue = value;
                }
            });

            onAttached(function () {
                item = this.el;
                this.dispatch('UI:select-item-attached');
            });

            onDetached(function () {
                this.dispatch('UI:select-item-detached');
            });
        });

        var MyComponent = defineComponent(() => {
            components({
                'ui-select': Select,
                'ui-selectitem': SelectItem
            });

            template('<div><ui-select value="{=v=}">'
                + '<ui-selectitem value="1">one</ui-selectitem>'
                + '<ui-selectitem value="2">two</ui-selectitem>'
                + '<ui-selectitem value="3">three</ui-selectitem>'
                + '</ui-select>please click to select a item<b title="{{v}}">{{v}}</b></div>'
            );

            messages({
                'UI:select-item-selected': function () {
                    expect(false).toBeTruthy();
                },

                'UI:select-item-attached': function () {
                    expect(false).toBeTruthy();
                },

                'UI:select-item-detached': function () {
                    expect(false).toBeTruthy();
                }
            });
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        function detectDone() {
            if (selectValue) {
                expect(wrap.getElementsByTagName('b')[0].title).toBe(selectValue);

                myComponent.dispose();
                document.body.removeChild(wrap);
                done();
                return;
            }

            setTimeout(detectDone, 500);
        }

        detectDone();
        triggerEvent(item, 'click');

    });

    // it("messages static property", function (done) {
    //     var Select = defineComponent(() => {
    //         template('<ul><slot></slot></ul>');

    //         onInited(function () {
    //             this.items = [];
    //         });
    //     });

    //     Select.messages = {
    //         'UI:select-item-selected': function (arg) {
    //             var value = arg.value;
    //             this.data.set('value', value);

    //             var len = this.items.length;
    //             while (len--) {
    //                 this.items[len].data.set('selectValue', value);
    //             }
    //         },

    //         'UI:select-item-attached': function (arg) {
    //             this.items.push(arg.target);
    //             arg.target.data.set('selectValue', this.data.get('value'));
    //         },

    //         'UI:select-item-detached': function (arg) {
    //             var len = this.items.length;
    //             while (len--) {
    //                 if (this.items[len] === arg.target) {
    //                     this.items.splice(len, 1);
    //                 }
    //             }
    //         }
    //     };

    //     var selectValue;
    //     var item;
    //     var SelectItem = defineComponent(() => {
    //         template('<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>',

    //         select: function () {
    //             var value = this.data.get('value');
    //             this.dispatch('UI:select-item-selected', value);
    //             selectValue = value;
    //         },

    //         attached: function () {
    //             item = this.el;
    //             this.dispatch('UI:select-item-attached');
    //         },

    //         detached: function () {
    //             this.dispatch('UI:select-item-detached');
    //         }
    //     });

    //     var MyComponent = defineComponent(() => {
    //         components: {
    //             'ui-select': Select,
    //             'ui-selectitem': SelectItem
    //         },

    //         template('<div><ui-select value="{=v=}">'
    //             + '<ui-selectitem value="1">one</ui-selectitem>'
    //             + '<ui-selectitem value="2">two</ui-selectitem>'
    //             + '<ui-selectitem value="3">three</ui-selectitem>'
    //             + '</ui-select>please click to select a item<b title="{{v}}">{{v}}</b></div>');
    //     });

    //     MyComponent.messages = {
    //         'UI:select-item-selected': function () {
    //             expect(false).toBeTruthy();
    //         },

    //         'UI:select-item-attached': function () {
    //             expect(false).toBeTruthy();
    //         },

    //         'UI:select-item-detached': function () {
    //             expect(false).toBeTruthy();
    //         }
    //     };

    //     var myComponent = new MyComponent();
    //     var wrap = document.createElement('div');
    //     document.body.appendChild(wrap);
    //     myComponent.attach(wrap);

    //     function detectDone() {
    //         if (selectValue) {
    //             expect(wrap.getElementsByTagName('b')[0].title).toBe(selectValue);

    //             myComponent.dispose();
    //             document.body.removeChild(wrap);
    //             done();
    //             return;
    //         }

    //         setTimeout(detectDone, 500);
    //     }

    //     detectDone();
    //     triggerEvent(item, 'click');

    // });

    it("message * would receive all message", function (done) {
        var selectMessageX;
        var justtestReceived;
        var Select = defineComponent(() => {
            template('<ul><slot></slot></ul>');

            messages({
                'UI:select-item-selected': function (arg) {
                    var value = arg.value;
                    this.data.set('value', value);

                    var len = this.items.length;
                    while (len--) {
                        this.items[len].data.set('selectValue', value);
                    }
                },

                'UI:select-item-attached': function (arg) {
                    this.items.push(arg.target);
                    arg.target.data.set('selectValue', this.data.get('value'));
                },

                'UI:select-item-detached': function (arg) {
                    var len = this.items.length;
                    while (len--) {
                        if (this.items[len] === arg.target) {
                            this.items.splice(len, 1);
                        }
                    }
                },

                '*': function (arg) {
                    selectMessageX = true;
                    expect(arg.name.indexOf('justtest')).toBe(0);
                    if (arg.name.indexOf('stop') === -1) {
                        this.dispatch(arg.name);
                    }
                }
            });

            onInited(function () {
                this.items = [];
            });
        });

        var selectValue;
        var item;
        var SelectItem = defineComponent(() => {
            template('<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>');

            method({
                select: function () {
                    var value = this.data.get('value');
                    this.dispatch('UI:select-item-selected', value);
                    this.dispatch('justtest', value);
                    selectValue = value;
                }
            });

            onAttached(function () {
                item = this.el;
                this.dispatch('UI:select-item-attached');
            });

            onDetached(function () {
                this.dispatch('UI:select-item-detached');
            });
        });

            var MyComponent = defineComponent(() => {
                components({
                    'ui-select': Select,
                    'ui-selectitem': SelectItem
                });

                template('<div><ui-select value="{=v=}">'
                    + '<ui-selectitem value="1">one</ui-selectitem>'
                    + '<ui-selectitem value="2">two</ui-selectitem>'
                    + '<ui-selectitem value="3">three</ui-selectitem>'
                    + '</ui-select>please click to select a item<b title="{{v}}">{{v}}</b></div>');

                messages({
                    'UI:select-item-selected': function () {
                        expect(false).toBeTruthy();
                    },

                    'UI:select-item-attached': function () {
                        expect(false).toBeTruthy();
                    },

                    'UI:select-item-detached': function () {
                        expect(false).toBeTruthy();
                    },

                    'justtest': function () {
                        justtestReceived = true;
                    },

                    'justteststop': function () {
                        expect(false).toBeTruthy();
                    }
                });
            });

            var myComponent = new MyComponent();
            var wrap = document.createElement('div');
            document.body.appendChild(wrap);
            myComponent.attach(wrap);

            function detectDone() {
                if (selectValue) {
                    expect(wrap.getElementsByTagName('b')[0].title).toBe(selectValue);
                    expect(selectMessageX).toBeTruthy();
                    expect(justtestReceived).toBeTruthy();

                    myComponent.dispose();
                    document.body.removeChild(wrap);
                    done();
                    return;
                }

                setTimeout(detectDone, 500);
            }

            detectDone();
            triggerEvent(item, 'click');

        });
    });