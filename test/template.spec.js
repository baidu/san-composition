describe('[template]: ', () => {
    it('template as static property', function () {
        let MyComponent = defineComponent(() => {
            template('<span title="{{color}}">{{color}}</span>');
        });
        let myComponent = new MyComponent({data: {color: 'red'}});

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('red');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('template as static property in inherits component', function () {
        let B = defineComponent(() => {
            template('<b title="b">b</b>');
        });

        let MyComponent = function (option) {
            B.call(this, option);
        };
        san.inherits(MyComponent, B);
        MyComponent.template = '<u title="u">u</u>';

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        let b = new B();
        b.attach(wrap);
        expect(wrap.getElementsByTagName('b').length).toBe(1);

        let myComponent = new MyComponent();
        myComponent.attach(wrap);
        expect(wrap.getElementsByTagName('b').length).toBe(1);
        expect(wrap.getElementsByTagName('u').length).toBe(1);

        b.dispose();
        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('using simple template string', function () {
        let MyComponent = defineComponent(() => {
            template`<span title="{{color}}">{{color}}</span>`;
            data('color', 'red');
        });
        
        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('red');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });


    it('using template string with vars', function () {
        let MyComponent = defineComponent(() => {
            const color1 = 'blue';
            const color2 = 'grey';
            template`
                <div>
                    <span title="${color1}">${color1}</span>
                    <span title="{{color}}">{{color}}</span>
                    <span title="${color2}">${color2}</span>
                </div>
            `;
            data('color', 'red');
        });
        
        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span0 = wrap.getElementsByTagName('span')[0];
        let span1 = wrap.getElementsByTagName('span')[1];
        let span2 = wrap.getElementsByTagName('span')[2];
        expect(span0.title).toBe('blue');
        expect(span1.title).toBe('red');
        expect(span2.title).toBe('grey');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });
});
