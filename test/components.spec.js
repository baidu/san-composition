describe('components', () => {
    // TODO:
    // it("components function", function () {
    //     var MyComponent = defineComponent(() => {
    //         template('<div><ui-label text="erik"></ui-label>');

    //         components({
    //             'ui-label': defineComponent(() => {
    //                 template('<span title="{{text}}">{{text}}</span>')
    //             })  
    //         });
    //     });

    //     var myComponent = new MyComponent();

    //     var wrap = document.createElement('div');
    //     document.body.appendChild(wrap);
    //     myComponent.attach(wrap);

    //     var span = wrap.getElementsByTagName('span')[0];
    //     expect(span.title).toBe('erik');

    //     myComponent.dispose();
    //     document.body.removeChild(wrap);
    // });

    // it("components use s-is", function () {
    //     var Label = defineComponent(() => {
    //         template('<span title="{{text}}">{{text}}</span>');
    //         data({
    //             text: 'erik'
    //         });
    //     });

    //     var MyComponent = defineComponent(() => {
    //         components({
    //             'x-label': Label,
    //         });
            
    //         data({
    //             cmpt: 'x-label'
    //         });
    //     });

    //     MyComponent.template = '<div><test s-is="cmpt"/></div>';

    //     var myComponent = new MyComponent();

    //     var wrap = document.createElement('div');
    //     document.body.appendChild(wrap);
    //     myComponent.attach(wrap);

    //     var span = wrap.getElementsByTagName('span')[0];
    //     expect(span.title).toBe('erik');

    //     myComponent.dispose();
    //     document.body.removeChild(wrap);
    // });

    // it("s-is value update", function (done) {
    //     var Label = defineComponent(() => {
    //         template('<span title="{{text}}" >{{text}}</span>');
    //         data(() => {
    //             return {
    //                 text: 'erik'
    //             }
    //         });
    //     });

    //     var H2 = defineComponent(() => {
    //         template('<h2>{{text}}.baidu</h2>');
    //         data({
    //             text: 'erik'
    //         });
    //     });

    //     var MyComponent = defineComponent(() => {
    //         components({
    //             'x-label': Label,
    //             'x-h2': H2
    //         })
    //         data({
    //             cmpt: 'x-label'
    //         });
    //     });

    //     MyComponent.template = '<div><test s-is="cmpt"/></div>';

    //     var myComponent = new MyComponent();

    //     var wrap = document.createElement('div');
    //     document.body.appendChild(wrap);
    //     myComponent.attach(wrap);

    //     var span = wrap.getElementsByTagName('span')[0];
    //     expect(span.title).toBe('erik');

    //     myComponent.data.set('cmpt', 'x-h2');
    //     san.nextTick(function () {
    //         var h2 = wrap.getElementsByTagName('h2')[0];
    //         expect(h2.innerHTML.indexOf('erik.baidu')).toBe(0);

    //         myComponent.dispose();
    //         document.body.removeChild(wrap);
    //         done();
    //     });
    // });

    // it("s-is component which fragment rooted", function (done) {
    //     var Frag = defineComponent(() => {
    //         template('<fragment><b>icon</b><slot></slot></fragment>');
    //     });

    //     var U = defineComponent(() => {
    //         template('<u><slot/></u>');
    //     });

    //     var MyComponent = defineComponent(() => {
    //         components({
    //             'x-f': Frag,
    //             'x-u': U
    //         });
            
    //         data({
    //             cmpt: 'x-f'
    //         });

    //         template('<p><test s-is="cmpt">erik</test></p>');
    //     });


    //     var myComponent = new MyComponent();

    //     var wrap = document.createElement('div');
    //     document.body.appendChild(wrap);
    //     myComponent.attach(wrap);

    //     var p = wrap.getElementsByTagName('p')[0];
    //     expect(p.getElementsByTagName('b').length).toBe(1);
    //     expect(p.getElementsByTagName('u').length).toBe(0);
    //     expect(p.innerHTML).toContain('erik');

    //     myComponent.data.set('cmpt', 'x-u');

    //     san.nextTick(function () {
    //         expect(p.getElementsByTagName('b').length).toBe(0);
    //         expect(p.getElementsByTagName('u').length).toBe(1);
    //         expect(p.getElementsByTagName('u')[0].innerHTML).toContain('erik');

    //         myComponent.dispose();
    //         document.body.removeChild(wrap);
    //         done();
    //     });
    // });

    // it("s-is for html element and component", function (done) {
    //     var Label = defineComponent(() => {
    //         template('<b><slot/></b>');
    //     });

    //     var MyComponent = defineComponent(() => {
    //         components({
    //             'x-label': Label
    //         });
            
    //         data(function () {
    //             return {
    //                 cmpt: 'h1',
    //                 text: 'hello'
    //             }
    //         });

    //         template('<div><span s-is="cmpt" id="comp">{{text}}</span></div>');
    //     });


    //     var myComponent = new MyComponent();

    //     var wrap = document.createElement('div');
    //     document.body.appendChild(wrap);
    //     myComponent.attach(wrap);

    //     var el = wrap.getElementsByTagName('div')[0].firstChild;
    //     expect(el.id).toBe('comp');
    //     expect(el.tagName).toBe('H1');
    //     expect(el.innerHTML).toContain('hello');

    //     myComponent.data.set('cmpt', '');
    //     myComponent.nextTick(function () {
    //         var el = wrap.getElementsByTagName('div')[0].firstChild;
    //         expect(el.id).toBe('comp');
    //         expect(el.tagName).toBe('SPAN');
    //         expect(el.innerHTML).toContain('hello');

    //         myComponent.data.set('cmpt', 'x-label');
    //         san.nextTick(function () {
    //             var el = wrap.getElementsByTagName('div')[0].firstChild;
    //             expect(el.id).toBe('comp');
    //             expect(el.tagName).toBe('B');
    //             expect(el.innerHTML).toContain('hello');

    //             myComponent.data.set('cmpt', 'u');
    //             san.nextTick(function () {
    //                 var el = wrap.getElementsByTagName('div')[0].firstChild;
    //                 expect(el.id).toBe('comp');
    //                 expect(el.tagName).toBe('U');
    //                 expect(el.innerHTML).toContain('hello');

    //                 myComponent.dispose();
    //                 document.body.removeChild(wrap);
    //                 done();
    //             });
    //         });
    //     });
    // });
});
