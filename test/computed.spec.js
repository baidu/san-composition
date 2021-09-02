describe('Computed', () => {
    it("computed", function (done) {
        var MyComponent = defineComponent(() => {
            template('<div><span title="{{name}}">{{name}}</span></div>');

            const myData = data({
                'first': 'first',
                'last': 'last'
            });

            computed({
                name: function () {
                    return myData.get('first') + ' ' + myData.get('last');
                }
            });
        });


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last');

        myComponent.data.set('last', 'xxx')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first xxx');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("static computed property", function (done) {
        var MyComponent = defineComponent(() => {
            template('<div><span title="{{name}}">{{name}}</span></div>');

            data({
                'first': 'first',
                'last': 'last'
            });
        });

        // TODO:
        return done();
        MyComponent.computed = {
            name: function () {
                return this.data.get('first') + ' ' + this.data.get('last');
            }
        };


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last');

        myComponent.data.set('last', 'xxx')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first xxx');
            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("computed has computed dependency, computed item change", function (done) {
        var MyComponent = defineComponent(() => {
            template('<div><span title="{{msg}}">{{msg}}</span></div>');

            const info = data({
                first: 'first',
                last: 'last',
                email: 'name@name.com'
            });

            computed({
                msg: function () {
                    return info.get('name') + '(' + info.get('email') + ')';
                },

                name: function () {
                    return info.get('first') + ' ' + info.get('last');
                }
            });
        });

         // TODO: computed中获取computed的值
         return done();


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last(name@name.com)');

        myComponent.data.set('last', 'xxx')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first xxx(name@name.com)');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("computed has computed dependency, normal data change", function (done) {
        var MyComponent = defineComponent(() => {
            template('<div><span title="{{msg}}">{{msg}}</span></div>');

            const info = data({
                first: 'first',
                last: 'last',
                email: 'name@name.com'
            });

            computed({
                msg: function () {
                    return info.get('name') + '(' + info.get('email') + ')'
                },
                name: function () {
                    return info.get('first') + ' ' + info.get('last');
                }
            });
        });

        // TODO:
        return done();

        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last(name@name.com)');

        myComponent.data.set('email', 'san@san.com')

        san.nextTick(function () {
            var span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first last(san@san.com)');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it("computed item compute once when init", function (done) {
        var nameCount = 0;
        var welcomeCount = 0;
        var MyComponent = defineComponent(() => {
            template('<span>{{text}}</span>');

            const info = data({
                realname: 'san',
                hello: 'hello'
            });

            computed({
                name: function () {
                    nameCount++;
                    return 'good' + info.get('realname');
                },

                text: function () {
                    return info.get('welcome') + info.get('name');
                },

                welcome: function () {
                    welcomeCount++;
                    return info.get('hello') + ' ';
                }
            });
        })


        var myComponent = new MyComponent();

        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        var span = wrap.getElementsByTagName('span')[0];

        // TODO:
        expect(span.innerHTML).toBe('hello goodsan');
        expect(nameCount).toBe(1);
        expect(welcomeCount).toBe(1);

        myComponent.dispose();
        document.body.removeChild(wrap);

    });
});