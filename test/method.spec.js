
describe('[method]: ', () => {
    it('method decaration and call', function (done) {
        const MyComponent = defineComponent(context => {
            template('<div><b title="{{value}}">{{value}}</b>'
                + '<ul class="ui-colorpicker">'
                +    '<li '
                +        'san-for="item in datasource" '
                +        'style="background: {{item}}" '
                +        'class="{{item == value ? \'selected\' : \'\'}}" '
                +        'on-click="itemClick(item)"'
                +    '></li>'
                + '</ul></div>');

            const datasource = data('datasource', [
                'red', 'blue', 'yellow', 'green'
            ]);

            let value = data('value', 'red');
            
            let {itemClick} = method({
                itemClick: function (item) {
                    value.set(item);
                }
            });

            onAttached(() => {
                setTimeout(() => {
                    itemClick('green');
                }, 200);
            })
        });

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let b = wrap.getElementsByTagName('b')[0];
        expect(b.title).toBe('red');

        setTimeout(() => {
            let b = wrap.getElementsByTagName('b')[0];
            expect(b.title).toBe('green');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        }, 1000);

    });
});
