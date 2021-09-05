describe('[template]: ', () => {
    it("template as static property", function () {
        let MyComponent = defineComponent(() => {});
        MyComponent.template = '<span title="{{color}}">{{color}}</span>';
        let myComponent = new MyComponent({data: {color: 'red'}});

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('red');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("template as static property in inherits component", function () {
        let B = defineComponent(() => {});
        B.template = '<b title="b">b</b>';

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
});
