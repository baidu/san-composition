describe('defineComponent', () => {
    it("data set in inited should not update view", function (done) {
        var up = false;
        var MyComponent = defineComponent(() => {
            template('<a><span title="{{name}}-{{email}}">{{name}}</span></a>');

            onInited(function () {
                this.data.set('name', 'errorrik');
            });

            data({
                name: 'erik',
                email: 'errorrik@gmail.com'
            });

            onUpdated(function () {
                up = true;
            });
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('errorrik-errorrik@gmail.com');
        expect(up).toBeFalsy();

        san.nextTick(function () {
            expect(up).toBeFalsy();
            expect(span.title).toBe('errorrik-errorrik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });


    it("data set object", function (done) {
        var Counter = defineComponent(() => {
            template('<u on-click="add">{{num}}</u>');

            const dataObj = data({
                num: 2
            });

            method({
                add() {
                    dataObj.set('num', dataObj.get('num') + 1);
                }
            });
        });

        // TODO: 这里有些问题
        return done();

        var MyComponent = defineComponent(() => {
            components({
                'x-c': Counter
            });
            template('<div><x-c /></div>');
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var u = wrap.getElementsByTagName('u')[0];
        expect(u.innerHTML).toBe('2');

        triggerEvent(u, 'click');
    
        san.nextTick(function () {
            expect(u.innerHTML).toBe('3');
            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });
});
