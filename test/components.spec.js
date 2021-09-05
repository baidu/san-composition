describe('[components]: ', () => {
    it("components function", function () {
        let MyComponent = defineComponent(() => {
            template('<div><ui-label text="erik"></ui-label>');

            components({
                'ui-label': defineComponent(() => {
                    template(`
                        <div>
                            <span title="{{text}}">{{text}}</span>
                            <ui-label-junior></ui-label-junior>
                        </div>
                    `);

                    components({
                        'ui-label-junior': defineComponent(() => {
                            template(`
                                <div>
                                    <span title="{{text}}">{{text}}</span>
                                </div>
                            `);
                            data({
                                text: 'Hello'
                            });
                        })
                    });
                })
            });
        });

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('erik');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("components use s-is", function () {
        let Label = defineComponent(() => {
            template('<span title="{{text}}">{{text}}</span>');
            data({
                text: 'erik'
            });
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-label': Label,
            });
            
            data({
                cmpt: 'x-label'
            });
        });

        MyComponent.template = '<div><test s-is="cmpt"/></div>';

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('erik');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("s-is value update", function (done) {
        let Label = defineComponent(() => {
            template('<span title="{{text}}" >{{text}}</span>');
            data({text: 'erik'});
        });

        let H2 = defineComponent(() => {
            template('<h2>{{text}}.baidu</h2>');
            data({
                text: 'erik'
            });
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-label': Label,
                'x-h2': H2
            })
            data({
                cmpt: 'x-label'
            });
        });

        MyComponent.template = '<div><test s-is="cmpt"/></div>';

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('erik');

        myComponent.data.set('cmpt', 'x-h2');
        san.nextTick(function () {
            let h2 = wrap.getElementsByTagName('h2')[0];
            expect(h2.innerHTML.indexOf('erik.baidu')).toBe(0);

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("s-is component which fragment rooted", function (done) {
        let Frag = defineComponent(() => {
            template('<fragment><b>icon</b><slot></slot></fragment>');
        });

        let U = defineComponent(() => {
            template('<u><slot/></u>');
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-f': Frag,
                'x-u': U
            });
            
            data({
                cmpt: 'x-f'
            });

            template('<p><test s-is="cmpt">erik</test></p>');
        });


        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let p = wrap.getElementsByTagName('p')[0];
        expect(p.getElementsByTagName('b').length).toBe(1);
        expect(p.getElementsByTagName('u').length).toBe(0);
        expect(p.innerHTML).toContain('erik');

        myComponent.data.set('cmpt', 'x-u');

        san.nextTick(function () {
            expect(p.getElementsByTagName('b').length).toBe(0);
            expect(p.getElementsByTagName('u').length).toBe(1);
            expect(p.getElementsByTagName('u')[0].innerHTML).toContain('erik');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it("s-is for html element and component", function (done) {
        let Label = defineComponent(() => {
            template('<b><slot/></b>');
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-label': Label
            });
            
            data({
                    cmpt: 'h1',
                    text: 'hello'
                });

            template('<div><span s-is="cmpt" id="comp">{{text}}</span></div>');
        });


        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let el = wrap.getElementsByTagName('div')[0].firstChild;
        expect(el.id).toBe('comp');
        expect(el.tagName).toBe('H1');
        expect(el.innerHTML).toContain('hello');

        myComponent.data.set('cmpt', '');
        myComponent.nextTick(function () {
            let el = wrap.getElementsByTagName('div')[0].firstChild;
            expect(el.id).toBe('comp');
            expect(el.tagName).toBe('SPAN');
            expect(el.innerHTML).toContain('hello');

            myComponent.data.set('cmpt', 'x-label');
            san.nextTick(function () {
                let el = wrap.getElementsByTagName('div')[0].firstChild;
                expect(el.id).toBe('comp');
                expect(el.tagName).toBe('B');
                expect(el.innerHTML).toContain('hello');

                myComponent.data.set('cmpt', 'u');
                san.nextTick(function () {
                    let el = wrap.getElementsByTagName('div')[0].firstChild;
                    expect(el.id).toBe('comp');
                    expect(el.tagName).toBe('U');
                    expect(el.innerHTML).toContain('hello');

                    myComponent.dispose();
                    document.body.removeChild(wrap);
                    done();
                });
            });
        });
    });
});
