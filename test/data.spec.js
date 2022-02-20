describe('[data]: ', () => {
    it("data set in inited should not update view", function (done) {
        let up = false;
        let MyComponent = defineComponent(context => {
            template('<a><span title="{{name}}-{{email}}">{{name}}</span></a>');

            onInited(function () {
                context.data.set('name', 'errorrik');
            });

            data('name', 'erik',);

            data('email', 'errorrik@gmail.com');

            onUpdated(function () {
                up = true;
            });
        });

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
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
        let Counter = defineComponent(() => {
            template('<u on-click="add">{{num}}</u>');

            const num = data('num', 2);

            method({
                add() {
                    num.set(num.get() + 1);
                }
            });
        });

        let MyComponent = defineComponent(() => {
            components({
                'x-c': Counter
            });
            template('<div><x-c /></div>');
        });

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
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
