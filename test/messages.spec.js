describe('[messages]: ', () => {
    it("dispatch should pass message up, util the first component which recieve it", function (done) {
        let Select = defineComponent(context => {
            template('<ul><slot></slot></ul>');

            messages({
                'UI:select-item-selected': function (arg) {
                    let value = arg.value;
                    context.component.data.set('value', value);

                    let len = context.items.length;
                    while (len--) {
                        context.items[len].data.set('selectValue', value);
                    }
                },

                'UI:select-item-attached': function (arg) {
                    context.items.push(arg.target);
                    arg.target.data.set('selectValue', context.component.data.get('value'));
                },

                'UI:select-item-detached': function (arg) {
                    let len = context.items.length;
                    while (len--) {
                        if (context.items[len] === arg.target) {
                            context.items.splice(len, 1);
                        }
                    }
                }
            });

            onInited(function () {
                context.items = [];
            });
        });

        let selectValue;
        let item;
        let SelectItem = defineComponent(context => {
            template('<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>');

            method({
                select: function () {
                    let value = context.component.data.get('value');
                    context.dispatch('UI:select-item-selected', value);
                    selectValue = value;
                }
            });

            onAttached(function () {
                item = context.component.el;
                context.dispatch('UI:select-item-attached');
            });

            onDetached(function () {
                context.dispatch('UI:select-item-detached');
            });
        });

        let MyComponent = defineComponent(() => {
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

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
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

    it("messages static property", function (done) {
        let Select = defineComponent(context => {
            template('<ul><slot></slot></ul>');

            onInited(function () {
                context.items = [];
            });

            messages({
                'UI:select-item-selected': function (arg) {
                    let value = arg.value;
                    context.component.data.set('value', value);
    
                    let len = context.items.length;
                    while (len--) {
                        context.items[len].data.set('selectValue', value);
                    }
                },
    
                'UI:select-item-attached': function (arg) {
                    context.items.push(arg.target);
                    arg.target.data.set('selectValue', context.component.data.get('value'));
                },
    
                'UI:select-item-detached': function (arg) {
                    let len = context.items.length;
                    while (len--) {
                        if (context.items[len] === arg.target) {
                            context.items.splice(len, 1);
                        }
                    }
                }
            });
        });

        let selectValue;
        let item;
        let SelectItem = defineComponent(context => {
            template('<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>');

            method('select', function () {
                let value = context.component.data.get('value');
                context.dispatch('UI:select-item-selected', value);
                selectValue = value;
            });

            onAttached(function () {
                item = context.component.el;
                context.dispatch('UI:select-item-attached');
            });

            onDetached(function () {
                context.dispatch('UI:select-item-detached');
            });
        });

        let MyComponent = defineComponent(() => {
            components({
                'ui-select': Select,
                'ui-selectitem': SelectItem
            });

            template(
                '<div><ui-select value="{=v=}">'
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

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
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

    it("message * would receive all message", function (done) {
        let selectMessageX;
        let justtestReceived;
        let Select = defineComponent(context => {
            template('<ul><slot></slot></ul>');

            messages({
                'UI:select-item-selected': function (arg) {
                    let value = arg.value;
                    context.component.data.set('value', value);

                    let len = context.items.length;
                    while (len--) {
                        context.items[len].data.set('selectValue', value);
                    }
                },

                'UI:select-item-attached': function (arg) {
                    context.items.push(arg.target);
                    arg.target.data.set('selectValue', context.component.data.get('value'));
                },

                'UI:select-item-detached': function (arg) {
                    let len = context.items.length;
                    while (len--) {
                        if (context.items[len] === arg.target) {
                            context.items.splice(len, 1);
                        }
                    }
                },

                '*': function (arg) {
                    selectMessageX = true;
                    expect(arg.name.indexOf('justtest')).toBe(0);
                    if (arg.name.indexOf('stop') === -1) {
                        context.dispatch(arg.name);
                    }
                }
            });

            onInited(function () {
                context.items = [];
            });
        });

        let selectValue;
        let item;
        let SelectItem = defineComponent(context => {
            template('<li on-click="select" style="{{value === selectValue ? \'border: 1px solid red\' : \'\'}}"><slot></slot></li>');

            method({
                select: function () {
                    let value = context.component.data.get('value');
                    context.dispatch('UI:select-item-selected', value);
                    context.dispatch('justtest', value);
                    selectValue = value;
                }
            });

            onAttached(function () {
                item = context.component.el;
                context.dispatch('UI:select-item-attached');
            });

            onDetached(function () {
                context.dispatch('UI:select-item-detached');
            });
        });

        let MyComponent = defineComponent(() => {
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

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
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
