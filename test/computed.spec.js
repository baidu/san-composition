describe('[Computed]: ', () => {
    it('computed', function (done) {
        let MyComponent = defineComponent(() => {
            template('<div><span title="{{name}}">{{name}}</span></div>');

            const first = data('first', 'first');
            const last = data('last', 'last');

            computed('name', function () {
                return first.get('') + ' ' + last.get('');
            });
        });


        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last');

        myComponent.data.set('last', 'baidu')

        san.nextTick(function () {
            let span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first baidu');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it('static computed property', function (done) {
        let MyComponent = defineComponent(() => {
            template('<div><span title="{{name}}">{{name}}</span></div>');
            data('first', 'first');
            data('last', 'last');
        });

        MyComponent.computed = {
            name: function () {
                return this.data.get('first') + ' ' + this.data.get('last');
            }
        };

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last');

        myComponent.data.set('last', 'baidu');

        san.nextTick(function () {
            let span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first baidu');
            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it('computed has computed dependency, computed item change', function (done) {
        let MyComponent = defineComponent(() => {
            template('<div><span title="{{msg}}">{{msg}}</span></div>');

            const info = data('info', {
                first: 'first',
                last: 'last',
                email: 'name@name.com'
            });

            const name = computed('name', function () {
                return info.get('first') + ' ' + info.get('last');
            });

            computed('msg', function () {
                return name.get() + '(' + info.get('email') + ')'
            });
        });


        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last(name@name.com)');

        myComponent.data.set('info.last', 'xiaodu')

        san.nextTick(function () {
            let span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first xiaodu(name@name.com)');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it('computed has computed dependency, normal data change', function (done) {
        let MyComponent = defineComponent(() => {
            template('<div><span title="{{msg}}">{{msg}}</span></div>');

            const info = data('info', {
                first: 'first',
                last: 'last',
                email: 'name@name.com'
            });

            const name = computed('name', function () {
                return info.get('first') + ' ' + info.get('last');
            });

            computed('msg', function () {
                return name.get() + '(' + info.get('email') + ')'
            });
        });

        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];
        expect(span.title).toBe('first last(name@name.com)');

        myComponent.data.set('info.email', 'san@san.com')

        san.nextTick(function () {
            let span = wrap.getElementsByTagName('span')[0];
            expect(span.title).toBe('first last(san@san.com)');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it('computed item compute once when init', function () {
        let nameCount = 0;
        let welcomeCount = 0;
        let MyComponent = defineComponent(() => {
            template('<span>{{text}}</span>');

            const info = data('info', {
                realname: 'san',
                hello: 'hello'
            });

            const name = computed('name', function () {
                nameCount++;
                return 'good' + info.get('realname');
            });

            const welcome = computed('welcome', function () {
                welcomeCount++;
                return info.get('hello') + ' ';
            });

            const text = computed('text', function () {
                return welcome.get() + name.get();
            });
        });


        let myComponent = new MyComponent();

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let span = wrap.getElementsByTagName('span')[0];

        expect(span.innerHTML).toBe('hello goodsan');
        expect(nameCount).toBe(1);
        expect(welcomeCount).toBe(1);

        myComponent.dispose();
        document.body.removeChild(wrap);
    });
});
