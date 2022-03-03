describe('[life cycle]: ', () => {
    it('life cycle', () => {
        let mainConstruct = 0;
        let mainInited = 0;
        let mainCreated = 0;
        let mainAttached = 0;
        let mainDetached = 0;
        let mainDisposed = 0;
        let labelConstruct = 0;
        let labelInited = 0;
        let labelCreated = 0;
        let labelAttached = 0;
        let labelDetached = 0;
        let labelDisposed = 0;

        const Label = defineComponent(() => {
            template('<span title="{{text}}">{{text}}</span>');

            onConstruct(function () {
                labelConstruct++;
            });

            onInited(() => {
                labelInited++;
            });

            onCreated(() => {
                labelCreated++;
            });

            onAttached(() => {
                labelAttached++;
                labelDetached = 0;
            });

            onDetached(() => {
                labelDetached++;
                labelAttached = 0;
            });

            onDisposed(() => {
                labelDisposed++;
            });
        });


        const MyComponent = defineComponent(() => {
            components({
                'ui-label': Label
            });

            template('<div title="{{color}}"><ui-label text="{{color}}"/>{{color}}</div>');

            onConstruct(function () {
                mainConstruct++;
            });

            onInited(function () {
                mainInited++;
            });

            onCreated(function () {
                mainCreated++;
            });

            onAttached(function () {
                mainAttached++;
                mainDetached = 0;
            });

            onDetached(function () {
                mainDetached++;
                mainAttached = 0;
            });

            onDisposed(function () {
                mainDisposed++;
            });
        });

        let myComponent = new MyComponent();
        expect(myComponent.lifeCycle.is('inited')).toBeTruthy();
        expect(myComponent.lifeCycle.is('created')).toBeFalsy();
        expect(myComponent.lifeCycle.is('attached')).toBeFalsy();
        expect(mainConstruct).toBe(1);
        expect(mainInited).toBe(1);
        expect(mainCreated).toBe(0);
        expect(mainAttached).toBe(0);
        expect(labelConstruct).toBe(0);
        expect(labelInited).toBe(0);

        myComponent.data.set('color', 'green');

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);
        expect(myComponent.lifeCycle.is('inited')).toBeTruthy();
        expect(myComponent.lifeCycle.is('created')).toBeTruthy();
        expect(myComponent.lifeCycle.is('attached')).toBeTruthy();
        expect(mainConstruct).toBe(1);
        expect(mainInited).toBe(1);
        expect(mainCreated).toBe(1);
        expect(mainAttached).toBe(1);
        expect(mainDetached).toBe(0);

        expect(labelConstruct).toBe(1);
        expect(labelInited).toBe(1);
        expect(labelCreated).toBe(1);
        expect(labelAttached).toBe(1);
        expect(labelDetached).toBe(0);

        expect(myComponent.nextTick).toBe(san.nextTick);

        myComponent.detach();
        expect(myComponent.lifeCycle.is('created')).toBeTruthy();
        expect(myComponent.lifeCycle.is('attached')).toBeFalsy();
        expect(myComponent.lifeCycle.is('detached')).toBeTruthy();
        expect(mainCreated).toBe(1);
        expect(mainDetached).toBe(1);
        expect(mainAttached).toBe(0);
        expect(labelInited).toBe(1);
        expect(labelCreated).toBe(1);
        expect(labelAttached).toBe(1);
        expect(labelDetached).toBe(0);

        myComponent.detach();
        expect(myComponent.lifeCycle.is('created')).toBeTruthy();
        expect(myComponent.lifeCycle.is('attached')).toBeFalsy();
        expect(myComponent.lifeCycle.is('detached')).toBeTruthy();
        expect(mainCreated).toBe(1);
        expect(mainDetached).toBe(1);
        expect(mainAttached).toBe(0);
        expect(labelInited).toBe(1);
        expect(labelCreated).toBe(1);
        expect(labelAttached).toBe(1);
        expect(labelDetached).toBe(0);

        myComponent.attach(wrap);
        expect(myComponent.lifeCycle.is('created')).toBeTruthy();
        expect(myComponent.lifeCycle.is('attached')).toBeTruthy();
        expect(myComponent.lifeCycle.is('detached')).toBeFalsy();
        expect(mainCreated).toBe(1);
        expect(mainDetached).toBe(0);
        expect(mainAttached).toBe(1);
        expect(labelInited).toBe(1);
        expect(labelCreated).toBe(1);
        expect(labelAttached).toBe(1);
        expect(labelDetached).toBe(0);


        myComponent.dispose();
        expect(myComponent.lifeCycle.is('inited')).toBeFalsy();
        expect(myComponent.lifeCycle.is('created')).toBeFalsy();
        expect(myComponent.lifeCycle.is('attached')).toBeFalsy();
        expect(myComponent.lifeCycle.is('detached')).toBeFalsy();
        expect(myComponent.lifeCycle.is('disposed')).toBeTruthy();
        expect(mainDisposed).toBe(1);
        expect(labelDisposed).toBe(1);
        expect(mainDetached).toBe(1);
        expect(labelDetached).toBe(1);

        document.body.removeChild(wrap);

        // dispose a unattach component
        let myComponent2 = new MyComponent();
        expect(myComponent2.lifeCycle.is('inited')).toBeTruthy();
        expect(myComponent2.lifeCycle.is('created')).toBeFalsy();
        expect(myComponent2.lifeCycle.is('disposed')).toBeFalsy();
        myComponent2.dispose();

        expect(myComponent2.lifeCycle.is('inited')).toBeFalsy();
        expect(myComponent2.lifeCycle.is('created')).toBeFalsy();
        expect(myComponent2.lifeCycle.is('attached')).toBeFalsy();
        expect(myComponent2.lifeCycle.is('detached')).toBeFalsy();
        expect(myComponent2.lifeCycle.is('disposed')).toBeTruthy();
    });

    it("life cycle and event", function () {
        let phases = {};

        let Label = defineComponent(context => {
            template('<span>test</span>');

            onInited(function () {
                context.fire('phase', 'inited');
            });

            onCreated(function () {
                context.fire('phase', 'created');
            });

            onAttached(function () {
                context.fire('phase', 'attached');
            });

            onDetached(function () {
                context.fire('phase', 'detached');
            });
        });

        let MyComponent = defineComponent(() => {
            components({
                'ui-label': Label
            });

            template('<b><ui-label on-phase="phaser($event)"/></b>');

            method({
                phaser(e) {
                    phases[e] = true;
                }
            });
        });


        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);
        expect(phases.inited).toBeTruthy();
        expect(phases.created).toBeTruthy();
        expect(phases.attached).toBeTruthy();
        expect(phases.detached).toBeFalsy();

        myComponent.dispose();
        document.body.removeChild(wrap);
        expect(phases.detached).toBeTruthy();
    });

    it("life cycle construct", function () {
        let MyComponent = defineComponent(context => {
            template('<a><span title="{{email}}">{{name}}</span></a>');

            onConstruct(function (options) {
                expect(options.from).toBe('err');
                expect(typeof context.component.template).toBe('string');
                expect(context.component.data).toBeUndefined();
                expect(context.component.scope).toBeUndefined();
                expect(context.component.owner).toBeUndefined();
            });
        });

        let myComponent = new MyComponent({
            from: 'err',
            data: {
                'email': 'errorrik@gmail.com',
                'name': 'errorrik'
            }
        });


        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.innerHTML.indexOf('errorrik')).toBe(0);
        myComponent.dispose();
        document.body.removeChild(wrap);

    });

    it("life cycle updated", function (done) {
        let times = 0;

        let MyComponent = defineComponent(() => {
            template('<a><span title="{{email}}">{{name}}</span></a>');

            onUpdated(function () {
                times++;
            });
        });
        let myComponent = new MyComponent();
        myComponent.data.set('email', 'errorrik@gmail.com');
        myComponent.data.set('name', 'errorrik');

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        expect(times).toBe(0);

        myComponent.data.set('email', 'erik168@163.com');
        myComponent.data.set('name', 'erik');
        expect(times).toBe(0);

        san.nextTick(function () {
            expect(times).toBe(1);

            let span = wrap.getElementsByTagName('span')[0];
            expect(span.innerHTML.indexOf('erik')).toBe(0);
            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })

    });

    it("life cycle must correct when call dispose after detach immediately", function () {
        let P = defineComponent(() => {
            template('<p><slot/></p>');
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-p': P
            });

            template('<div><h3>title</h3><x-p s-ref="p">content</x-p></div>');
        });

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let myP = myComponent.ref('p');

        expect(myComponent.lifeCycle.attached).toBeTruthy();
        expect(myP.lifeCycle.attached).toBeTruthy();

        myComponent.detach();
        myComponent.dispose();

        expect(myComponent.lifeCycle.disposed).toBeTruthy();
        expect(myP.lifeCycle.disposed).toBeTruthy();
    });


    it("owner and child component life cycle, and el is ready when attached", function () {
        let uState = {};
        let U = defineComponent(context => {
            template('<u><slot></slot></u>'),

            onCompiled(function () {
                uState.compiled = 1;
            });

            onInited(function () {
                uState.inited = 1;
            });

            onCreated(function () {
                expect(context.component.el.tagName).toBe('U');
                uState.created = 1;
            });

            onAttached(function () {
                expect(context.component.el.tagName).toBe('U');
                uState.attached = 1;
            });

            onDetached(function () {
                uState.detached = 1;
            });

            onDisposed(function () {
                uState.disposed = 1;
            });
        });

        let mainState = {};
        let MyComponent = defineComponent(context => {
            components({
                'ui-u': U
            });
        
            template('<b>hello <ui-u san-ref="u">erik</ui-u></b>'),

            onCompiled(function () {
                mainState.compiled = 1;
            });

            onInited(function () {
                mainState.inited = 1;
            })

            onCreated(function () {
                expect(context.component.el.tagName).toBe('B');
                mainState.created = 1;
            })

            onAttached(function () {
                expect(context.component.el.tagName).toBe('B');
                mainState.attached = 1;
            });

            onDetached(function () {
                mainState.detached = 1;
            });

            onDisposed(function () {
                mainState.disposed = 1;
            });
        });

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = myComponent.ref('u');
        expect(myComponent.el.tagName).toBe('B');
        expect(u.el.tagName).toBe('U');

        expect(uState.inited).toBe(1);
        expect(uState.compiled).toBe(1);
        expect(uState.created).toBe(1);
        expect(uState.attached).toBe(1);
        expect(uState.detached).not.toBe(1);
        expect(uState.disposed).not.toBe(1);

        expect(!!u.lifeCycle.is('inited')).toBeTruthy();
        expect(!!u.lifeCycle.is('compiled')).toBeTruthy();
        expect(!!u.lifeCycle.is('created')).toBeTruthy();
        expect(!!u.lifeCycle.is('attached')).toBeTruthy();
        expect(!!u.lifeCycle.is('detached')).toBeFalsy();
        expect(!!u.lifeCycle.is('disposed')).toBeFalsy();


        expect(mainState.inited).toBe(1);
        expect(mainState.compiled).toBe(1);
        expect(mainState.created).toBe(1);
        expect(mainState.attached).toBe(1);
        expect(mainState.detached).not.toBe(1);
        expect(mainState.disposed).not.toBe(1);

        expect(!!myComponent.lifeCycle.is('inited')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('compiled')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('created')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('attached')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('detached')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('disposed')).toBeFalsy();

        myComponent.attach(document.body);
        expect(myComponent.el.parentNode).toBe(wrap);

        expect(!!myComponent.lifeCycle.is('inited')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('compiled')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('created')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('attached')).toBeTruthy();
        expect(!!myComponent.lifeCycle.is('detached')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('disposed')).toBeFalsy();


        myComponent.dispose();


        expect(uState.detached).toBe(1);
        expect(uState.disposed).toBe(1);
        expect(mainState.detached).toBe(1);
        expect(mainState.disposed).toBe(1);


        expect(!!u.lifeCycle.is('inited')).toBeFalsy();
        expect(!!u.lifeCycle.is('compiled')).toBeFalsy();
        expect(!!u.lifeCycle.is('created')).toBeFalsy();
        expect(!!u.lifeCycle.is('attached')).toBeFalsy();
        expect(!!u.lifeCycle.is('detached')).toBeFalsy();
        expect(!!u.lifeCycle.is('disposed')).toBeTruthy();


        expect(!!myComponent.lifeCycle.is('inited')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('compiled')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('created')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('attached')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('detached')).toBeFalsy();
        expect(!!myComponent.lifeCycle.is('disposed')).toBeTruthy();

        document.body.removeChild(wrap);
    });
});
