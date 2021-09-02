describe('template', () => {
    it("template as static property", function () {
        var MyComponent = defineComponent(() => {});
        MyComponent.template = '<span title="{{color}}">{{color}}</span>';
        var myComponent = new MyComponent({data: {color: 'red'}});

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('red');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it("template as static property in inherits component", function () {
        var B = defineComponent(() => {});
        B.template = '<b title="b">b</b>';

        var MyComponent = function (option) {
            B.call(this, option);
        };
        san.inherits(MyComponent, B);
        MyComponent.template = '<u title="u">u</u>';

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        var b = new B();
        b.attach(wrap);
        expect(wrap.getElementsByTagName('b').length).toBe(1);

        var myComponent = new MyComponent();
        myComponent.attach(wrap);
        expect(wrap.getElementsByTagName('b').length).toBe(1);
        expect(wrap.getElementsByTagName('u').length).toBe(1);

        b.dispose();
        myComponent.dispose();
        document.body.removeChild(wrap);
    });
});
